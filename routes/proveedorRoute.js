const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const ProveedorController = require('../controllers/proveedor.controller');
const { 
  validateProveedorCreate,
  validateProveedorUpdate,
  validateProveedorId,
  validateProveedorEstado,
  handleValidationErrors
} = require('../middlewares/validation');

// ============ PROVEEDORES ============

// Listar todos los proveedores
router.get('/listar', 
  verificarToken,
  ProveedorController.listarProveedores
);

// Listar solo proveedores activos
router.get('/activos', 
  verificarToken,
  ProveedorController.listarProveedoresActivos
);

// Obtener un proveedor por ID
router.get('/:id_proveedor',
  verificarToken,
  validateProveedorId,
  handleValidationErrors,
  ProveedorController.obtenerProveedorPorId
);

// Crear nuevo proveedor
router.post('/register', 
  verificarToken, 
  validateProveedorCreate,
  handleValidationErrors,
  ProveedorController.crearProveedor
);

// Actualizar proveedor
router.put('/update/:id_proveedor',
  verificarToken,
  validateProveedorUpdate,
  handleValidationErrors,
  ProveedorController.actualizarProveedor
);

// Cambiar estado (activar/desactivar)
router.put('/estado/:id_proveedor',
  verificarToken,
  validateProveedorEstado,
  handleValidationErrors,
  ProveedorController.cambiarEstadoProveedor
);

// Eliminar proveedor (opcional)
router.delete('/:id_proveedor',
  verificarToken,
  validateProveedorId,
  handleValidationErrors,
  ProveedorController.eliminarProveedor
);

module.exports = router;