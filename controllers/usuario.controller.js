const UsuarioService = require('../services/usuario.service');
const { validationResult } = require('express-validator');

class UsuarioController {

  // ============ LOGIN ============
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { email, password } = req.body;
      const result = await UsuarioService.login(email, password);
      
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000
      });
      
      res.json({
        mensaje: 'Inicio de sesión exitoso',
        id_usuario: result.user.id_usuario,
        nombre: result.user.nombre,
        apellido: result.user.apellido,
        email: result.user.email,
        usuario: result.user.usuario,
        id_perfil: result.user.id_perfil,
        foto_perfil: result.user.foto_perfil,
        perfil_nombre: result.user.perfil_nombre
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
      res.json({ mensaje: 'Sesión cerrada correctamente' });
    } catch (error) {
      next(error);
    }
  }

  async verificarToken(req, res, next) {
    try {
      res.json({ 
        autenticado: true, 
        usuario: req.usuario 
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ USUARIOS ============
  async listarUsuarios(req, res, next) {
    try {
      const usuarios = await UsuarioService.listarUsuarios();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  async obtenerUsuarioPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.obtenerUsuarioPorId(id);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async crearUsuario(req, res, next) {
    try {
      const resultado = await UsuarioService.crearUsuario(req.body);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async actualizarUsuario(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const resultado = await UsuarioService.actualizarUsuario(id_usuario, req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async cambiarEstado(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const { activo } = req.body;
      const resultado = await UsuarioService.cambiarEstado(id_usuario, activo);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async listarPerfiles(req, res, next) {
    try {
      const perfiles = await UsuarioService.listarPerfiles();
      res.json(perfiles);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();