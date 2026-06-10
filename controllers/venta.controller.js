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
            // Llama al servicio para obtener la lista de productos
            const productos = await VentaService.listarProductos();
            
            // Responde con código 200 OK y el listado de productos en formato JSON
            res.json(productos);
        } catch (error) {
            // Si hay error, lo pasa al middleware de errores (express)
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
    async registrarVenta(req, res, next) {
        try {
            // Llama al servicio para registrar la venta con los datos del body
            // Los datos incluyen: subtotal, recargo_monto, recargo_porcentaje, total_venta, detalles, medios_pago, etc.
            const result = await VentaService.registrarVenta(req.body);
            
            // Responde con código 201 Created (recurso creado exitosamente)
            res.status(201).json(result);
        } catch (error) {
            // Si hay error, lo pasa al middleware de errores
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
            // Extrae el array de medios de pago del body de la petición
            const { medios_pago } = req.body;

            // Validación: debe haber al menos un medio de pago
            if (!medios_pago || medios_pago.length === 0) {
                return res.status(400).json({ 
                    mensaje: 'Debe especificar al menos un medio de pago' 
                });
            }

            // Inicializa el acumulador del total con recargos
            let totalConRecargos = 0;
            
            // Array para guardar el detalle de cada medio de pago (útil para debugging)
            const detallesRecargos = [];

            // Itera sobre cada medio de pago seleccionado
            for (const medio of medios_pago) {
                // Obtiene la estrategia correspondiente según el ID del medio de pago
                // Patrón Strategy: cada medio tiene su propia lógica de recargo
                const strategy = PaymentManager.getStrategy(medio.id_medio_pago);
                
                // Procesa el monto con la estrategia obtenida
                // Ejemplo: Crédito (+10%), Mercado Pago (+5%), otros (0%)
                const resultado = await strategy.procesar(medio.monto || 0);

                // Suma el total (con recargo) al acumulador general
                totalConRecargos += resultado.total;
                
                // Guarda el detalle del cálculo para la respuesta
                detallesRecargos.push({
                    id_medio_pago: medio.id_medio_pago,
                    montoOriginal: medio.monto || 0,
                    recargo: resultado.recargo || 0,
                    recargoPorcentaje: resultado.recargoPorcentaje || 
                        (medio.id_medio_pago === 3 ? 10 : medio.id_medio_pago === 5 ? 5 : 0),
                    total: resultado.total
                });
            }

            // Responde con el total calculado y los detalles
            res.json({
                success: true,
                total: totalConRecargos,
                detalles: detallesRecargos
            });
        } catch (error) {
            // Captura errores y responde con código 500
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
            // Extrae los parámetros de la query string
            const { fecha, idLocal } = req.query;
            
            // Validación: ambos parámetros son obligatorios
            if (!fecha || !idLocal) {
                return res.status(400).json({ 
                    error: 'Faltan parámetros: fecha y idLocal son requeridos' 
                });
            }
            
            // Llama al servicio para obtener las ventas filtradas
            const ventas = await VentaService.obtenerVentasPorFecha(fecha, idLocal);
            
            // Responde con el listado de ventas
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
            // Llama al servicio para obtener la lista de medios de pago
            const medios = await VentaService.obtenerMediosPago();
            
            // Responde con la lista de medios de pago
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
            // Obtiene el idLocal de la query, o usa 1 como valor por defecto
            const idLocal = req.query.idLocal || 1;
            
            // Llama al servicio para obtener las estadísticas del dashboard
            const stats = await VentaService.obtenerDashboardStats(idLocal);
            
            // Responde con las estadísticas
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
            // Llama al servicio para guardar el cierre de caja
            const id = await VentaService.guardarCierreCaja(req.body);
            
            // Responde con el ID del cierre registrado
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
            // Llama al servicio para obtener el historial de cierres
            const historial = await VentaService.obtenerHistorialCaja();
            
            // Responde con el historial
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
            // Extrae las fechas de la query string
            const { inicio, fin } = req.query;
            
            // Llama al servicio para obtener el reporte en el rango
            const reporte = await VentaService.obtenerReporteRango(inicio, fin);
            
            // Responde con el reporte
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
            // Extrae los datos del body
            const { detalles, modoAjuste, tipoDescuento, valorDescuento } = req.body;
            
            // Llama al servicio para calcular los totales con descuentos/recargos
            const resultado = await VentaService.calcularTotales(
                detalles, 
                modoAjuste, 
                tipoDescuento, 
                valorDescuento
            );
            
            // Responde con el resultado del cálculo
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
            // Llama al servicio para obtener todas las ventas
            const ventas = await VentaService.obtenerTodasLasVentas();
            
            // Responde con el listado completo
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
            // Obtiene el ID del producto desde los parámetros de la URL
            const id_producto = req.params.id_producto;
            
            // Llama al servicio para desactivar el producto
            const result = await VentaService.desactivarProducto(id_producto);
            
            // Responde con código 200 OK y el mensaje de resultado
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
            // Extrae los parámetros de la query string
            const { usuario, local } = req.query;
            
            // Llama al servicio para verificar si la caja está abierta
            const abierta = await VentaService.verificarCajaAbierta(usuario, local);
            
            // Responde con true o false
            res.json(abierta);
        } catch (error) {
            next(error);
        }
    }
}

// Exporta una única instancia del controlador (Patrón Singleton)
module.exports = new VentaController();