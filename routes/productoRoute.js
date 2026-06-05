const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const ProductoController = require('../controllers/producto.controller');
const { 
  validateProductoCreate,
  validateProductoUpdate,
  validateProductoId,
  validateStockTransfer,
  validateProductoLocal
} = require('../middlewares/validation');
const { handleValidationErrors } = require('../middlewares/validation');


// ============ PRODUCTOS ============

router.post('/register', 
  verificarToken, 
  upload.single('imagen'),
  validateProductoCreate,
  handleValidationErrors,
  ProductoController.crearProducto
);

router.put('/update/:id_producto',
  verificarToken,
  upload.single('imagen'),
  validateProductoUpdate,
  handleValidationErrors,
  ProductoController.actualizarProducto
);

router.get('/todos', 
  verificarToken,
  ProductoController.obtenerTodosLosProductos
);

router.get('/todos-con-stock',
  verificarToken,
  ProductoController.obtenerProductosConStock
);

router.get('/todos-con-stock-total', 
  verificarToken,
  ProductoController.obtenerTodosLosProductosConStockTotal
);

router.get('/listar-con-stock/:idLocal',
  verificarToken,
  validateProductoLocal,
  handleValidationErrors,
  ProductoController.obtenerProductosConStock
);

router.get('/todos-por-local/:idLocal',
  verificarToken,
  validateProductoLocal,
  handleValidationErrors,
  ProductoController.obtenerProductosPorLocal
);

router.get('/listar',
  verificarToken,
  ProductoController.obtenerProductosActivos
);

router.get('/vendidos',
  verificarToken,
  ProductoController.obtenerProductosVendidos
);

router.get('/no-vendidos',
  verificarToken,
  ProductoController.obtenerProductosNoVendidos
);

router.get('/stock-bajo',
  verificarToken,
  ProductoController.obtenerProductosBajoStock
);

router.get('/no-asignados/:idLocal',
  verificarToken,
  validateProductoLocal,
  handleValidationErrors,
  ProductoController.obtenerProductosNoAsignados
);

// ============ ESTADO ============

router.put('/activar/:id_producto',
  verificarToken,
  validateProductoId,
  handleValidationErrors,
  ProductoController.activarProducto
);

router.put('/desactivar/:id_producto',
  verificarToken,
  validateProductoId,
  handleValidationErrors,
  ProductoController.desactivarProducto
);

router.delete('/desactivar/:id',
  verificarToken,
  validateProductoId,
  handleValidationErrors,
  ProductoController.desactivarProducto
);

router.delete('/activar/:id',
  verificarToken,
  validateProductoId,
  handleValidationErrors,
  ProductoController.activarProducto
);

// ============ STOCK ============

router.get('/stock/sucursales/:id_producto',
  verificarToken,
  validateProductoId,
  handleValidationErrors,
  ProductoController.obtenerStockPorSucursales
);

router.get('/stock/todas-sucursales/:id_producto',
  verificarToken,
  validateProductoId,
  handleValidationErrors,
  ProductoController.obtenerStockTodasSucursales
);

router.post('/stock/transferir',
  verificarToken,
  validateStockTransfer,
  handleValidationErrors,
  ProductoController.transferirStock
);

router.post('/asignar-a-local',
  verificarToken,
  ProductoController.asignarProductoALocal
);

router.delete('/desactivar-en-local/:id_producto/:id_local',
  verificarToken,
  ProductoController.desactivarProductoEnLocal
);

// ============ BÚSQUEDA ============

router.get('/stock/buscar-todas',
  verificarToken,
  ProductoController.buscarProductos
);

// ============ SUCURSALES ============

router.get('/local/usuario/locales',
  verificarToken,
  ProductoController.obtenerSucursalesUsuario
);

module.exports = router;