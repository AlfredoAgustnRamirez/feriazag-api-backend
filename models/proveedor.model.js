const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class ProveedorModel {

  async crearProveedor(data) {
    const { nombre, cuit, telefono, email, direccion, contacto, activo } = data;
    const sql = `
      INSERT INTO proveedores (nombre, cuit, telefono, email, direccion, contacto, activo) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [nombre, cuit, telefono, email, direccion, contacto, activo || 'Si']);
    return result.insertId;
  }

  async actualizarProveedor(id_proveedor, data) {
    const { nombre, cuit, telefono, email, direccion, contacto, activo } = data;
    const sql = `
      UPDATE proveedores 
      SET nombre = ?, cuit = ?, telefono = ?, email = ?, direccion = ?, contacto = ?, activo = ? 
      WHERE id_proveedor = ?
    `;
    await query(sql, [nombre, cuit, telefono, email, direccion, contacto, activo || 'Si', id_proveedor]);
  }

  async listarProveedores() {
    const sql = `SELECT * FROM proveedores ORDER BY nombre`;
    return await query(sql);
  }

  async listarActivos() {
    const sql = `SELECT * FROM proveedores WHERE activo = 'Si' ORDER BY nombre`;
    return await query(sql);
  }

  async obtenerProveedorPorId(id_proveedor) {
    const sql = `SELECT * FROM proveedores WHERE id_proveedor = ?`;
    const result = await query(sql, [id_proveedor]);
    return result[0];
  }

  async cambiarEstado(id_proveedor, activo) {
    const sql = `UPDATE proveedores SET activo = ? WHERE id_proveedor = ?`;
    const result = await query(sql, [activo, id_proveedor]);
    return result.affectedRows;
  }

  async eliminarProveedor(id_proveedor) {
    const sql = `DELETE FROM proveedores WHERE id_proveedor = ?`;
    const result = await query(sql, [id_proveedor]);
    return result.affectedRows;
  }

  async tieneOrdenesCompra(id_proveedor) {
    try {
      const rows = await query(
        'SELECT COUNT(*) as total FROM compras WHERE id_proveedor = ?',
        [id_proveedor]
      );
      return rows[0].total > 0;
    } catch (error) {
      console.error('Error al verificar órdenes de compra:', error);
      throw error;
    }
  }

  async tieneOrdenesCompra(id_proveedor) {
    try {
      const rows = await query(
        'SELECT COUNT(*) as total FROM compras WHERE id_proveedor = ?',
        [id_proveedor]
      );
      return rows[0].total > 0;
    } catch (error) {
      console.error('Error en tieneOrdenesCompra:', error);
      return false; 
    }
  }
}
module.exports = new ProveedorModel();