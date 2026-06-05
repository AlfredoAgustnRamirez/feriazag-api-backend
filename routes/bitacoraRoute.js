const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const BitacoraController = require('../controllers/bitacora.controller');
const { handleValidationErrors } = require('../middlewares/validation');

// ============ RUTAS ============

// Registrar acción en bitácora
router.post('/registrar', 
  verificarToken, 
  BitacoraController.registrar
);

// Listar bitácora con filtros
router.get('/listar', 
  verificarToken, 
  BitacoraController.listar
);

// Listar bitácora por usuario
router.get('/usuario/:id_usuario', 
  verificarToken, 
  BitacoraController.listarPorUsuario
);

// Listar bitácora por entidad
router.get('/entidad/:entidad/:id_registro', 
  verificarToken, 
  BitacoraController.listarPorEntidad
);

module.exports = router;