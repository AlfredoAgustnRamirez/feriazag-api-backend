const ProductoService = require('../services/producto.service');
const { validationResult } = require('express-validator');

class ProductoController {

  // ============ PRODUCTOS ============
  
  /**
   * Crear un nuevo producto
   * POST /api/producto/crear
   */
  async crearProducto(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errores: errors.array() });
        }

        // ✅ Pasar el archivo (imagen) si existe
        const resultado = await ProductoService.crearProducto(req.body, req.file);
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Error en crearProducto:', error.message);
        res.status(400).json({ 
            mensaje: error.message,
            success: false 
        });
    }
  }

  /**
   * Actualizar un producto existente
   * PUT /api/producto/actualizar/:id_producto
   */
  async actualizarProducto(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id_producto } = req.params;
      
      // ✅ Pasar el archivo (si existe) y los flags de imagen
      const resultado = await ProductoService.actualizarProducto(
        id_producto, 
        req.body, 
        req.file,           // ← Pasar el archivo, no un booleano
        req.body.mantener_imagen === 'true',  // ← Flag para mantener imagen
        req.body.eliminar_imagen === 'true'   // ← Flag para eliminar imagen
      );
      
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // ============ OBTENER PRODUCTOS ============

  async obtenerTodosLosProductos(req, res, next) {
    try {
      const productos = await ProductoService.obtenerTodosLosProductos();
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerTodosLosProductosConStockTotal(req, res, next) {
    try {
      const productos = await ProductoService.obtenerTodosLosProductosConStockTotal();
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProductosConStock(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const productos = await ProductoService.obtenerProductosConStock(idLocal);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProductosPorLocal(req, res, next) {
    try {
      const { idLocal } = req.params;
      const productos = await ProductoService.obtenerProductosPorLocal(idLocal);
      res.json(productos);
    } catch (error) {
      console.error('Error en obtenerProductosPorLocal:', error);
      next(error);
    }
  }

  async obtenerProductosActivos(req, res, next) {
    try {
      const productos = await ProductoService.obtenerProductosActivos();
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProductosVendidos(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const productos = await ProductoService.obtenerProductosVendidos(idLocal);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProductosNoVendidos(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const productos = await ProductoService.obtenerProductosNoVendidos(idLocal);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProductosBajoStock(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const productos = await ProductoService.obtenerProductosBajoStock(idLocal);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProductosNoAsignados(req, res, next) {
    try {
      const { idLocal } = req.params;
      const productos = await ProductoService.obtenerProductosNoAsignados(idLocal);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  // ============ ACTIVAR/DESACTIVAR ============

  async activarProducto(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id_producto } = req.params;
      const resultado = await ProductoService.activarProducto(id_producto);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async desactivarProducto(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id_producto } = req.params;
      const resultado = await ProductoService.desactivarProducto(id_producto);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // ============ STOCK ============

  async obtenerStockPorSucursales(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id_producto } = req.params;
      const userId = req.usuario?.id_usuario;
      const stock = await ProductoService.obtenerStockPorSucursales(id_producto, userId);
      res.json(stock);
    } catch (error) {
      next(error);
    }
  }

  async obtenerStockTodasSucursales(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id_producto } = req.params;
      const stock = await ProductoService.obtenerStockTodasSucursales(id_producto);
      res.json(stock);
    } catch (error) {
      next(error);
    }
  }

  async transferirStock(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const resultado = await ProductoService.transferirStock(req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async asignarProductoALocal(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const resultado = await ProductoService.asignarProductoALocal(req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async desactivarProductoEnLocal(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }

      const { id_producto, id_local } = req.params;
      const resultado = await ProductoService.desactivarProductoEnLocal(id_producto, id_local);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // ============ BÚSQUEDA ============

  async buscarProductos(req, res, next) {
    try {
      const { busqueda } = req.query;
      const productos = await ProductoService.buscarProductos(busqueda);
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }

  // ============ SUCURSALES ============

  async obtenerSucursalesUsuario(req, res, next) {
    try {
      const userId = req.usuario?.id_usuario;
      const sucursales = await ProductoService.obtenerSucursalesUsuario(userId);
      res.json(sucursales);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductoController();