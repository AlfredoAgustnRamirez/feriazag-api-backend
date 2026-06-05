const express = require('express');
const conection = require('../conection');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');

router.get('/activa', verificarToken, (req, res) => {
  const { id_local } = req.query;
  const userId = req.usuario?.id_usuario;
    
  let query = `
    SELECT 
      id_cierre,
      'abierta' as estado,
      fecha as fecha_apertura,
      monto_esperado_efectivo as monto_inicial,
      monto_esperado_efectivo,
      id_local
    FROM cierre_caja 
    WHERE monto_real_efectivo IS NULL
  `;
  
  const params = [];
  
  if (id_local) {
    query += ' AND id_local = ?';
    params.push(id_local);
  }
  
  query += ' ORDER BY id_cierre DESC LIMIT 1';
  
  conection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: error.message });
    }
    
    res.json(results[0] || null);
  });
});



// ============ CERRAR CAJA ============
router.put('/cierre/:id', verificarToken, [
  param('id').isInt({ min: 1 }).withMessage('ID de cierre inválido'),
  body('monto_real_efectivo').isFloat({ min: 0 }).withMessage('Monto real inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  
  const { id } = req.params;
  const { monto_real_efectivo, observaciones } = req.body;  
  
  conection.query(
    'SELECT monto_esperado_efectivo FROM cierre_caja WHERE id_cierre = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'Caja no encontrada' });
      }
      
      const montoEsperado = results[0].monto_esperado_efectivo || 0;
      const diferencia = (monto_real_efectivo || 0) - montoEsperado;
      
      const query = `
        UPDATE cierre_caja 
        SET 
          monto_real_efectivo = ?,
          diferencia = ?,
          observaciones = CONCAT(IFNULL(observaciones, ''), ' | Cierre: ', ?),
          fecha_cierre = NOW()
        WHERE id_cierre = ?
      `;
      
      conection.query(query, [
        monto_real_efectivo, 
        diferencia, 
        observaciones || '', 
        id
      ], (err2) => {
        if (err2) {
          console.error('Error al cerrar caja:', err2);
          return res.status(500).json({ error: err2.message });
        }
        
        res.json({ 
          success: true, 
          message: 'Caja cerrada correctamente',
          diferencia: diferencia
        });
      });
    }
  );
});


// ============ VENTAS DEL DÍA ============
router.get('/ventas-dia', verificarToken, (req, res) => {
  const { id_local, fecha } = req.query;
  const fechaBuscar = fecha || new Date().toISOString().split('T')[0];

  const queryTest = 'SELECT COUNT(*) as total FROM venta_cabecera';
  conection.query(queryTest, (err, test) => {
  });
  
  const query1 = `
    SELECT * FROM venta_cabecera 
    WHERE fecha LIKE '${fechaBuscar}%'
  `;
  
  conection.query(query1, (err, ventasPorLike) => {
  });
  
  const query = `
    SELECT 
      vc.id_cabecera,
      vc.total_venta,
      vc.fecha,
      vc.id_local,
      mp.descripcion as medio,
      mpv.monto,
      u.nombre as vendedor
    FROM venta_cabecera vc
    JOIN mediospagos_ventacabecera mpv ON vc.id_cabecera = mpv.id_cabecera
    JOIN medio_pago mp ON mpv.id_medio_pago = mp.id_medio_pago
    JOIN usuarios u ON vc.id_usuario = u.id_usuario
    WHERE (DATE(vc.fecha) = ? OR vc.fecha LIKE ?) 
    AND vc.id_local = ?
  `;
  
  conection.query(query, [fechaBuscar, `${fechaBuscar}%`, id_local], (err, results) => {
    if (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (results.length === 0) {
      return res.json({ desglosePagos: [], ventas: [] });
    }
    
    const desglosePagosMap = new Map();
    const ventasMap = new Map();
    
    results.forEach(row => {
      const medio = row.medio;
      const monto = parseFloat(row.monto) || 0;
      
      if (!desglosePagosMap.has(medio)) {
        desglosePagosMap.set(medio, 0);
      }
      desglosePagosMap.set(medio, desglosePagosMap.get(medio) + monto);
      
      if (!ventasMap.has(row.id_cabecera)) {
        ventasMap.set(row.id_cabecera, {
          id_cabecera: row.id_cabecera,
          fecha: row.fecha,
          total_venta: parseFloat(row.total_venta),
          desglosePagos: []
        });
      }
      
      const venta = ventasMap.get(row.id_cabecera);
      venta.desglosePagos.push({
        medio: row.medio,
        monto: monto
      });
    });
    
    res.json({
      desglosePagos: Array.from(desglosePagosMap.entries()).map(([medio, monto]) => ({ medio, monto })),
      ventas: Array.from(ventasMap.values())
    });
  });
});

// ============ ABRIR CAJA ============
router.post('/apertura', verificarToken, [
  body('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('id_local').isInt({ min: 1 }).withMessage('ID de local inválido'),
  body('monto_inicial').isFloat({ min: 0 }).withMessage('Monto inicial inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }
  
  const { id_usuario, id_local, monto_inicial, observaciones } = req.body;
    
  conection.query(
    'SELECT id_cierre FROM cierre_caja WHERE monto_real_efectivo IS NULL AND id_local = ?',
    [id_local],
    (err, results) => {
      if (err) {
        console.error('Error al verificar caja:', err);
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Ya hay una caja abierta (ID: ${results[0].id_cierre}). Debe cerrarla primero.`,
          caja_activa_id: results[0].id_cierre
        });
      }
      
      // Insertar nueva caja
      const query = `
        INSERT INTO cierre_caja 
        (id_usuario, id_local, fecha, monto_esperado_efectivo, observaciones) 
        VALUES (?, ?, NOW(), ?, ?)
      `;
      
      conection.query(query, [id_usuario, id_local, monto_inicial, observaciones || ''], (err2, result) => {
        if (err2) {
          console.error('Error al abrir caja:', err2);
          return res.status(500).json({ error: err2.message });
        }
                
        res.json({ 
          success: true, 
          message: 'Caja abierta correctamente', 
          id: result.insertId 
        });
      });
    }
  );
});

// ============ HISTORIAL DE CIERRES ============
router.get('/historial', verificarToken, (req, res) => {
  const { id_local, limite } = req.query;
  
  let query = `
    SELECT 
      c.*,
      u.nombre as vendedor
    FROM cierre_caja c
    LEFT JOIN usuarios u ON c.id_usuario = u.id_usuario
    WHERE c.monto_real_efectivo IS NOT NULL
  `;
  
  const params = [];
  
  if (id_local) {
    query += ' AND c.id_local = ?';
    params.push(id_local);
  }
  
  query += ' ORDER BY c.fecha DESC LIMIT ?';
  params.push(limite || 10);
  
  conection.query(query, params, (error, results) => {
    if (error) {
      console.error('Error al obtener historial:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

// ============ MEDIOS DE PAGO ============
router.get('/medios-pago', verificarToken, (req, res) => {
  const query = 'SELECT id_medio_pago, descripcion, activo FROM medio_pago WHERE activo = "Si"';
  
  conection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener medios de pago:', error);
      return res.status(500).json({ error: error.message });
    }
    res.json(results);
  });
});

module.exports = router;