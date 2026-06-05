const ProductoModel = require('../models/producto.model');

class ProductoService {
  
  // ============ PRODUCTOS ============
  async crearProducto(data, file) {
    const imagen = file?.filename || null;
    const nuevoId = await ProductoModel.crearProducto({ ...data, imagen });

    if (data.cantidad !== undefined && data.id_local) {
      await ProductoModel.crearStock({
        id_producto: nuevoId,
        id_local: data.id_local,
        cantidad: data.cantidad,
        activo: 'Si'
      });
    }

    return { id_producto: nuevoId, mensaje: 'Producto creado correctamente' };
  }

  async actualizarProducto(id_producto, data, tieneImagen = false) {
    const { cantidad, id_local, ...restoData } = data;
    await ProductoModel.actualizarProducto(id_producto, restoData, id_local, cantidad);
    return { mensaje: 'Producto actualizado correctamente' };
  }

  async obtenerTodosLosProductosConStockTotal() {
    return await ProductoModel.obtenerTodosLosProductosConStockTotal();
  }

  async obtenerProductosConStock(idLocal) {
    return await ProductoModel.obtenerProductosConStock(idLocal);
  }

  async obtenerProductosPorLocal(idLocal) {
    return await ProductoModel.obtenerProductosPorLocal(idLocal);
  }


  async obtenerProductosActivos() {
    return await ProductoModel.obtenerProductosActivos();
  }

  async obtenerProductosActivosConStock(idLocal) {
    return await ProductoModel.obtenerProductosActivosPorLocal(idLocal);
  }

  async obtenerProductosVendidos(idLocal) {
    return await ProductoModel.obtenerProductosVendidos(idLocal);
  }

  async obtenerProductosNoVendidos(idLocal) {
    return await ProductoModel.obtenerProductosNoVendidos(idLocal);
  }

  async obtenerProductosBajoStock(idLocal) {
    return await ProductoModel.obtenerProductosBajoStock(idLocal);
  }

  async obtenerProductosNoAsignados(idLocal) {
    return await ProductoModel.obtenerProductosNoAsignados(idLocal);
  }

  async activarProducto(id_producto) {
    const affected = await ProductoModel.activarProducto(id_producto);
    if (affected === 0) throw new Error('Producto no encontrado');
    return { message: 'Producto activado exitosamente' };
  }

  async desactivarProducto(id_producto) {
    const affected = await ProductoModel.desactivarProducto(id_producto);
    if (affected === 0) throw new Error('Producto no encontrado');
    return { message: 'Producto desactivado exitosamente' };
  }

  // ============ STOCK ============

  async obtenerStockPorSucursales(id_producto, userId) {
    return await ProductoModel.obtenerStockPorSucursales(id_producto, userId);
  }

  async obtenerStockTodasSucursales(id_producto) {
    return await ProductoModel.obtenerStockTodasSucursales(id_producto);
  }

  async transferirStock(data) {
    const { id_producto, id_local_origen, id_local_destino, cantidad } = data;
    await ProductoModel.transferirStock(id_producto, id_local_origen, id_local_destino, cantidad);
    return { success: true, message: 'Transferencia exitosa' };
  }

  async asignarProductoALocal(data) {
    await ProductoModel.crearStock(data);
    return { success: true, message: 'Producto asignado al local' };
  }

  async desactivarProductoEnLocal(id_producto, id_local) {
    await ProductoModel.desactivarEnLocal(id_producto, id_local);
    return { success: true, message: 'Producto desactivado en este local' };
  }

  async buscarProductos(busqueda) {
    return await ProductoModel.buscarProductosEnSucursales(busqueda || '');
  }

  async obtenerSucursalesUsuario(userId) {
    return await ProductoModel.obtenerSucursalesUsuario(userId);
  }
}

module.exports = new ProductoService();