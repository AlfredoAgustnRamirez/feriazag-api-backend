// routes/reporte.routes.js
const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const ReporteController = require('../controllers/reporte.controller');
const { 
  handleValidationErrors,
  validateReporteFechas,
  validateReporteFechasOpcional,
  validateReporteIdLocal,
  validateReporteLimit,
  validateReporteLimite
} = require('../middlewares/validation');

// ============ REPORTE DE VENTAS ============

// Ventas por rango de fechas
router.get('/ventas/rango',
  verificarToken,
  validateReporteFechas,
  validateReporteIdLocal,
  handleValidationErrors,
  ReporteController.getVentasPorRango
);

// Resumen de ventas por día
router.get('/ventas/resumen-diario',
  verificarToken,
  validateReporteFechas,
  validateReporteIdLocal,
  handleValidationErrors,
  ReporteController.getResumenVentasPorDia
);

// Ventas por medio de pago
router.get('/ventas/por-medio-pago',
  verificarToken,
  validateReporteFechas,
  validateReporteIdLocal,
  handleValidationErrors,
  ReporteController.getVentasPorMedioPago
);

// Top productos más vendidos
router.get('/ventas/top-productos',
  verificarToken,
  validateReporteFechas,
  validateReporteIdLocal,
  validateReporteLimit,
  handleValidationErrors,
  ReporteController.getTopProductosVendidos
);

// Ventas por local
router.get('/ventas/por-local',
  verificarToken,
  validateReporteFechas,
  handleValidationErrors,
  ReporteController.getVentasPorLocal
);

// ============ REPORTE DE PRODUCTOS ============

// Productos con poco stock
router.get('/productos/poco-stock',
  verificarToken,
  validateReporteIdLocal,
  validateReporteLimite,
  handleValidationErrors,
  ReporteController.getProductosPocoStock
);

// Productos sin stock
router.get('/productos/sin-stock',
  verificarToken,
  validateReporteIdLocal,
  handleValidationErrors,
  ReporteController.getProductosSinStock
);

// Productos con mayor stock
router.get('/productos/mayor-stock',
  verificarToken,
  validateReporteIdLocal,
  validateReporteLimit,
  handleValidationErrors,
  ReporteController.getProductosMayorStock
);

// ============ REPORTE DE CLIENTES ============

// Top clientes
router.get('/clientes/top',
  verificarToken,
  validateReporteFechas,
  validateReporteIdLocal,
  validateReporteLimit,
  handleValidationErrors,
  ReporteController.getTopClientes
);

// ============ REPORTE DE CAJA ============

// Resumen de caja
router.get('/caja/resumen',
  verificarToken,
  validateReporteFechasOpcional,
  validateReporteIdLocal,
  handleValidationErrors,
  ReporteController.getResumenCaja
);

module.exports = router;