const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const CompraController = require('../controllers/compra.controller');
const { 
  validateCompraCreate,
  validateCompraId,
  handleValidationErrors
} = require('../middlewares/validation');

// ============ RUTAS ============

// Listar todas las compras
router.get('/listar', 
  verificarToken,
  CompraController.listarCompras
);

// Obtener compra por ID
router.get('/:id',
  verificarToken,
  validateCompraId,
  handleValidationErrors,
  CompraController.obtenerCompraPorId
);

// Crear nueva compra
router.post('/register',
  verificarToken,
  validateCompraCreate,
  handleValidationErrors,
  CompraController.crearCompra
);

// Listar proveedores activos (para el formulario)
router.get('/proveedores/activos',
  verificarToken,
  CompraController.listarProveedoresActivos
);

// Listar productos activos (para el formulario)
router.get('/productos/activos',
  verificarToken,
  CompraController.listarProductosActivos
);

module.exports = router;