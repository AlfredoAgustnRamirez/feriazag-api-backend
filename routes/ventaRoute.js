const express = require('express');
const paymentManager = require('../managers/paymentManager');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const { verificarToken } = require('../middlewares/auth');
const VentaController = require('../controllers/venta.controller');

// ============ VALIDACIONES ============
const validateRegistroVenta = [
    body('total_venta').isFloat({ min: 0 }).withMessage('Total de venta inválido'),
    body('iduser').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('detalles.*.id_producto').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('detalles.*.precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('detalles.*.cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida'),
    body('medios_pago').isArray({ min: 1 }).withMessage('Debe especificar al menos un medio de pago'),
    body('medios_pago.*.id_medio_pago').isInt({ min: 1, max: 4 }).withMessage('ID de medio pago inválido'),
    body('medios_pago.*.monto').isFloat({ min: 0 }).withMessage('Monto inválido'),
    body('id_local').isInt({ min: 1 }).withMessage('ID de local inválido'),
    body('id_cliente').optional().isInt({ min: 1 }).withMessage('ID de cliente inválido')
];

const validateReporteRango = [
    query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

// ============ RUTAS ============
// Calcular totales (con descuentos individuales y global)
router.post('/calcular-totales',
    VentaController.calcularTotales
);

// LISTAR PRODUCTOS PARA VENTA
router.get('/listar',
    verificarToken,
    VentaController.listarProductos);

// REGISTRAR VENTA
router.post('/register-sp',
    verificarToken,
    validateRegistroVenta,
    handleValidationErrors,
    VentaController.registrarVenta
);

router.post('/ventas', async (req, res) => {
    const { totalVenta, mediosPago, productos } = req.body;

    try {
        for (const pago of mediosPago) {
            const resultado = await paymentManager.procesarPago(
                pago.id_medio_pago,
                pago.monto,
                pago.datos
            );

            if (resultado.estado === 'PENDIENTE_QR') {
                // Lógica para devolver el QR a Angular...
            }
        }

        res.json({ status: 'success', message: 'Venta y pagos registrados correctamente.' });

    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
});

// VENTAS POR FECHA
router.get('/por-fecha',
    verificarToken,
    VentaController.obtenerVentasPorFecha);

// MEDIOS DE PAGO
router.get('/medios-pago',
    verificarToken,
    VentaController.obtenerMediosPago);

// DASHBOARD STATS
router.get('/dashboard-stats',
    verificarToken,
    VentaController.getDashboardStats);

// GUARDAR CIERRE DE CAJA
router.post('/guardar-caja',
    verificarToken,
    VentaController.guardarCierre);

// HISTORIAL DE CAJA
router.get('/historial-caja',
    verificarToken,
    VentaController.getHistorialCaja);

// REPORTE POR RANGO
router.get('/reporte/rango',
    verificarToken,
    validateReporteRango,
    handleValidationErrors,
    VentaController.getReporteRango
);

router.post('/calcular-total',
    VentaController.calcularTotalConRecargo
);

router.get('/verificar-caja',
    VentaController.verificarCajaAbierta
);

// TODAS LAS VENTAS
router.get('/todas',
    verificarToken,
    VentaController.obtenerTodasLasVentas
);

// ============================================================
// NUEVA RUTA: Consultar stock disponible
// GET /api/ventas/stock/:id_producto/:id_local
// ============================================================
router.get('/stock/:id_producto/:id_local',
    VentaController.consultarStockDisponible);

// DESACTIVAR PRODUCTO
router.delete('/desactivar/:id_producto',
    verificarToken,
    VentaController.desactivarProducto
);



module.exports = router;