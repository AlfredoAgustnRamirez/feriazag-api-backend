const BitacoraService = require('../services/bitacora.service');
const { validationResult } = require('express-validator');

class BitacoraController {

  async registrar(req, res, next) {
    try {
      const body = req.body || {};
      
      // Obtener datos del usuario del token
      const id_usuario = req.usuario?.id_usuario || req.usuario?.userId;
      let nombre_usuario = body.nombre_usuario;
      
      if (!nombre_usuario && req.usuario) {
        nombre_usuario = `${req.usuario.nombre || ''} ${req.usuario.apellido || ''}`.trim();
      }
      if (!nombre_usuario) {
        nombre_usuario = 'Usuario';
      }
      
      const ip_address = body.ip_address || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const user_agent = body.user_agent || req.headers['user-agent'] || 'desconocido';
      
      const resultado = await BitacoraService.registrar({
        id_usuario,
        nombre_usuario,
        accion: body.accion,
        entidad: body.entidad,
        id_registro: body.id_registro,
        valor_anterior: body.valor_anterior,
        valor_nuevo: body.valor_nuevo,
        ip_address,
        user_agent
      });
      
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const filtros = {
        accion: req.query.accion,
        entidad: req.query.entidad,
        usuario: req.query.usuario,
        inicio: req.query.inicio,
        fin: req.query.fin
      };
      
      const registros = await BitacoraService.listar(filtros);
      res.json(registros);
    } catch (error) {
      next(error);
    }
  }

  async listarPorUsuario(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const registros = await BitacoraService.listarPorUsuario(id_usuario);
      res.json(registros);
    } catch (error) {
      next(error);
    }
  }

  async listarPorEntidad(req, res, next) {
    try {
      const { entidad, id_registro } = req.params;
      const registros = await BitacoraService.listarPorEntidad(entidad, id_registro);
      res.json(registros);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BitacoraController();