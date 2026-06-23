// producto.service.js
const ProductoModel = require('../models/producto.model');
const CategoriaModel = require('../models/categoria.model'); 

class ProductoService {

  // ============ PRODUCTOS ============

  /**
   * Generar código automático basado en la categoría
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<string>} Código generado (ej: REM001)
   */
  async generarCodigoPorCategoria(id_categoria) {
    // 1. Obtener el nombre de la categoría
    const categoria = await CategoriaModel.findById(id_categoria);
    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    // 2. Generar prefijo (primeras 3 letras en mayúscula)
    const prefijo = categoria.descripcion.substring(0, 3).toUpperCase();

    // 3. Buscar el último código de esa categoría
    const ultimo = await ProductoModel.obtenerUltimoCodigoPorCategoria(id_categoria);

    if (!ultimo) {
      return `${prefijo}001`;
    }

    // 4. Extraer el número del código
    const codigoActual = ultimo.cod_producto;
    const numero = parseInt(codigoActual.replace(prefijo, ''));

    if (isNaN(numero)) {
      return `${prefijo}001`;
    }

    // 5. Incrementar y formatear con 3 dígitos
    const nuevoNumero = numero + 1;
    const nuevoCodigo = `${prefijo}${String(nuevoNumero).padStart(3, '0')}`;

    return nuevoCodigo;
  }

  async crearProducto(data, file) {
    const imagen = file?.filename || null;
    const { cod_producto, cantidad, id_local } = data;

    // ✅ Si no viene código o está vacío, generarlo automáticamente
    if (!cod_producto || cod_producto.trim() === '') {
      if (!data.id_categoria) {
        throw new Error('Debe seleccionar una categoría para generar el código');
      }
      data.cod_producto = await this.generarCodigoPorCategoria(data.id_categoria);
    }

    // ✅ Validar código único (SOLO UNA VEZ)
    const existente = await ProductoModel.findByCodigo(data.cod_producto);
    if (existente) {
      throw new Error(`Ya existe un producto con el código ${data.cod_producto}`);
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
    const { cod_producto, cantidad, id_local } = data;

    // Validar código duplicado
    if (cod_producto) {
      const existente = await ProductoModel.findByCodigoExcludingId(cod_producto, id);
      if (existente) {
        throw new Error(`Ya existe otro producto con el código ${cod_producto}`);
      }
    }

    // Obtener el producto actual para mantener la imagen si no hay nueva
    const productoActual = await ProductoModel.findById(id);

    if (!productoActual) {
      throw new Error('Producto no encontrado');
    }

    // Determinar la imagen: SOLO si viene un archivo nuevo
    let imagenFinal = productoActual.imagen;

    if (file) {
      imagenFinal = file.filename;

      const fs = require('fs');
      const path = require('path');
      if (productoActual.imagen) {
        const oldImagePath = path.join(__dirname, '../uploads', productoActual.imagen);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updateData = {
      cod_producto: data.cod_producto,
      id_categoria: data.id_categoria,
      descripcion: data.descripcion,
      talle: data.talle,
      precio: data.precio,
      activo: data.activo,
      imagen: imagenFinal
    };

    await ProductoModel.actualizarProducto(
      parseInt(id),
      updateData,
      id_local ? parseInt(id_local) : null,
      cantidad !== undefined ? parseInt(cantidad) : undefined
    );

    return {
      mensaje: 'Producto actualizado correctamente',
      success: true
    };
  }

  // ============ OBTENER PRODUCTOS ============

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