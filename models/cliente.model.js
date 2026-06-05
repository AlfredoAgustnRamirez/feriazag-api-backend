const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class ClienteModel {

  async listarClientes(estado = null) {
    let sql = `
      SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
      FROM cliente c
      LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
    `;
    
    if (estado === 'activos') {
      sql += ` WHERE c.activo = 'SI'`;
    } else if (estado === 'inactivos') {
      sql += ` WHERE c.activo = 'NO'`;
    }
    
    sql += ` ORDER BY c.id_cliente DESC`;
    
    return await query(sql);
  }

  async buscarClientes(search) {
    const sql = `
      SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
      FROM cliente c
      LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
      WHERE c.nombre_razon_social LIKE ? 
         OR c.dni_cuit LIKE ?
         OR c.correo_electronico LIKE ?
      ORDER BY c.id_cliente DESC
    `;
    const searchTerm = `%${search}%`;
    return await query(sql, [searchTerm, searchTerm, searchTerm]);
  }

  async obtenerClientePorId(id_cliente) {
    const sql = `
      SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
      FROM cliente c
      LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
      WHERE c.id_cliente = ?
    `;
    const results = await query(sql, [id_cliente]);
    return results[0] || null;
  }

  async existeClientePorDni(dni_cuit, id_cliente_excluir = null) {
    let sql = 'SELECT * FROM cliente WHERE dni_cuit = ?';
    const params = [dni_cuit];
    
    if (id_cliente_excluir) {
      sql += ' AND id_cliente != ?';
      params.push(id_cliente_excluir);
    }
    
    const results = await query(sql, params);
    return results.length > 0;
  }

  async crearCliente(data) {
    const { nombre_razon_social, dni_cuit, telefono_whatsapp, correo_electronico, id_tipo_cliente, activo } = data;
    const sql = `
      INSERT INTO cliente (
        nombre_razon_social, 
        dni_cuit, 
        telefono_whatsapp, 
        correo_electronico, 
        id_tipo_cliente, 
        activo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      nombre_razon_social, 
      dni_cuit, 
      telefono_whatsapp || null, 
      correo_electronico || null, 
      id_tipo_cliente, 
      activo || 'SI'
    ]);
    return result.insertId;
  }

  async actualizarCliente(id_cliente, data) {
    const { nombre_razon_social, dni_cuit, telefono_whatsapp, correo_electronico, id_tipo_cliente, activo } = data;
    const sql = `
      UPDATE cliente 
      SET nombre_razon_social = ?, 
          dni_cuit = ?, 
          telefono_whatsapp = ?, 
          correo_electronico = ?, 
          id_tipo_cliente = ?, 
          activo = ?
      WHERE id_cliente = ?
    `;
    const result = await query(sql, [
      nombre_razon_social, 
      dni_cuit, 
      telefono_whatsapp || null, 
      correo_electronico || null, 
      id_tipo_cliente, 
      activo,
      id_cliente
    ]);
    return result.affectedRows;
  }

  async cambiarEstado(id_cliente, activo) {
    const sql = 'UPDATE cliente SET activo = ? WHERE id_cliente = ?';
    const result = await query(sql, [activo, id_cliente]);
    return result.affectedRows;
  }

  async tieneVentasAsociadas(id_cliente) {
    const sql = 'SELECT * FROM venta_cabecera WHERE id_cliente = ?';
    const results = await query(sql, [id_cliente]);
    return results.length > 0;
  }

  async eliminarCliente(id_cliente) {
    const sql = 'DELETE FROM cliente WHERE id_cliente = ?';
    const result = await query(sql, [id_cliente]);
    return result.affectedRows;
  }

  async listarTiposCliente() {
    const sql = "SELECT * FROM tipo_cliente WHERE activo = 'SI'";
    return await query(sql);
  }
}

module.exports = new ClienteModel();