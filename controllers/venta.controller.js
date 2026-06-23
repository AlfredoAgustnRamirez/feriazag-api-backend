// Importa el servicio de ventas que contiene la lógica de negocio
const VentaService = require('../services/venta.service');

// Importa la fábrica de estrategias para medios de pago (Patrón Strategy)
const PagoFactory = require('../strategies/pagoFactory');

// Importa el manager de pagos (similar al factory, para obtener estrategias)
const PaymentManager = require('../managers/paymentManager');

/**
 * Controlador de Ventas
 * Maneja todas las peticiones HTTP relacionadas con ventas, productos, caja y reportes
 * Es la capa de entrada de la API
 */
class VentaController {

    /**
     * Obtiene todos los productos disponibles para la venta
     * GET /api/productos
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async listarProductos(req, res, next) {
        try {
            const productos = await VentaService.listarProductos();
            res.json(productos);
        } catch (error) {
            next(error);
        }
    }

    /**
     * ============================================================
     * NUEVO: Consulta el stock disponible de un producto en un local
     * GET /api/ventas/stock/:id_producto/:id_local
     * 
     * @param {Object} req - Petición HTTP (params: id_producto, id_local)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     * ============================================================
     */
    async consultarStockDisponible(req, res, next) {
        try {
            // Obtiene los parámetros de la URL
            const id_producto = parseInt(req.params.id_producto);
            const id_local = parseInt(req.params.id_local);

            // Validación de parámetros
            if (!id_producto || !id_local) {
                return res.status(400).json({
                    success: false,
                    mensaje: 'id_producto e id_local son requeridos'
                });
            }

            // Llama al servicio que ejecuta sp_consultar_stock_disponible
            const stockInfo = await VentaService.consultarStockDisponible(id_producto, id_local);

            // Responde con el stock disponible
            res.json({
                success: true,
                data: stockInfo
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Registra una nueva venta en el sistema
     * POST /api/ventas
     * 
     * @param {Object} req - Petición HTTP (body contiene los datos de la venta)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    // backend/src/controllers/venta.controller.js

/**
 * Registra una nueva venta en el sistema
 * POST /api/ventas
 */
async registrarVenta(req, res, next) {
    try {
        const body = {
            ...req.body,
            iduser: Number(req.body.iduser),
            id_local: Number(req.body.id_local),
            id_cliente: req.body.id_cliente ? Number(req.body.id_cliente) : null,
            subtotal: Number(req.body.subtotal),
            total_venta: Number(req.body.total_venta),
            recargo_monto: Number(req.body.recargo_monto || 0),
            recargo_porcentaje: Number(req.body.recargo_porcentaje || 0),
            detalles: req.body.detalles.map(d => ({
                ...d,
                id_producto: Number(d.id_producto),  
                cantidad: Number(d.cantidad),
                precio: Number(d.precio)
            })),
            medios_pago: req.body.medios_pago.map(m => ({
                ...m,
                id_medio_pago: Number(m.id_medio_pago),
                monto: Number(m.monto || 0)
            }))
        };

        const result = await VentaService.registrarVenta(body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
}

    /**
     * Calcula el total de una venta aplicando recargos según los medios de pago
     * POST /api/ventas/calcular-total-con-recargo
     * 
     * @param {Object} req - Petición HTTP (body contiene los medios de pago)
     * @param {Object} res - Respuesta HTTP
     */
    async calcularTotalConRecargo(req, res) {
        try {
            const { medios_pago } = req.body;

            if (!medios_pago || medios_pago.length === 0) {
                return res.status(400).json({
                    mensaje: 'Debe especificar al menos un medio de pago'
                });
            }

            let totalConRecargos = 0;
            const detallesRecargos = [];

            for (const medio of medios_pago) {
                const strategy = PaymentManager.getStrategy(medio.id_medio_pago);
                const resultado = await strategy.procesar(medio.monto || 0);
                totalConRecargos += resultado.total;
                detallesRecargos.push({
                    id_medio_pago: medio.id_medio_pago,
                    montoOriginal: medio.monto || 0,
                    recargo: resultado.recargo || 0,
                    recargoPorcentaje: resultado.recargoPorcentaje ||
                        (medio.id_medio_pago === 3 ? 10 : medio.id_medio_pago === 5 ? 5 : 0),
                    total: resultado.total
                });
            }

            res.json({
                success: true,
                total: totalConRecargos,
                detalles: detallesRecargos
            });
        } catch (error) {
            console.error('Error al calcular recargo:', error);
            res.status(500).json({ mensaje: error.message });
        }
    }

    /**
     * Obtiene las ventas realizadas en una fecha específica para una sucursal
     * GET /api/ventas/por-fecha?fecha=YYYY-MM-DD&idLocal=1
     * 
     * @param {Object} req - Petición HTTP (query contiene fecha y idLocal)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async obtenerVentasPorFecha(req, res, next) {
        try {
            const { fecha, idLocal } = req.query;

            if (!fecha || !idLocal) {
                return res.status(400).json({
                    error: 'Faltan parámetros: fecha y idLocal son requeridos'
                });
            }

            const ventas = await VentaService.obtenerVentasPorFecha(fecha, idLocal);
            res.json(ventas);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los medios de pago disponibles (Efectivo, Débito, Crédito, etc.)
     * GET /api/medios-pago
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async obtenerMediosPago(req, res, next) {
        try {
            const medios = await VentaService.obtenerMediosPago();
            res.json(medios);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene las estadísticas para el dashboard (ventas del día, productos más vendidos, etc.)
     * GET /api/dashboard-stats?idLocal=1
     * 
     * @param {Object} req - Petición HTTP (query puede contener idLocal)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async getDashboardStats(req, res, next) {
        try {
            const idLocal = req.query.idLocal || 1;
            const stats = await VentaService.obtenerDashboardStats(idLocal);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Guarda un cierre de caja
     * POST /api/cierre-caja
     * 
     * @param {Object} req - Petición HTTP (body contiene datos del cierre)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async guardarCierre(req, res, next) {
        try {
            const id = await VentaService.guardarCierreCaja(req.body);
            res.json({
                mensaje: "Cierre de caja guardado con éxito",
                id
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene el historial completo de cierres de caja
     * GET /api/historial-caja
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async getHistorialCaja(req, res, next) {
        try {
            const historial = await VentaService.obtenerHistorialCaja();
            res.json(historial);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un reporte de ventas en un rango de fechas
     * GET /api/reporte-rango?inicio=YYYY-MM-DD&fin=YYYY-MM-DD
     * 
     * @param {Object} req - Petición HTTP (query contiene inicio y fin)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async getReporteRango(req, res, next) {
        try {
            const { inicio, fin } = req.query;
            const reporte = await VentaService.obtenerReporteRango(inicio, fin);
            res.json(reporte);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Calcula totales aplicando descuentos o recargos globales
     * POST /api/calcular-totales
     * 
     * @param {Object} req - Petición HTTP (body contiene detalles, modoAjuste, etc.)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async calcularTotales(req, res, next) {
        try {
            const { detalles, modoAjuste, tipoDescuento, valorDescuento } = req.body;

            const resultado = await VentaService.calcularTotales(
                detalles,
                modoAjuste,
                tipoDescuento,
                valorDescuento
            );

            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todas las ventas del sistema (sin filtros)
     * GET /api/ventas/todas
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async obtenerTodasLasVentas(req, res, next) {
        try {
            const ventas = await VentaService.obtenerTodasLasVentas();
            res.json(ventas);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Desactiva un producto (cambia su estado a inactivo)
     * DELETE /api/productos/:id_producto/desactivar
     * 
     * @param {Object} req - Petición HTTP (params contiene id_producto)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async desactivarProducto(req, res, next) {
        try {
            const id_producto = req.params.id_producto;
            const result = await VentaService.desactivarProducto(id_producto);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verifica si la caja está abierta para un usuario y local específicos
     * GET /api/caja/verificar?usuario=5&local=18
     * 
     * @param {Object} req - Petición HTTP (query contiene usuario y local)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async verificarCajaAbierta(req, res, next) {
        try {
            const { usuario, local } = req.query;
            const abierta = await VentaService.verificarCajaAbierta(usuario, local);
            res.json(abierta);
        } catch (error) {
            next(error);
        }
    }
}

// Exporta una única instancia del controlador (Patrón Singleton)
module.exports = new VentaController();