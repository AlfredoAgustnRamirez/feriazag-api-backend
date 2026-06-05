const BitacoraModel = require('../models/bitacora.model');

class BitacoraService {

  async registrar(data) {
    if (!data.id_usuario) {
      throw new Error('Usuario no identificado');
    }
    if (!data.accion) {
      throw new Error('Falta acción a registrar');
    }
    if (!data.entidad) {
      throw new Error('Falta entidad a registrar');
    }
    
    const id = await BitacoraModel.registrar(data);
    return { id, mensaje: 'Registrado en bitácora' };
  }

  async listar(filtros = {}) {
    return await BitacoraModel.listar(filtros);
  }

  async listarPorUsuario(id_usuario) {
    return await BitacoraModel.listarPorUsuario(id_usuario);
  }

  async listarPorEntidad(entidad, id_registro) {
    return await BitacoraModel.listarPorEntidad(entidad, id_registro);
  }
}

module.exports = new BitacoraService();