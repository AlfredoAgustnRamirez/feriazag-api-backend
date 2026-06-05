const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const CategoriaController = require('../controllers/categoria.controller');
const { handleValidationErrors } = require('../middlewares/validation');

// ============ VALIDACIONES ============

const validateCategoriaCreate = [
  body('descripcion').trim().escape().isLength({ min: 3, max: 50 }).withMessage('La descripción debe tener entre 3 y 50 caracteres'),
  body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

const validateCategoriaUpdate = [
  param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido'),
  body('descripcion').trim().escape().isLength({ min: 3, max: 50 }).withMessage('La descripción debe tener entre 3 y 50 caracteres'),
  body('activo').isIn(['Si', 'No']).withMessage('Estado inválido')
];

const validateCategoriaId = [
  param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido')
];

const validateCategoriaEstado = [
  param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido'),
  body('activo').isIn(['Si', 'No']).withMessage('Estado inválido')
];

// ============ RUTAS ============

// Listar todas las categorías
router.get('/listar',
  verificarToken,
  CategoriaController.listarCategorias
);

// Listar solo categorías activas
router.get('/activas',
  verificarToken,
  CategoriaController.listarCategoriasActivas
);

// Obtener categoría por ID
router.get('/obtener/:id_categoria',
  verificarToken,
  validateCategoriaId,
  handleValidationErrors,
  CategoriaController.obtenerCategoriaPorId
);

// Crear categoría
router.post('/register',
  verificarToken,
  validateCategoriaCreate,
  handleValidationErrors,
  CategoriaController.crearCategoria
);

// Actualizar categoría
router.put('/update/:id_categoria',
  verificarToken,
  validateCategoriaUpdate,
  handleValidationErrors,
  CategoriaController.actualizarCategoria
);

// Cambiar estado (activar/desactivar)
router.patch('/cambiar-estado/:id_categoria',
  verificarToken,
  validateCategoriaEstado,
  handleValidationErrors,
  CategoriaController.cambiarEstado
);

// Eliminar categoría
router.delete('/eliminar/:id_categoria',
  verificarToken,
  validateCategoriaId,
  handleValidationErrors,
  CategoriaController.eliminarCategoria
);

module.exports = router;