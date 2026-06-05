const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class VentaDetalleModel {

  // Obtener todas las ventas con resumen
  async listarVentas() {
    const sql = `
      SELECT 
        v.id_cabecera,
        v.fecha,
        v.total_venta,
        COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente,
        GROUP_CONCAT(DISTINCT CONCAT(mp.descripcion, ': $', FORMAT(mpv.monto, 0)) SEPARATOR ' | ') as medios_pago
      FROM venta_cabecera v
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      LEFT JOIN mediospagos_ventaCabecera mpv ON v.id_cabecera = mpv.id_cabecera
      LEFT JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
      GROUP BY v.id_cabecera, v.fecha, v.total_venta, c.nombre_razon_social
      ORDER BY v.id_cabecera DESC
    `;
    return await query(sql);
  }

  // Obtener productos de una venta específica
  async obtenerProductosPorVenta(idCabecera) {
    const sql = `
      SELECT 
        p.cod_producto,
        p.descripcion,
        vd.precio,
        vd.cantidad,
        (vd.precio * vd.cantidad) as subtotal
      FROM venta_detalle vd
      INNER JOIN producto p ON vd.id_producto = p.id_producto
      WHERE vd.id_cabecera = ?
      ORDER BY vd.id_detalle
    `;
    return await query(sql, [idCabecera]);
  }

  // Obtener detalle completo de una venta
  async obtenerVentaPorId(idCabecera) {
    const sql = `
      SELECT 
        v.id_cabecera,
        v.fecha,
        v.total_venta,
        COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente,
        u.nombre as vendedor,
        (
          SELECT GROUP_CONCAT(CONCAT(mp.descripcion, ': $', FORMAT(mpv.monto, 0)) SEPARATOR ' | ')
          FROM mediospagos_ventaCabecera mpv
          INNER JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
          WHERE mpv.id_cabecera = v.id_cabecera
        ) as medios_pago
      FROM venta_cabecera v
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.id_cabecera = ?
    `;
    const result = await query(sql, [idCabecera]);
    return result[0];
  }

  // Obtener medios de pago de una venta
  async obtenerMediosPagoPorVenta(idCabecera) {
    const sql = `
      SELECT 
        mp.descripcion,
        mpv.monto
      FROM mediospagos_ventaCabecera mpv
      INNER JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
      WHERE mpv.id_cabecera = ?
    `;
    return await query(sql, [idCabecera]);
  }

  // Reporte por rango de fechas
  async reportePorRango(inicio, fin) {
    const sql = `
      SELECT 
        v.id_cabecera,
        DATE(v.fecha) as fecha,
        COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente,
        v.total_venta,
        (
          SELECT GROUP_CONCAT(CONCAT(mp.descripcion, ': $', FORMAT(mpv.monto, 0)) SEPARATOR ' | ')
          FROM mediospagos_ventaCabecera mpv
          INNER JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
          WHERE mpv.id_cabecera = v.id_cabecera
        ) as medios_pago,
        (SELECT COUNT(*) FROM venta_detalle vd WHERE vd.id_cabecera = v.id_cabecera) as cantidad_productos
      FROM venta_cabecera v
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      WHERE DATE(v.fecha) BETWEEN ? AND ?
      ORDER BY v.fecha DESC
    `;
    return await query(sql, [inicio, fin]);
  }

  // Reporte completo (con o sin filtro de fechas)
  async reporteCompleto(inicio = null, fin = null) {
    let sql = `
      SELECT 
        v.id_cabecera,
        DATE(v.fecha) as fecha,
        v.total_venta,
        COALESCE(c.nombre_razon_social, 'Consumidor Final') as cliente,
        (
          SELECT GROUP_CONCAT(CONCAT(mp.descripcion, ': $', FORMAT(mpv.monto, 0)) SEPARATOR ' | ')
          FROM mediospagos_ventaCabecera mpv
          INNER JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
          WHERE mpv.id_cabecera = v.id_cabecera
        ) as medios_pago
      FROM venta_cabecera v
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      WHERE 1=1
    `;
    
    const params = [];
    if (inicio && fin) {
      sql += ` AND DATE(v.fecha) BETWEEN ? AND ?`;
      params.push(inicio, fin);
    }
    
    sql += ` ORDER BY v.id_cabecera DESC`;
    return await query(sql, params);
  }
}

module.exports = new VentaDetalleModel();