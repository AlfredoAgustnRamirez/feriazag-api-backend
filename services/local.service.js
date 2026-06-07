const LocalModel = require('../models/local.model');

class LocalService {
    async getLocalActivo(usuarioId) {
        return await LocalModel.getLocalActivo(usuarioId);
    }

    async getLocalesByUsuario(usuarioId) {
        return await LocalModel.getLocalesByUsuario(usuarioId);
    }

    async cambiarLocalActivo(usuarioId, localId) {
        return await LocalModel.cambiarLocalActivo(usuarioId, localId);
    }

    async crearLocal(data, usuarioId) {
        if (!data.nombre_local) {
            throw new Error('El nombre del local es requerido');
        }
        return await LocalModel.crearLocal(data, usuarioId);
    }

    async actualizarLocal(id_local, data) {
        return await LocalModel.actualizarLocal(id_local, data);
    }

    async eliminarLocal(id_local, usuarioId) {
        return await LocalModel.eliminarLocal(id_local, usuarioId);
    }

    async listarTodos() {
        return await LocalModel.listarTodos();
    }
}

module.exports = new LocalService();