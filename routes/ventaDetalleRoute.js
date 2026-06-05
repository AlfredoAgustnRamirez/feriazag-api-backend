const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const VentaDetalleController = require('../controllers/ventaDetalle.controller');
const { 
  validateIdCabecera,
  validateReporteRango,
  handleValidationErrors
} = require('../middlewares/validation');

// ============ RUTAS EXISTENTES ============

router.get('/listar', verificarToken, VentaDetalleController.listarVentas);

router.get('/listar/:idCabecera',
  verificarToken,
  validateIdCabecera,
  handleValidationErrors,
  VentaDetalleController.obtenerVentaDetalle
);

router.get('/medios-pago/:idCabecera',
  verificarToken,
  validateIdCabecera,
  handleValidationErrors,
  VentaDetalleController.obtenerMediosPagoPorVenta
);

router.get('/reporte/rango',
  verificarToken,
  validateReporteRango,
  handleValidationErrors,
  VentaDetalleController.reportePorRango
);

router.get('/reporte/completo',
  verificarToken,
  VentaDetalleController.reporteCompleto
);

// ============ NUEVAS RUTAS PARA DÍA/SEMANA/MES ============

router.get('/reporte/dia',
  verificarToken,
  VentaDetalleController.getVentaDetalleDia
);

router.get('/reporte/semana',
  verificarToken,
  VentaDetalleController.getVentaDetalleSemana
);

router.get('/reporte/mes',
  verificarToken,
  VentaDetalleController.getVentaDetalleMes
);

module.exports = router;