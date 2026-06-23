const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class CategoriaModel {

  async listarCategorias() {
    const sql = 'SELECT * FROM categoria ORDER BY id_categoria DESC';
    return await query(sql);
  }

  async listarCategoriasActivas() {
    const sql = 'SELECT * FROM categoria WHERE activo = "Si" ORDER BY descripcion';
    return await query(sql);
  }

  async obtenerCategoriaPorId(id_categoria) {
    const sql = 'SELECT * FROM categoria WHERE id_categoria = ?';
    const results = await query(sql, [id_categoria]);
    return results[0] || null;
  }

  async existeCategoriaPorDescripcion(descripcion, id_categoria_excluir = null) {
    let sql = 'SELECT * FROM categoria WHERE descripcion = ?';
    const params = [descripcion];
    
    if (id_categoria_excluir) {
      sql += ' AND id_categoria != ?';
      params.push(id_categoria_excluir);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  async crearCategoria(data) {
    const { descripcion, activo } = data;
    const sql = 'INSERT INTO categoria (descripcion, activo) VALUES (?, ?)';
    const result = await query(sql, [descripcion, activo || 'Si']);
    return result.insertId;
  }

  async actualizarCategoria(id_categoria, data) {
    const { descripcion, activo } = data;
    const sql = 'UPDATE categoria SET descripcion = ?, activo = ? WHERE id_categoria = ?';
    const result = await query(sql, [descripcion, activo, id_categoria]);
    return result.affectedRows;
  }

  async cambiarEstado(id_categoria, activo) {
    const sql = 'UPDATE categoria SET activo = ? WHERE id_categoria = ?';
    const result = await query(sql, [activo, id_categoria]);
    return result.affectedRows;
  }

  async tieneProductosAsociados(id_categoria) {
    const sql = 'SELECT * FROM producto WHERE id_categoria = ?';
    const results = await query(sql, [id_categoria]);
    return results.length > 0;
  }

  async eliminarCategoria(id_categoria) {
    const sql = 'DELETE FROM categoria WHERE id_categoria = ?';
    const result = await query(sql, [id_categoria]);
    return result.affectedRows;
  }

  async findById(id_categoria) {
    const sql = 'SELECT * FROM categoria WHERE id_categoria = ?';
    const rows = await query(sql, [id_categoria]);
    return rows[0] || null;
}
}

module.exports = new CategoriaModel();