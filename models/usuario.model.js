const connection = require('../conection');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

class UsuarioModel {

    async findUserByEmail(email) {
        const sql = `
    SELECT 
      u.id_usuario, 
      u.email, 
      u.password, 
      u.nombre, 
      u.apellido, 
      u.usuario, 
      u.id_perfil,
      u.foto_perfil,
      u.activo,
      p.descripcion as perfil_nombre
    FROM usuarios u
    INNER JOIN perfil p ON u.id_perfil = p.id_perfil
    WHERE u.email = ?
  `;
        const results = await query(sql, [email]);
        return results[0] || null;
    }

    // ============ LISTAR USUARIOS ============
    async listarUsuarios() {
        const sql = `
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido, 
        u.email, 
        u.usuario, 
        u.activo, 
        u.id_perfil,
        u.foto_perfil,
        p.descripcion as perfil_nombre
      FROM usuarios u
      INNER JOIN perfil p ON u.id_perfil = p.id_perfil
      ORDER BY u.id_usuario DESC
    `;
        return await query(sql);
    }

    // ============ OBTENER USUARIO POR ID ============
    async obtenerUsuarioPorId(id_usuario) {
        const sql = `
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido, 
        u.email, 
        u.usuario, 
        u.activo, 
        u.id_perfil,
        u.foto_perfil,
        p.descripcion as perfil_nombre
      FROM usuarios u
      INNER JOIN perfil p ON u.id_perfil = p.id_perfil
      WHERE u.id_usuario = ?
    `;
        const results = await query(sql, [id_usuario]);
        return results[0] || null;
    }

    // ============ VERIFICAR EXISTENCIA ============
    async existeUsuarioPorEmail(email, id_usuario_excluir = null) {
        let sql = 'SELECT id_usuario FROM usuarios WHERE email = ?';
        const params = [email];
        if (id_usuario_excluir) {
            sql += ' AND id_usuario != ?';
            params.push(id_usuario_excluir);
        }
        const results = await query(sql, params);
        return results.length > 0;
    }

    async existeUsuarioPorNombre(usuario, id_usuario_excluir = null) {
        let sql = 'SELECT id_usuario FROM usuarios WHERE usuario = ?';
        const params = [usuario];
        if (id_usuario_excluir) {
            sql += ' AND id_usuario != ?';
            params.push(id_usuario_excluir);
        }
        const results = await query(sql, params);
        return results.length > 0;
    }

    // ============ CREAR USUARIO ============
    async crearUsuario(data) {
        const { nombre, apellido, email, usuario, password, activo, id_perfil } = data;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `
      INSERT INTO usuarios (nombre, apellido, email, usuario, password, activo, id_perfil) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await query(sql, [nombre, apellido, email, usuario, hashedPassword, activo || 'Si', id_perfil]);
        return result.insertId;
    }

    // ============ ACTUALIZAR USUARIO ============
    async actualizarUsuario(id_usuario, data) {
        const { nombre, apellido, email, usuario, activo, id_perfil } = data;
        const sql = `
      UPDATE usuarios 
      SET nombre = ?, apellido = ?, email = ?, usuario = ?, activo = ?, id_perfil = ? 
      WHERE id_usuario = ?
    `;
        const result = await query(sql, [nombre, apellido, email, usuario, activo || 'Si', id_perfil, id_usuario]);
        return result.affectedRows;
    }

    async actualizarUsuarioConFoto(id_usuario, data, foto) {
        const { nombre, apellido, email, usuario, activo, id_perfil } = data;
        const sql = `
      UPDATE usuarios 
      SET nombre = ?, apellido = ?, email = ?, usuario = ?, activo = ?, id_perfil = ?, foto_perfil = ? 
      WHERE id_usuario = ?
    `;
        const result = await query(sql, [nombre, apellido, email, usuario, activo || 'Si', id_perfil, foto, id_usuario]);
        return result.affectedRows;
    }

    // ============ CAMBIAR ESTADO ============
    async cambiarEstado(id_usuario, activo) {
        const sql = 'UPDATE usuarios SET activo = ? WHERE id_usuario = ?';
        const result = await query(sql, [activo, id_usuario]);
        return result.affectedRows;
    }

    // ============ CAMBIAR CONTRASEÑA ============
    async cambiarPassword(id_usuario, password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = 'UPDATE usuarios SET password = ? WHERE id_usuario = ?';
        const result = await query(sql, [hashedPassword, id_usuario]);
        return result.affectedRows;
    }

    async verificarPasswordActual(id_usuario, passwordActual) {
        const sql = 'SELECT password FROM usuarios WHERE id_usuario = ?';
        const results = await query(sql, [id_usuario]);
        if (!results[0]) return false;
        return await bcrypt.compare(passwordActual, results[0].password);
    }

    async getUserLocal(id_usuario) {
        const sql = `
    SELECT l.id_local, l.nombre_local
    FROM usuario_local ul
    INNER JOIN local l ON ul.id_local = l.id_local
    WHERE ul.id_usuario = ? AND ul.es_activo = 'Si'
    LIMIT 1
  `;
        const results = await query(sql, [id_usuario]);
        return results[0] || null;
    }

    // ============ PERFILES ============
    async listarPerfiles() {
        const sql = 'SELECT id_perfil, descripcion FROM perfil';
        return await query(sql);
    }
}

module.exports = new UsuarioModel();