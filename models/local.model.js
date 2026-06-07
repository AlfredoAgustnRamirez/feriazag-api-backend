const connection = require('../conection');

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

class LocalModel {
    // Obtener local activo del usuario
    async getLocalActivo(usuarioId) {
        const sql = `
            SELECT l.* 
            FROM local l
            INNER JOIN usuario_local ul ON ul.id_local = l.id_local
            WHERE ul.id_usuario = ? AND ul.es_activo = 'Si'
        `;
        const results = await query(sql, [usuarioId]);
        return results[0] || null;
    }

    // Obtener todos los locales del usuario
    async getLocalesByUsuario(usuarioId) {
        const sql = `
            SELECT l.*, ul.es_activo, ul.id_usuario_local
            FROM local l
            INNER JOIN usuario_local ul ON ul.id_local = l.id_local
            WHERE ul.id_usuario = ?
            ORDER BY ul.es_activo DESC, l.nombre_local
        `;
        return await query(sql, [usuarioId]);
    }

    // Cambiar local activo
    async cambiarLocalActivo(usuarioId, localId) {
        // Desactivar todos los locales del usuario
        await query('UPDATE usuario_local SET es_activo = "No" WHERE id_usuario = ?', [usuarioId]);
        
        // Activar el local seleccionado
        await query('UPDATE usuario_local SET es_activo = "Si" WHERE id_usuario = ? AND id_local = ?', [usuarioId, localId]);
        
        // Obtener el local activado
        const results = await query('SELECT * FROM local WHERE id_local = ?', [localId]);
        return results[0];
    }

    // Crear nuevo local
    async crearLocal(data, usuarioId) {
        const { nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado } = data;
        
        // Insertar local
        const result = await query(`
            INSERT INTO local (nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado, activo, fecha_registro)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Si', NOW())
        `, [nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado]);
        
        const nuevoLocalId = result.insertId;
        
        // Relacionar usuario con local
        await query(`
            INSERT INTO usuario_local (id_usuario, id_local, es_activo)
            VALUES (?, ?, 'Si')
        `, [usuarioId, nuevoLocalId]);
        
        // Desactivar otros locales del usuario
        await query(`
            UPDATE usuario_local SET es_activo = 'No'
            WHERE id_usuario = ? AND id_local != ?
        `, [usuarioId, nuevoLocalId]);
        
        return nuevoLocalId;
    }

    // Actualizar local
    async actualizarLocal(id_local, data) {
        const { nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado } = data;
        
        await query(`
            UPDATE local 
            SET nombre_local = ?, direccion = ?, telefono = ?, email = ?, 
                ciudad = ?, provincia = ?, horario = ?, encargado = ?
            WHERE id_local = ?
        `, [nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado, id_local]);
        
        return true;
    }

    // Eliminar local
    async eliminarLocal(id_local, usuarioId) {
        // Verificar cuántos locales tiene el usuario
        const count = await query(
            'SELECT COUNT(*) as total FROM usuario_local WHERE id_usuario = ?',
            [usuarioId]
        );
        
        if (count[0].total <= 1) {
            throw new Error('No puedes eliminar el único local. Debes tener al menos un local.');
        }
        
        // Verificar si el local a eliminar es el activo
        const activo = await query(
            'SELECT es_activo FROM usuario_local WHERE id_usuario = ? AND id_local = ?',
            [usuarioId, id_local]
        );
        
        const esActivo = activo[0]?.es_activo === 'Si';
        
        // Eliminar relación usuario-local
        await query(
            'DELETE FROM usuario_local WHERE id_usuario = ? AND id_local = ?',
            [usuarioId, id_local]
        );
        
        // Si era el activo, activar otro local
        if (esActivo) {
            await query(`
                UPDATE usuario_local SET es_activo = 'Si'
                WHERE id_usuario = ? LIMIT 1
            `, [usuarioId]);
        }
        
        // Eliminar local
        await query('DELETE FROM local WHERE id_local = ?', [id_local]);
        
        return true;
    }

    // Listar todos los locales (admin)
    async listarTodos() {
        return await query(`SELECT * FROM local WHERE activo = 'Si' ORDER BY nombre_local`);
    }
}

module.exports = new LocalModel();