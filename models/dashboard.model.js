const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class DashboardModel {

  async getStatus(idLocal) {
  const ahora = new Date();
  const fechaArgentina = new Date(ahora.getTime());
  fechaArgentina.setHours(fechaArgentina.getHours() - 3);
  const fechaHoy = fechaArgentina.toISOString().split('T')[0];
  
  const ventasHoyQuery = `
    SELECT 
      COUNT(*) as total, 
      IFNULL(SUM(total_venta), 0) as monto 
    FROM venta_cabecera 
    WHERE DATE(fecha) = ? AND id_local = ?
  `;
  const ventasHoy = await query(ventasHoyQuery, [fechaHoy, idLocal]);
  
  const ventasSemanaQuery = `
    SELECT 
      COUNT(*) as total, 
      IFNULL(SUM(total_venta), 0) as monto 
    FROM venta_cabecera 
    WHERE YEARWEEK(fecha) = YEARWEEK(CURDATE()) AND id_local = ?
  `;
  const ventasSemana = await query(ventasSemanaQuery, [idLocal]);
  
  const ventasMesQuery = `
    SELECT 
      COUNT(*) as total, 
      IFNULL(SUM(total_venta), 0) as monto 
    FROM venta_cabecera 
    WHERE MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE()) AND id_local = ?
  `;
  const ventasMes = await query(ventasMesQuery, [idLocal]);
  
  const totalProductosQuery = `
    SELECT COUNT(*) as total 
    FROM producto_sucursal_stock 
    WHERE id_local = ? AND cantidad > 0
  `;
  const totalProductos = await query(totalProductosQuery, [idLocal]);
  
  const productosBajoStockQuery = `
    SELECT COUNT(*) as total 
    FROM producto_sucursal_stock 
    WHERE id_local = ? AND cantidad <= 5 AND cantidad > 0
  `;
  const productosBajoStock = await query(productosBajoStockQuery, [idLocal]);
  
  const productoSinStockQuery = `
    SELECT COUNT(*) as total 
    FROM producto_sucursal_stock 
    WHERE id_local = ? AND cantidad = 0
  `;
  const productoSinStock = await query(productoSinStockQuery, [idLocal]);
  
  const totalCategoriasQuery = `SELECT COUNT(*) as total FROM categoria`;
  const totalCategorias = await query(totalCategoriasQuery);
  
  return {
    totalProductos: totalProductos[0]?.total || 0,
    productosBajoStock: productosBajoStock[0]?.total || 0,
    productoSinStock: productoSinStock[0]?.total || 0,
    totalCategorias: totalCategorias[0]?.total || 0,
    ventasHoy: {
      cantidad: ventasHoy[0]?.total || 0,
      monto: ventasHoy[0]?.monto || 0
    },
    ventasSemana: {
      cantidad: ventasSemana[0]?.total || 0,
      monto: ventasSemana[0]?.monto || 0
    },
    ventasMes: {
      cantidad: ventasMes[0]?.total || 0,
      monto: ventasMes[0]?.monto || 0
    }
  };
}

  async getDistribucionPagos(idLocal) {
    const sql = `
      SELECT 
        mp.descripcion as nombre,
        COUNT(*) as cantidad,
        IFNULL(SUM(mpv.monto), 0) as total
      FROM medio_pago mp
      LEFT JOIN mediospagos_ventaCabecera mpv ON mp.id_medio_pago = mpv.id_medio_pago
      LEFT JOIN venta_cabecera vc ON mpv.id_cabecera = vc.id_cabecera
      WHERE vc.id_local = ? OR vc.id_local IS NULL
      GROUP BY mp.id_medio_pago, mp.descripcion
    `;
    return await query(sql, [idLocal]);
  }

  async getStockCritico(idLocal) {
    const sql = `
      SELECT 
        p.id_producto,
        p.cod_producto,
        p.descripcion,
        pss.cantidad as stock,
        p.precio,
        c.descripcion as categoria
      FROM producto_sucursal_stock pss
      INNER JOIN producto p ON pss.id_producto = p.id_producto
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE pss.id_local = ? AND pss.cantidad <= 5 AND pss.cantidad > 0
      ORDER BY pss.cantidad ASC
      LIMIT 10
    `;
    return await query(sql, [idLocal]);
  }

  async getVentasRecientes(idLocal) {
    const sql = `
      SELECT 
        vc.id_cabecera,
        DATE(vc.fecha) as fecha,
        vc.total_venta as total,
        COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente
      FROM venta_cabecera vc
      LEFT JOIN cliente c ON vc.id_cliente = c.id_cliente
      WHERE vc.id_local = ?
      ORDER BY vc.fecha DESC
      LIMIT 10
    `;
    return await query(sql, [idLocal]);
  }

  async getVentasPorPeriodo(periodo, idLocal) {
    let sql = '';
    if (periodo === 'semana') {
      sql = `
        SELECT 
          DATE(fecha) as dia,
          IFNULL(SUM(total_venta), 0) as total
        FROM venta_cabecera
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) AND id_local = ?
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
      `;
    } else if (periodo === 'mes') {
      sql = `
        SELECT 
          DATE(fecha) as dia,
          IFNULL(SUM(total_venta), 0) as total
        FROM venta_cabecera
        WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 29 DAY) AND id_local = ?
        GROUP BY DATE(fecha)
        ORDER BY dia ASC
      `;
    } else {
      sql = `
        SELECT 
          MONTH(fecha) as mes,
          IFNULL(SUM(total_venta), 0) as total
        FROM venta_cabecera
        WHERE YEAR(fecha) = YEAR(CURDATE()) AND id_local = ?
        GROUP BY MONTH(fecha)
        ORDER BY mes ASC
      `;
    }

    const results = await query(sql, [idLocal]);

    let valores = [];
    if (periodo === 'semana' || periodo === 'mes') {
      valores = results.map(r => r.total);
    } else {
      const meses = Array(12).fill(0);
      results.forEach(r => { meses[r.mes - 1] = r.total; });
      valores = meses;
    }

    return { valores, valores_anuales: valores };
  }

  async getTopProductos(idLocal, limit = 5) {
    const sql = `
      SELECT 
        p.descripcion,
        SUM(vd.cantidad) as cantidad
      FROM venta_detalle vd
      INNER JOIN producto p ON vd.id_producto = p.id_producto
      INNER JOIN venta_cabecera vc ON vd.id_cabecera = vc.id_cabecera
      WHERE vc.id_local = ?
      GROUP BY p.id_producto, p.descripcion
      ORDER BY cantidad DESC
      LIMIT ?
    `;
    const resultados = await query(sql, [idLocal, parseInt(limit)]);
    return resultados;
  }
}

module.exports = new DashboardModel();