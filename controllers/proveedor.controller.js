const ProveedorService = require('../services/proveedor.service');
const { validationResult } = require('express-validator');

class ProveedorController {

  async crearProveedor(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const resultado = await ProveedorService.crearProveedor(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async actualizarProveedor(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_proveedor } = req.params;
      const resultado = await ProveedorService.actualizarProveedor(id_proveedor, req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listarProveedores(req, res, next) {
    try {
      const proveedores = await ProveedorService.listarProveedores();
      res.json(proveedores);
    } catch (error) {
      next(error);
    }
  }

  async listarProveedoresActivos(req, res, next) {
    try {
      const proveedores = await ProveedorService.listarActivos();
      res.json(proveedores);
    } catch (error) {
      next(error);
    }
  }

  async obtenerProveedorPorId(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_proveedor } = req.params;
      const proveedor = await ProveedorService.obtenerProveedorPorId(id_proveedor);
      res.json(proveedor);
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstadoProveedor(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_proveedor } = req.params;
      const { activo } = req.body;
      const resultado = await ProveedorService.cambiarEstado(id_proveedor, activo);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async eliminarProveedor(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_proveedor } = req.params;
      const resultado = await ProveedorService.eliminarProveedor(id_proveedor);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProveedorController();