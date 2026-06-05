const CategoriaService = require('../services/categoria.service');
const { validationResult } = require('express-validator');

class CategoriaController {

  async listarCategorias(req, res, next) {
    try {
      const categorias = await CategoriaService.listarCategorias();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }

  async listarCategoriasActivas(req, res, next) {
    try {
      const categorias = await CategoriaService.listarCategoriasActivas();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }

  async obtenerCategoriaPorId(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_categoria } = req.params;
      const categoria = await CategoriaService.obtenerCategoriaPorId(id_categoria);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  }

  async crearCategoria(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const resultado = await CategoriaService.crearCategoria(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async actualizarCategoria(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_categoria } = req.params;
      const resultado = await CategoriaService.actualizarCategoria(id_categoria, req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_categoria } = req.params;
      const { activo } = req.body;
      const resultado = await CategoriaService.cambiarEstado(id_categoria, activo);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /eliminar/:id_categoria
  async eliminarCategoria(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { id_categoria } = req.params;
      const resultado = await CategoriaService.eliminarCategoria(id_categoria);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoriaController();