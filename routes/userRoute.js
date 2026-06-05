// userRoute.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator'); // ← Agregar esta línea
const { verificarToken } = require('../middlewares/auth');
const UsuarioController = require('../controllers/usuario.controller');
const { handleValidationErrors } = require('../middlewares/validation');

// ============ VALIDACIONES ============
const validateLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
];

// ============ RUTAS ============

// Autenticación
router.post('/login', validateLogin, handleValidationErrors, UsuarioController.login);
router.post('/logout', UsuarioController.logout);
router.get('/verificar', verificarToken, UsuarioController.verificarToken);

// CRUD Usuarios
router.get('/listar', verificarToken, UsuarioController.listarUsuarios);
router.get('/:id', verificarToken, UsuarioController.obtenerUsuarioPorId);
router.post('/register', verificarToken, UsuarioController.crearUsuario);
router.put('/update/:id_usuario', verificarToken, UsuarioController.actualizarUsuario);
router.patch('/cambiar-estado/:id_usuario', verificarToken, UsuarioController.cambiarEstado);

// Perfiles
router.get('/perfiles/listar', verificarToken, UsuarioController.listarPerfiles);

module.exports = router;