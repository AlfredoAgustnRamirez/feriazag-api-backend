const UsuarioModel = require('../models/usuario.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWTSECRET || 'tu_secreto_super_seguro';

class UsuarioService {

  // ============ LOGIN ============
async login(email, password) {
  const user = await UsuarioModel.findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales incorrectas');
  }
  
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error('Credenciales incorrectas');
  }
  
  const userLocal = await UsuarioModel.getUserLocal(user.id_usuario);
  
  const token = jwt.sign(
    { 
      userId: user.id_usuario,
      id_usuario: user.id_usuario,
      id_perfil: user.id_perfil,
      email: user.email,
      id_local: userLocal?.id_local || 1  
    }, 
    JWT_SECRET, 
    { expiresIn: '8h' }
  );
  
  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      usuario: user.usuario,
      id_perfil: user.id_perfil,
      id_local: userLocal?.id_local || 1, 
      foto_perfil: user.foto_perfil,
      perfil_nombre: user.perfil_nombre
    }
  };
}

  // ============ USUARIOS ============
  async listarUsuarios() {
    return await UsuarioModel.listarUsuarios();
  }

  async obtenerUsuarioPorId(id_usuario) {
    const usuario = await UsuarioModel.obtenerUsuarioPorId(id_usuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;
  }

  async crearUsuario(data) {
    const { email, usuario } = data;
    
    const existeEmail = await UsuarioModel.existeUsuarioPorEmail(email);
    if (existeEmail) {
      throw new Error('Ya existe un usuario con ese email');
    }
    
    const existeUsuario = await UsuarioModel.existeUsuarioPorNombre(usuario);
    if (existeUsuario) {
      throw new Error('Ya existe un usuario con ese nombre de usuario');
    }
    
    const nuevoId = await UsuarioModel.crearUsuario(data);
    return { id_usuario: nuevoId, mensaje: 'Usuario creado correctamente' };
  }

  async actualizarUsuario(id_usuario, data) {
    const { email, usuario } = data;
    
    const existeEmail = await UsuarioModel.existeUsuarioPorEmail(email, id_usuario);
    if (existeEmail) {
      throw new Error('Ya existe otro usuario con ese email');
    }
    
    const existeUsuario = await UsuarioModel.existeUsuarioPorNombre(usuario, id_usuario);
    if (existeUsuario) {
      throw new Error('Ya existe otro usuario con ese nombre de usuario');
    }
    
    const affected = await UsuarioModel.actualizarUsuario(id_usuario, data);
    if (affected === 0) {
      throw new Error('Usuario no encontrado');
    }
    return { mensaje: 'Usuario actualizado correctamente' };
  }

  async cambiarEstado(id_usuario, activo) {
    const affected = await UsuarioModel.cambiarEstado(id_usuario, activo);
    if (affected === 0) {
      throw new Error('Usuario no encontrado');
    }
    return { mensaje: `Usuario ${activo === 'Si' ? 'activado' : 'desactivado'} correctamente` };
  }

  async listarPerfiles() {
    return await UsuarioModel.listarPerfiles();
  }
}

module.exports = new UsuarioService();