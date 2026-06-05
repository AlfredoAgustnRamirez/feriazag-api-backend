const connection = require('../conection');

// Helper para promisificar queries
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
};

class VentaModel {
    // LISTAR PRODUCTOS
    async listarProductos() {
        const sql = `
            SELECT p.id_producto, c.descripcion AS categoria,
                   p.precio, p.activo, p.talle, p.descripcion, p.id_producto, p.cod_producto
            FROM producto p
            INNER JOIN categoria c ON p.id_categoria = c.id_categoria 
            WHERE p.activo = ?
        `;
        return await query(sql, ['Si']);
    }

    // REGISTRAR VENTA CON SP
    async registrarVentaConSP(iduser, id_local, total_venta, id_cliente, fecha) {
        try {
            // Ejecutar el SP
            const results = await query('CALL sp_registrar_venta(?, ?, ?, ?, ?)', [
                iduser,
                id_local,
                total_venta,
                id_cliente || null,
                fecha
            ]);

            // Extraer el ID del resultado
            let id_venta = null;

            // El SP devuelve un array de resultados
            if (results && results[0] && results[0][0] && results[0][0].id_cabecera) {
                id_venta = results[0][0].id_cabecera;
            } else if (results && results[0] && results[0].id_cabecera) {
                id_venta = results[0].id_cabecera;
            } else if (results && results.insertId) {
                id_venta = results.insertId;
            }

            if (!id_venta) {
                throw new Error('No se pudo obtener el ID de la venta');
            }

            return id_venta;

        } catch (error) {
            console.error('Error en registrarVentaConSP:', error);
            throw error;
        }
    }

    // INSERTAR MEDIOS DE PAGO
    async insertarMediosPago(idcabecera, medios_pago) {
        if (!medios_pago || medios_pago.length === 0) return;

        const mediosValues = medios_pago.map(medio => [idcabecera, medio.id_medio_pago, medio.monto]);
        const sql = `INSERT INTO mediospagos_ventaCabecera (id_cabecera, id_medio_pago, monto) VALUES ?`;
        return await query(sql, [mediosValues]);
    }

    // INSERTAR DETALLES DE VENTA
    async insertarDetallesVenta(idcabecera, detalles) {
        if (!detalles || detalles.length === 0) return;

        const productosValues = detalles.map(detalle => [
            idcabecera,
            detalle.id_producto,
            detalle.cod_producto || '',
            detalle.descripcion || '',
            detalle.precio,
            detalle.cantidad || 1
        ]);

        const placeholders = detalles.map(() => '(?, ?, ?, ?, ?, ?)').join(', ');
        const sql = `INSERT INTO venta_detalle (id_cabecera, id_producto, cod_producto, descripcion, precio, cantidad) VALUES ${placeholders}`;

        return await query(sql, productosValues.flat());
    }

    // OBTENER VENTAS POR FECHA
    async obtenerVentasPorFecha(fecha, idLocal) {
        const sql = `
            SELECT 
                vc.id_cabecera,
                vc.total_venta,
                vc.fecha,
                vc.id_local,
                vc.tipo_comprobante,
                COALESCE(
                    JSON_ARRAYAGG(
                        JSON_OBJECT('id_medio_pago', mp.id_medio_pago, 'monto', mpv.monto_abonado, 'descripcion', mp.descripcion)
                    ), 
                    JSON_ARRAY()
                ) as medios_pago
            FROM venta_cabecera vc
            LEFT JOIN mediospagos_ventacabecera mpv ON mpv.id_cabecera = vc.id_cabecera
            LEFT JOIN medio_pago mp ON mp.id_medio_pago = mpv.id_medio_pago
            WHERE DATE(vc.fecha) = ? AND vc.id_local = ?
            GROUP BY vc.id_cabecera
            ORDER BY vc.fecha DESC
        `;
        const results = await query(sql, [fecha, idLocal]);

        return results.map(r => ({
            ...r,
            medios_pago: r.medios_pago ? JSON.parse(r.medios_pago) : []
        }));
    }

    // OBTENER TODAS LAS VENTAS
    async obtenerTodasLasVentas() {
        const sql = `
    SELECT vc.id_cabecera, vc.fecha, vc.total_venta as total,
           COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente
    FROM venta_cabecera vc
    LEFT JOIN cliente c ON vc.id_cliente = c.id_cliente
    ORDER BY vc.id_cabecera DESC
  `;
        return await query(sql);
    }

    // OBTENER MEDIOS DE PAGO
    async obtenerMediosPago() {
        const sql = "SELECT * FROM medio_pago WHERE activo = ?";
        return await query(sql, ['Si']);
    }

    // OBTENER DASHBOARD STATS
    async obtenerDashboardStats(idLocal) {
        const sql = `
            SELECT 
                IFNULL(SUM(total_venta), 0) as totalHoy,
                COUNT(*) as cantidadPedidos
            FROM venta_cabecera 
            WHERE DATE(fecha) = CURDATE() AND id_local = ?;

            SELECT COUNT(*) as productosBajoStock 
            FROM producto_sucursal_stock 
            WHERE cantidad <= 5 AND id_local = ?;

            SELECT 
                mp.descripcion as medio, 
                IFNULL(SUM(mpv.monto), 0) as monto
            FROM medio_pago mp
            LEFT JOIN mediospagos_ventaCabecera mpv ON mp.id_medio_pago = mpv.id_medio_pago 
            LEFT JOIN venta_cabecera vc ON mpv.id_cabecera = vc.id_cabecera AND DATE(vc.fecha) = CURDATE() AND vc.id_local = ?
            GROUP BY mp.id_medio_pago, mp.descripcion;

            SELECT p.descripcion, SUM(vd.cantidad) as cantidad 
            FROM venta_detalle vd
            INNER JOIN producto p ON vd.id_producto = p.id_producto 
            INNER JOIN venta_cabecera vc ON vd.id_cabecera = vc.id_cabecera
            WHERE vc.id_local = ?
            GROUP BY vd.id_producto, p.descripcion 
            ORDER BY cantidad DESC 
            LIMIT 5;
        `;
        const results = await query(sql, [idLocal, idLocal, idLocal, idLocal]);

        return {
            totalHoy: results[0]?.[0]?.totalHoy || 0,
            cantidadPedidos: results[0]?.[0]?.cantidadPedidos || 0,
            productosBajoStock: results[1]?.[0]?.productosBajoStock || 0,
            desglosePagos: results[2] || [],
            topProductos: results[3] || []
        };
    }

    // GUARDAR CIERRE DE CAJA
    async guardarCierreCaja(data) {
        const { id_usuario, esperado, real, otros, diferencia, observaciones } = data;
        const sql = `INSERT INTO cierre_caja 
                    (id_usuario, monto_esperado_efectivo, monto_real_efectivo, monto_otros_medios, diferencia, observaciones) 
                    VALUES (?, ?, ?, ?, ?, ?)`;
        const result = await query(sql, [id_usuario, esperado, real, otros, diferencia, observaciones]);
        return result.insertId;
    }

    // OBTENER HISTORIAL DE CAJA
    async obtenerHistorialCaja() {
        const sql = `
            SELECT 
                c.*, 
                u.nombre AS nombre_vendedor
            FROM cierre_caja c
            LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
            ORDER BY c.fecha DESC
        `;
        return await query(sql);
    }

    // OBTENER REPORTE POR RANGO
    async obtenerReporteRango(inicio, fin) {
        let sql = `
            SELECT 
                vc.id_cabecera,
                DATE(vc.fecha) as fecha,
                COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente,
                vc.total_venta as total,
                GROUP_CONCAT(DISTINCT CONCAT(mp.descripcion, ': $', FORMAT(mpv.monto, 0)) SEPARATOR ' | ') as medios_pago
            FROM venta_cabecera vc
            LEFT JOIN cliente c ON vc.id_cliente = c.id_cliente
            LEFT JOIN mediospagos_ventaCabecera mpv ON vc.id_cabecera = mpv.id_cabecera
            LEFT JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
            WHERE 1=1
        `;
        const params = [];

        if (inicio && fin) {
            sql += ` AND DATE(vc.fecha) BETWEEN ? AND ?`;
            params.push(inicio, fin);
        }

        sql += ` GROUP BY vc.id_cabecera ORDER BY vc.fecha DESC`;
        return await query(sql, params);
    }

    // DESACTIVAR PRODUCTO
    async desactivarProducto(id_producto) {
        const sql = 'UPDATE producto SET activo = ? WHERE id_producto = ?';
        const result = await query(sql, ['No', id_producto]);
        return result.affectedRows;
    }
}

module.exports = new VentaModel();