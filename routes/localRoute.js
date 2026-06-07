const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth');
const LocalController = require('../controllers/local.controller');

// ============ RUTAS ============

// Obtener local activo del usuario
router.get('/usuario', 
  verificarToken, 
  LocalController.getLocalActivo);

// Obtener todos los locales del usuario
router.get('/usuario/locales', 
  verificarToken, 
  LocalController.getLocalesByUsuario);

// Cambiar local activo
router.get('/cambiar/:idLocal', 
  verificarToken, 
  LocalController.cambiarLocalActivo);

// Crear nuevo local
router.post('/crear', 
  verificarToken, 
  LocalController.crearLocal);

// Actualizar configuración del local
router.put('/configuracion', 
  verificarToken, 
  LocalController.actualizarLocal);

// Eliminar local
router.delete('/eliminar/:idLocal', 
  verificarToken, 
  LocalController.eliminarLocal);

// Listar todos los locales (admin)
router.get('/todos', 
  verificarToken, 
  LocalController.listarTodos);

module.exports = router;