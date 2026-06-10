const ProductoModel = require('../models/producto.model');

class ProductoService {

  // ============ PRODUCTOS ============
  async crearProducto(data, file) {
    const imagen = file?.filename || null;
    const { cod_producto, cantidad, id_local } = data;

    if (cod_producto) {
      const existente = await ProductoModel.findByCodigo(cod_producto);
      if (existente) {
        throw new Error(`Ya existe un producto con el código ${cod_producto}`);
      }
    }

    const nuevoId = await ProductoModel.crearProducto({ ...data, imagen });

    if (cantidad !== undefined && id_local) {
      await ProductoModel.crearStock({
        id_producto: nuevoId,
        id_local: id_local,
        cantidad: cantidad,
        activo: 'Si'
      });
    }

    return { id_producto: nuevoId, mensaje: 'Producto creado correctamente' };
  }

  async actualizarProducto(id, data, file) {
    const { cod_producto } = data;

    // Validar código duplicado (excluyendo el producto actual)
    if (cod_producto) {
      const existente = await ProductoModel.findByCodigoExcludingId(cod_producto, id);
      if (existente) {
        throw new Error(`Ya existe otro producto con el código ${cod_producto}`);
      }
    }

    const productoActual = await ProductoModel.findById(id);

    if (!productoActual) {
      throw new Error('Producto no encontrado');
    }

    let imagenFinal = productoActual.imagen;

    if (file) {
      // Si hay nueva imagen, usar la nueva
      imagenFinal = file.filename;

      // Opcional: Eliminar la imagen vieja del servidor
      if (productoActual.imagen) {
        const fs = require('fs');
        const path = require('path');
        const oldImagePath = path.join(__dirname, '../uploads', productoActual.imagen);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    await ProductoModel.actualizarProducto(id, {
      ...data,
      imagen: imagenFinal
    });

    return {
      mensaje: 'Producto actualizado correctamente',
      imagen: imagenFinal
    };
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