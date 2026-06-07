const express = require("express");
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const ClienteController = require('../controllers/cliente.controller');

// Middleware de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

// ============ RUTAS ============

// LISTAR CLIENTES
router.get("/listar", verificarToken, [
    query('estado').optional().isIn(['activos', 'inactivos']).withMessage('Estado inválido')
], handleValidationErrors, ClienteController.listarClientes);

// BUSCAR CLIENTES
router.get("/buscar", verificarToken, [
    query('search').optional().trim().escape().isLength({ max: 100 }).withMessage('Búsqueda demasiado larga')
], handleValidationErrors, ClienteController.buscarClientes);

// OBTENER CLIENTE POR ID
router.get("/obtener/:id_cliente", verificarToken, [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
], handleValidationErrors, ClienteController.obtenerClientePorId);

// CREAR CLIENTE
router.post("/register", verificarToken, [
    body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
    body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/).withMessage('DNI/CUIT inválido'),
    body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/).withMessage('Teléfono inválido'),
    body('correo_electronico').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
    body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
], handleValidationErrors, ClienteController.crearCliente);

// ACTUALIZAR CLIENTE
router.put("/update/:id_cliente", verificarToken, [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
    body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
    body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/).withMessage('DNI/CUIT inválido'),
    body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/).withMessage('Teléfono inválido'),
    body('correo_electronico').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
    body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
], handleValidationErrors, ClienteController.actualizarCliente);

// CAMBIAR ESTADO (ACTIVAR/DESACTIVAR)
router.patch("/cambiar-estado/:id_cliente", verificarToken, [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
    body('activo').isIn(['SI', 'NO']).withMessage('Estado inválido')
], handleValidationErrors, ClienteController.cambiarEstado);

// ELIMINAR CLIENTE (solo si no tiene ventas)
router.delete("/eliminar/:id_cliente", verificarToken, [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
], handleValidationErrors, ClienteController.eliminarCliente);

// LISTAR TIPOS DE CLIENTE
router.get("/tipos", verificarToken, ClienteController.listarTiposCliente);

module.exports = router;