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

    // Listar todas las compras
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

    // Obtener compra por ID con sus detalles
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

    // Crear compra
    async crearCompra(data) {
        const { id_proveedor, id_usuario, fecha, numero_factura, subtotal, iva, total, estado } = data;
        const sql = `
      INSERT INTO compras (id_proveedor, id_usuario, fecha, numero_factura, subtotal, iva, total, estado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const result = await query(sql, [id_proveedor, id_usuario, fecha, numero_factura, subtotal, iva, total, estado || 'recibida']);
        return result.insertId;
    }

    // Crear detalles de compra
    async crearDetallesCompra(id_compra, detalles) {
        if (!detalles || detalles.length === 0) return;

        const values = detalles.map(d => [id_compra, d.id_producto, d.cantidad, d.precio_compra, d.subtotal]);
        const sql = 'INSERT INTO compras_detalles (id_compra, id_producto, cantidad, precio_compra, subtotal) VALUES ?';
        await query(sql, [values]);
    }

    // Actualizar stock de productos
    async actualizarStockProducto(id_producto, cantidad, id_local = 1) {
        // Verificar si existe el registro de stock para este producto y local
        const exists = await query(
            'SELECT * FROM producto_sucursal_stock WHERE id_producto = ? AND id_local = ?',
            [id_producto, id_local]
        );

        if (exists.length > 0) {
            // Actualizar stock existente
            const sql = 'UPDATE producto_sucursal_stock SET cantidad = cantidad + ? WHERE id_producto = ? AND id_local = ?';
            await query(sql, [cantidad, id_producto, id_local]);
        } else {
            // Crear nuevo registro de stock
            const sql = 'INSERT INTO producto_sucursal_stock (id_producto, id_local, cantidad, activo) VALUES (?, ?, ?, "Si")';
            await query(sql, [id_producto, id_local, cantidad]);
        }
    }

    // Obtener proveedores activos (para el formulario)
    async listarProveedoresActivos() {
        const sql = 'SELECT id_proveedor, nombre FROM proveedores WHERE activo = "Si" ORDER BY nombre';
        return await query(sql);
    }

    // Obtener productos activos (para el formulario)
    async listarProductosActivos() {
        const sql = `
    SELECT 
      p.id_producto, 
      p.cod_producto, 
      p.descripcion, 
      p.precio,
      COALESCE(SUM(pss.cantidad), 0) as cantidad_total
    FROM producto p
    LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto
    WHERE p.activo = 'Si'
    GROUP BY p.id_producto, p.cod_producto, p.descripcion, p.precio
    ORDER BY p.descripcion
  `;
        return await query(sql);
    }
}

module.exports = new CompraModel();