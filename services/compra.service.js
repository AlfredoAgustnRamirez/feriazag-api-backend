const CompraModel = require('../models/compra.model');

class CompraService {

  async listarCompras() {
    const compras = await CompraModel.listarCompras();
    return compras.map(compra => ({
      ...compra,
      subtotal: Number(compra.subtotal),
      iva: Number(compra.iva),
      total: Number(compra.total)
    }));
  }

  async obtenerCompraPorId(id_compra) {
    const compra = await CompraModel.obtenerCompraPorId(id_compra);
    if (!compra) {
        throw new Error('Compra no encontrada');
    }
    return {
        ...compra,
        subtotal: Number(compra.subtotal),
        iva: Number(compra.iva),
        total: Number(compra.total),
        productos: compra.productos.map(p => ({
            ...p,
            precio_compra: Number(p.precio_compra),
            subtotal: Number(p.subtotal)
        }))
    };
}

  async crearCompra(data, userId) {
    const { id_proveedor, fecha, numero_factura, subtotal, iva, total, detalles, id_local } = data;

    const id_compra = await CompraModel.crearCompra({
      id_proveedor,
      id_usuario: userId,
      id_local: id_local || 18,
      fecha: fecha || new Date().toISOString().split('T')[0],
      numero_factura,
      subtotal,
      iva,
      total,
      estado: 'pendiente'
    });

    const detallesConPrecio = detalles.map(d => ({
      id_producto: d.id_producto,
      cantidad: d.cantidad,
      precio_compra: d.precio_compra || d.precio_costo || d.precio,
      subtotal: (d.precio_compra || d.precio_costo || d.precio) * d.cantidad
    }));

    await CompraModel.crearDetallesCompra(id_compra, detallesConPrecio);


    return { id_compra, mensaje: 'Orden de compra creada correctamente' };
  }

  async confirmarRecepcion(id_compra) {

    const compra = await CompraModel.obtenerCompraPorId(id_compra);

    if (!compra) {
      throw new Error('Compra no encontrada');
    }

    if (compra.estado !== 'pendiente') {
      throw new Error('Solo se pueden recibir compras en estado pendiente');
    }

    const id_local = compra.id_local;

    if (!id_local) {
      throw new Error('La compra no tiene un local asociado');
    }

    for (const detalle of compra.productos) {
      await CompraModel.actualizarStockProducto(detalle.id_producto, detalle.cantidad, id_local);
    }
    await CompraModel.actualizarEstado(id_compra, 'recibida');
    return { mensaje: 'Compra recibida y stock actualizado correctamente' };
  }

  async listarProductosActivos(id_local) {
    const productos = await CompraModel.listarProductosActivos(id_local);
    return productos.map(p => ({
      ...p,
      precio: Number(p.precio),
      cantidad: Number(p.cantidad)
    }));
  }

  async listarProveedoresActivos() {
    return await CompraModel.listarProveedoresActivos();
  }

  async listarProductosActivos() {
    const productos = await CompraModel.listarProductosActivos();
    return productos.map(p => ({
      ...p,
      precio: Number(p.precio),
      cantidad: Number(p.cantidad)
    }));
  }
}

module.exports = new CompraService();