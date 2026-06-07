const connection = require('../conection');

class ClienteModel {
    listar(estado) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
                FROM cliente c
                LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
            `;
            if (estado === 'activos') query += " WHERE c.activo = 'SI'";
            if (estado === 'inactivos') query += " WHERE c.activo = 'NO'";
            query += " ORDER BY c.id_cliente DESC";
            
            connection.query(query, (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
    }

    buscar(search) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
                FROM cliente c
                LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
                WHERE c.nombre_razon_social LIKE ? 
                   OR c.dni_cuit LIKE ?
                   OR c.correo_electronico LIKE ?
                ORDER BY c.id_cliente DESC
            `;
            const searchTerm = `%${search}%`;
            
            connection.query(query, [searchTerm, searchTerm, searchTerm], (error, results) => {
                if (error) reject(error);
                else resolve(results);
            });
        });
    }

    obtenerPorId(id_cliente) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
                FROM cliente c
                LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
                WHERE c.id_cliente = ?
            `;
            connection.query(query, [id_cliente], (error, results) => {
                if (error) reject(error);
                else resolve(results[0]);
            });
        });
    }

    existeDNI(dni_cuit, id_cliente_excluir = null) {
        return new Promise((resolve, reject) => {
            let query = "SELECT id_cliente FROM cliente WHERE dni_cuit = ?";
            const params = [dni_cuit];
            if (id_cliente_excluir) {
                query += " AND id_cliente != ?";
                params.push(id_cliente_excluir);
            }
            connection.query(query, params, (error, results) => {
                if (error) reject(error);
                else resolve(results.length > 0);
            });
        });
    }

    crear(data) {
        return new Promise((resolve, reject) => {
            const { nombre_razon_social, dni_cuit, telefono_whatsapp, correo_electronico, id_tipo_cliente, activo } = data;
            const query = `
                INSERT INTO cliente (nombre_razon_social, dni_cuit, telefono_whatsapp, correo_electronico, id_tipo_cliente, activo) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            connection.query(query, [
                nombre_razon_social, 
                dni_cuit, 
                telefono_whatsapp || null, 
                correo_electronico || null, 
                id_tipo_cliente, 
                activo || 'SI'
            ], (error, result) => {
                if (error) reject(error);
                else resolve({ id_cliente: result.insertId });
            });
        });
    }

    actualizar(id_cliente, data) {
        return new Promise((resolve, reject) => {
            const { nombre_razon_social, dni_cuit, telefono_whatsapp, correo_electronico, id_tipo_cliente, activo } = data;
            const query = `
                UPDATE cliente 
                SET nombre_razon_social = ?, dni_cuit = ?, telefono_whatsapp = ?, 
                    correo_electronico = ?, id_tipo_cliente = ?, activo = ? 
                WHERE id_cliente = ?
            `;
            connection.query(query, [
                nombre_razon_social, dni_cuit, telefono_whatsapp || null, 
                correo_electronico || null, id_tipo_cliente, activo, id_cliente
            ], (error, result) => {
                if (error) reject(error);
                else resolve(result.affectedRows);
            });
        });
    }

    cambiarEstado(id_cliente, activo) {
        return new Promise((resolve, reject) => {
            connection.query(
                "UPDATE cliente SET activo = ? WHERE id_cliente = ?", 
                [activo, id_cliente],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.affectedRows);
                }
            );
        });
    }

    tieneVentas(id_cliente) {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT id_cabecera FROM venta_cabecera WHERE id_cliente = ? LIMIT 1", 
                [id_cliente],
                (error, results) => {
                    if (error) reject(error);
                    else resolve(results.length > 0);
                }
            );
        });
    }

    eliminar(id_cliente) {
        return new Promise((resolve, reject) => {
            connection.query(
                "DELETE FROM cliente WHERE id_cliente = ?", 
                [id_cliente],
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result.affectedRows);
                }
            );
        });
    }

    listarTipos() {
        return new Promise((resolve, reject) => {
            connection.query(
                "SELECT * FROM tipo_cliente WHERE activo = 'SI'",
                (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                }
            );
        });
    }
}

module.exports = new ClienteModel();