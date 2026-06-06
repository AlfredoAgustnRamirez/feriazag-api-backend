const connection = require('../conection');

const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

class CompraModel {

    async listarCompras() {
        const sql = `
      SELECT c.*, p.nombre as proveedor_nombre, u.nombre as usuario_nombre 
      FROM compras c
      LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
      LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
      ORDER BY c.id_compra DESC
    `;
        return await query(sql);
    }

    async obtenerCompraPorId(id_compra) {
        const sqlCompra = `
        SELECT c.*, p.nombre as proveedor_nombre 
        FROM compras c
        LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
        WHERE c.id_compra = ?
    `;
        const compra = await query(sqlCompra, [id_compra]);

        if (compra.length === 0) return null;

        const sqlDetalles = `
        SELECT cd.*, pr.descripcion, pr.cod_producto 
        FROM compras_detalles cd
        LEFT JOIN producto pr ON cd.id_producto = pr.id_producto
        WHERE cd.id_compra = ?
    `;
        const detalles = await query(sqlDetalles, [id_compra]);

        return { ...compra[0], productos: detalles };
    }

    async crearCompra(data) {
        const { id_proveedor, id_usuario, fecha, numero_factura, subtotal, iva, total, estado, id_local } = data;
        const sql = `
        INSERT INTO compras (id_proveedor, id_usuario, id_local, fecha, numero_factura, subtotal, iva, total, estado) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await query(sql, [id_proveedor, id_usuario, id_local, fecha, numero_factura, subtotal, iva, total, estado || 'pendiente']);
        return result.insertId;
    }

    async crearDetallesCompra(id_compra, detalles) {
        if (!detalles || detalles.length === 0) return;

        const values = detalles.map(d => [id_compra, d.id_producto, d.cantidad, d.precio_compra, d.subtotal]);
        const sql = 'INSERT INTO compras_detalles (id_compra, id_producto, cantidad, precio_compra, subtotal) VALUES ?';
        await query(sql, [values]);
    }

    async listarProveedoresActivos() {
        const sql = 'SELECT id_proveedor, nombre FROM proveedores WHERE activo = "Si" ORDER BY nombre';
        return await query(sql);
    }

    async listarProductosActivos(id_local = 1) {
        const sql = `
        SELECT 
            p.id_producto, 
            p.cod_producto, 
            p.descripcion, 
            p.precio,
            COALESCE(pss.cantidad, 0) as cantidad
        FROM producto p
        LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
        WHERE p.activo = 'Si'
        ORDER BY p.descripcion
    `;
        return await query(sql, [id_local]);
    }

    async listarProductosActivos(id_local) {
        const sql = `
        SELECT 
            p.id_producto, 
            p.cod_producto, 
            p.descripcion, 
            p.precio,
            COALESCE(pss.cantidad, 0) as cantidad
        FROM producto p
        LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
        WHERE p.activo = 'Si'
        ORDER BY p.descripcion
    `;
        return await query(sql, [id_local]);
    }

    async actualizarStockProducto(id_producto, cantidad, id_local) {

        try {
            const exists = await query(
                'SELECT * FROM producto_sucursal_stock WHERE id_producto = ? AND id_local = ?',
                [id_producto, id_local]
            );

            if (exists.length > 0) {
                const sql = 'UPDATE producto_sucursal_stock SET cantidad = cantidad + ? WHERE id_producto = ? AND id_local = ?';
                await query(sql, [cantidad, id_producto, id_local]);
            } else {
                const sql = 'INSERT INTO producto_sucursal_stock (id_producto, id_local, cantidad, activo) VALUES (?, ?, ?, "Si")';
                await query(sql, [id_producto, id_local, cantidad]);
            }
        } catch (error) {
            console.error('Error actualizando stock:', error);
            throw error;
        }
    }

    async actualizarEstado(id_compra, estado) {
        const sql = 'UPDATE compras SET estado = ? WHERE id_compra = ?';
        await query(sql, [estado, id_compra]);
    }
}

module.exports = new CompraModel();