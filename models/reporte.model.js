const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class ReporteModel {
  
  // ============ REPORTE DE VENTAS ============

  async getVentasPorRango(inicio, fin, idLocal) {
    let sql = `
      SELECT 
        vc.id_cabecera,
        DATE(vc.fecha) as fecha,
        vc.total_venta,
        COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente,
        u.nombre as vendedor,
        (
          SELECT GROUP_CONCAT(CONCAT(mp.descripcion, ': $', FORMAT(mpv.monto, 0)) SEPARATOR ' | ')
          FROM mediospagos_ventaCabecera mpv
          INNER JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
          WHERE mpv.id_cabecera = vc.id_cabecera
        ) as medios_pago
      FROM venta_cabecera vc
      LEFT JOIN cliente c ON vc.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON vc.id_usuario = u.id_usuario
      WHERE DATE(vc.fecha) BETWEEN ? AND ?
    `;
    const params = [inicio, fin];
    if (idLocal) {
      sql += ` AND vc.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` ORDER BY vc.fecha DESC`;
    return await query(sql, params);
  }

  async getResumenVentasPorDia(inicio, fin, idLocal) {
    let sql = `
      SELECT 
        DATE(vc.fecha) as fecha,
        COUNT(*) as cantidad_ventas,
        SUM(vc.total_venta) as total_ventas,
        AVG(vc.total_venta) as promedio_venta
      FROM venta_cabecera vc
      WHERE DATE(vc.fecha) BETWEEN ? AND ?
    `;
    const params = [inicio, fin];
    if (idLocal) {
      sql += ` AND vc.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` GROUP BY DATE(vc.fecha) ORDER BY fecha DESC`;
    return await query(sql, params);
  }

  async getVentasPorMedioPago(inicio, fin, idLocal) {
    let sql = `
      SELECT 
        mp.descripcion as medio_pago,
        COUNT(DISTINCT vc.id_cabecera) as cantidad_ventas,
        SUM(mpv.monto) as total
      FROM venta_cabecera vc
      INNER JOIN mediospagos_ventaCabecera mpv ON vc.id_cabecera = mpv.id_cabecera
      INNER JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
      WHERE DATE(vc.fecha) BETWEEN ? AND ?
    `;
    const params = [inicio, fin];
    if (idLocal) {
      sql += ` AND vc.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` GROUP BY mp.id_medio_pago ORDER BY total DESC`;
    return await query(sql, params);
  }

  async getTopProductosVendidos(inicio, fin, idLocal, limit) {
    let sql = `
      SELECT 
        p.id_producto,
        p.cod_producto,
        p.descripcion,
        c.descripcion as categoria,
        SUM(vd.cantidad) as cantidad_vendida,
        SUM(vd.precio * vd.cantidad) as total_facturado
      FROM venta_detalle vd
      INNER JOIN producto p ON vd.id_producto = p.id_producto
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      INNER JOIN venta_cabecera vc ON vd.id_cabecera = vc.id_cabecera
      WHERE DATE(vc.fecha) BETWEEN ? AND ?
    `;
    const params = [inicio, fin];
    if (idLocal) {
      sql += ` AND vc.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` GROUP BY p.id_producto ORDER BY cantidad_vendida DESC LIMIT ?`;
    params.push(parseInt(limit) || 10);
    return await query(sql, params);
  }

  async getVentasPorLocal(inicio, fin) {
    const sql = `
      SELECT 
        l.id_local,
        l.nombre_local,
        COUNT(vc.id_cabecera) as cantidad_ventas,
        SUM(vc.total_venta) as total_ventas,
        AVG(vc.total_venta) as promedio_venta
      FROM venta_cabecera vc
      INNER JOIN local l ON vc.id_local = l.id_local
      WHERE DATE(vc.fecha) BETWEEN ? AND ?
      GROUP BY l.id_local
      ORDER BY total_ventas DESC
    `;
    return await query(sql, [inicio, fin]);
  }

  // ============ REPORTE DE PRODUCTOS ============

  async getProductosPocoStock(idLocal, limite) {
    let sql = `
      SELECT 
        p.id_producto,
        p.cod_producto,
        p.descripcion,
        p.precio,
        c.descripcion as categoria,
        COALESCE(SUM(pss.cantidad), 0) as stock_actual,
        p.activo
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto
    `;
    const params = [];
    if (idLocal) {
      sql += ` AND pss.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` WHERE p.activo = 'Si'
      GROUP BY p.id_producto
      HAVING stock_actual <= ?
      ORDER BY stock_actual ASC
      LIMIT ?
    `;
    params.push(parseInt(limite) || 5, parseInt(limite) || 5);
    return await query(sql, params);
  }

  async getProductosSinStock(idLocal) {
    let sql = `
      SELECT 
        p.id_producto,
        p.cod_producto,
        p.descripcion,
        p.precio,
        c.descripcion as categoria
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto
    `;
    const params = [];
    if (idLocal) {
      sql += ` AND pss.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` WHERE p.activo = 'Si'
      GROUP BY p.id_producto
      HAVING COALESCE(SUM(pss.cantidad), 0) = 0
      ORDER BY p.descripcion
    `;
    return await query(sql, params);
  }

  async getProductosMayorStock(idLocal, limit) {
    let sql = `
      SELECT 
        p.id_producto,
        p.cod_producto,
        p.descripcion,
        p.precio,
        c.descripcion as categoria,
        COALESCE(SUM(pss.cantidad), 0) as stock_total
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto
    `;
    const params = [];
    if (idLocal) {
      sql += ` AND pss.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` WHERE p.activo = 'Si'
      GROUP BY p.id_producto
      ORDER BY stock_total DESC
      LIMIT ?
    `;
    params.push(parseInt(limit) || 10);
    return await query(sql, params);
  }

  // ============ REPORTE DE CLIENTES ============

  async getTopClientes(inicio, fin, idLocal, limit) {
    let sql = `
      SELECT 
        c.id_cliente,
        c.nombre_razon_social,
        c.dni_cuit,
        c.telefono_whatsapp,
        c.correo_electronico,
        tc.descripcion as tipo_cliente,
        COUNT(vc.id_cabecera) as cantidad_compras,
        SUM(vc.total_venta) as total_gastado
      FROM venta_cabecera vc
      INNER JOIN cliente c ON vc.id_cliente = c.id_cliente
      INNER JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
      WHERE DATE(vc.fecha) BETWEEN ? AND ?
        AND c.activo = 'SI'
    `;
    const params = [inicio, fin];
    if (idLocal) {
      sql += ` AND vc.id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` GROUP BY c.id_cliente ORDER BY total_gastado DESC LIMIT ?`;
    params.push(parseInt(limit) || 10);
    return await query(sql, params);
  }

  // ============ REPORTE DE CAJA ============

  async getResumenCaja(inicio, fin, idLocal) {
    let sql = `
      SELECT 
        DATE(fecha) as fecha,
        SUM(monto_esperado_efectivo) as monto_esperado,
        SUM(monto_real_efectivo) as monto_real,
        SUM(diferencia) as diferencia
      FROM cierre_caja
      WHERE 1=1
    `;
    const params = [];
    if (inicio && fin) {
      sql += ` AND DATE(fecha) BETWEEN ? AND ?`;
      params.push(inicio, fin);
    }
    if (idLocal) {
      sql += ` AND id_local = ?`;
      params.push(parseInt(idLocal));
    }
    sql += ` GROUP BY DATE(fecha) ORDER BY fecha DESC`;
    return await query(sql, params);
  }
}

module.exports = new ReporteModel();