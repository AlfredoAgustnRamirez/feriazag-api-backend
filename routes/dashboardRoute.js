const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const DashboardController = require('../controllers/dashboard.controller');
const { handleValidationErrors } = require('../middlewares/validation');

// ============ RUTAS ============

// Estadísticas generales
router.get('/status', 
  verificarToken, 
  DashboardController.getStatus
);

// Distribución de medios de pago
router.get('/distribucion-pagos', 
  verificarToken, 
  DashboardController.getDistribucionPagos
);

// Stock crítico
router.get('/stock-critico', 
  verificarToken, 
  DashboardController.getStockCritico
);

// Ventas recientes
router.get('/ventas-recientes', 
  verificarToken, 
  DashboardController.getVentasRecientes
);

// Ventas por período (semana/mes/año)
router.get('/ventas-por-periodo', 
  verificarToken, 
  DashboardController.getVentasPorPeriodo
);

// Top productos más vendidos
router.get('/top-productos', 
  verificarToken, 
  DashboardController.getTopProductos
);

module.exports = router;