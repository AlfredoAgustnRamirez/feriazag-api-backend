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
    const { id_proveedor, fecha, numero_factura, subtotal, iva, total, detalles } = data;
    
    if (!id_proveedor) {
      throw new Error('El proveedor es requerido');
    }
    
    if (!detalles || detalles.length === 0) {
      throw new Error('Debe incluir al menos un producto');
    }
    
    // Validar que todos los productos tengan cantidad
    for (const detalle of detalles) {
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        throw new Error(`La cantidad del producto ${detalle.id_producto} es inválida`);
      }
    }
    
    // Crear compra
    const id_compra = await CompraModel.crearCompra({
      id_proveedor,
      id_usuario: userId,
      fecha: fecha || new Date().toISOString().split('T')[0],
      numero_factura,
      subtotal,
      iva,
      total,
      estado: 'recibida'
    });
    
    // Crear detalles
    await CompraModel.crearDetallesCompra(id_compra, detalles);
    
    // Actualizar stock de productos
    for (const detalle of detalles) {
      await CompraModel.actualizarStockProducto(detalle.id_producto, detalle.cantidad);
    }
    
    return { id_compra, mensaje: 'Compra registrada correctamente' };
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