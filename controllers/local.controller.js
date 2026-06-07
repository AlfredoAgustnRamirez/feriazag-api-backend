const LocalService = require('../services/local.service');

class LocalController {
    async getLocalActivo(req, res, next) {
        try {
            const usuarioId = req.usuario.id_usuario;
            const local = await LocalService.getLocalActivo(usuarioId);
            if (!local) {
                return res.status(404).json({ mensaje: 'No se encontró un local activo' });
            }
            res.json(local);
        } catch (error) {
            next(error);
        }
    }

    async getLocalesByUsuario(req, res, next) {
        try {
            const usuarioId = req.usuario.id_usuario;
            const locales = await LocalService.getLocalesByUsuario(usuarioId);
            res.json(locales);
        } catch (error) {
            next(error);
        }
    }

    async cambiarLocalActivo(req, res, next) {
        try {
            const { idLocal } = req.params;
            const usuarioId = req.usuario.id_usuario;
            const local = await LocalService.cambiarLocalActivo(usuarioId, idLocal);
            res.json(local);
        } catch (error) {
            next(error);
        }
    }

    async crearLocal(req, res, next) {
        try {
            const usuarioId = req.usuario.id_usuario;
            const nuevoLocalId = await LocalService.crearLocal(req.body, usuarioId);
            res.json({ success: true, id_local: nuevoLocalId, mensaje: 'Local creado correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async actualizarLocal(req, res, next) {
        try {
            const { id_local } = req.body;
            await LocalService.actualizarLocal(id_local, req.body);
            res.json({ success: true, mensaje: 'Local actualizado correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async eliminarLocal(req, res, next) {
        try {
            const { idLocal } = req.params;
            const usuarioId = req.usuario.id_usuario;
            await LocalService.eliminarLocal(idLocal, usuarioId);
            res.json({ success: true, mensaje: 'Local eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    }

    async listarTodos(req, res, next) {
        try {
            const locales = await LocalService.listarTodos();
            res.json(locales);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new LocalController();