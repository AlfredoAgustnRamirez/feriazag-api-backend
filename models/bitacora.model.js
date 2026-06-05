const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class BitacoraModel {

  async registrar(data) {
    const { 
      id_usuario, 
      nombre_usuario, 
      accion, 
      entidad, 
      id_registro, 
      valor_anterior, 
      valor_nuevo, 
      ip_address, 
      user_agent 
    } = data;
    
    const sql = `
      INSERT INTO bitacora_auditoria 
      (id_usuario, nombre_usuario, accion, entidad, id_registro, valor_anterior, valor_nuevo, ip_address, user_agent) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const valorAnteriorStr = valor_anterior ? JSON.stringify(valor_anterior) : null;
    const valorNuevoStr = valor_nuevo ? JSON.stringify(valor_nuevo) : null;
    
    const result = await query(sql, [
      id_usuario, 
      nombre_usuario, 
      accion, 
      entidad, 
      id_registro || null, 
      valorAnteriorStr, 
      valorNuevoStr, 
      ip_address, 
      user_agent
    ]);
    
    return result.insertId;
  }

  async listar(filtros = {}) {
    let sql = 'SELECT * FROM bitacora_auditoria WHERE 1=1';
    const params = [];
    
    if (filtros.accion) {
      sql += ' AND accion = ?';
      params.push(filtros.accion);
    }
    if (filtros.entidad) {
      sql += ' AND entidad = ?';
      params.push(filtros.entidad);
    }
    if (filtros.usuario) {
      sql += ' AND nombre_usuario LIKE ?';
      params.push(`%${filtros.usuario}%`);
    }
    if (filtros.inicio && filtros.fin) {
      sql += ' AND fecha BETWEEN ? AND ?';
      params.push(filtros.inicio, filtros.fin);
    }
    
    sql += ' ORDER BY fecha DESC LIMIT 500';
    
    return await query(sql, params);
  }

  async listarPorUsuario(id_usuario) {
    const sql = 'SELECT * FROM bitacora_auditoria WHERE id_usuario = ? ORDER BY fecha DESC LIMIT 500';
    return await query(sql, [id_usuario]);
  }

  async listarPorEntidad(entidad, id_registro) {
    const sql = 'SELECT * FROM bitacora_auditoria WHERE entidad = ? AND id_registro = ? ORDER BY fecha DESC';
    return await query(sql, [entidad, id_registro]);
  }
}

module.exports = new BitacoraModel();