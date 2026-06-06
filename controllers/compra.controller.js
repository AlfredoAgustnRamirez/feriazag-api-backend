const CompraService = require('../services/compra.service');
const { validationResult } = require('express-validator');

class CompraController {

  async listarCompras(req, res, next) {
    try {
      const compras = await CompraService.listarCompras();
      res.json(compras);
    } catch (error) {
      next(error);
    }
  }

  async confirmarRecepcion(req, res, next) {
    try {
        const { id } = req.params;
        const resultado = await CompraService.confirmarRecepcion(id);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
}

  async obtenerCompraPorId(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id } = req.params;
      const compra = await CompraService.obtenerCompraPorId(id);
      res.json(compra);
    } catch (error) {
      next(error);
    }
  }

  async crearCompra(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        mensaje: 'Error de validación',
        errores: errors.array() 
      });
    }
    
    const userId = req.usuario?.id_usuario;
    const resultado = await CompraService.crearCompra(req.body, userId);
    res.status(201).json(resultado);
  } catch (error) {
    console.error('Error en crearCompra:', error.message);
    res.status(400).json({ mensaje: error.message });
  }
}

async getProductosPorLocal(req, res) {
    try {
        const { id_local } = req.params;
        const productos = await CompraService.listarProductosActivos(id_local);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

  async listarProveedoresActivos(req, res, next) {
    try {
      const proveedores = await CompraService.listarProveedoresActivos();
      res.json(proveedores);
    } catch (error) {
      next(error);
    }
  }

  async listarProductosActivos(req, res, next) {
    try {
      const productos = await CompraService.listarProductosActivos();
      res.json(productos);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompraController();