const VentaService = require('../services/venta.service');
const PagoFactory = require('../strategies/pagoFactory');
const PaymentManager = require('../managers/paymentManager');

class VentaController {
    async listarProductos(req, res, next) {
        try {
            const productos = await VentaService.listarProductos();
            res.json(productos);
        } catch (error) {
            next(error);
        }
    }

    async registrarVenta(req, res, next) {
        try {
            const result = await VentaService.registrarVenta(req.body);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async calcularTotalConRecargo(req, res) {
        try {
            const { medios_pago } = req.body;

            if (!medios_pago || medios_pago.length === 0) {
                return res.status(400).json({ mensaje: 'Debe especificar al menos un medio de pago' });
            }

            let totalConRecargos = 0;
            const detallesRecargos = [];

            for (const medio of medios_pago) {
                const strategy = PaymentManager.getStrategy(medio.id_medio_pago);
                const resultado = await strategy.procesar(medio.monto || 0);

                totalConRecargos += resultado.total;
                detallesRecargos.push({
                    id_medio_pago: medio.id_medio_pago,
                    monto: medio.monto || 0,
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
            console.error('Error:', error);
            res.status(500).json({ mensaje: error.message });
        }
    }

    async obtenerVentasPorFecha(req, res, next) {
        try {
            const { fecha, idLocal } = req.query;
            if (!fecha || !idLocal) {
                return res.status(400).json({ error: 'Faltan parámetros: fecha y idLocal' });
            }
            const ventas = await VentaService.obtenerVentasPorFecha(fecha, idLocal);
            res.json(ventas);
        } catch (error) {
            next(error);
        }
    }

    async obtenerMediosPago(req, res, next) {
        try {
            const medios = await VentaService.obtenerMediosPago();
            res.json(medios);
        } catch (error) {
            next(error);
        }
    }

    async getDashboardStats(req, res, next) {
        try {
            const idLocal = req.query.idLocal || 1;
            const stats = await VentaService.obtenerDashboardStats(idLocal);
            res.json(stats);
        } catch (error) {
            next(error);
        }
    }

    async guardarCierre(req, res, next) {
        try {
            const id = await VentaService.guardarCierreCaja(req.body);
            res.json({ mensaje: "Cierre de caja guardado con éxito", id });
        } catch (error) {
            next(error);
        }
    }

    async getHistorialCaja(req, res, next) {
        try {
            const historial = await VentaService.obtenerHistorialCaja();
            res.json(historial);
        } catch (error) {
            next(error);
        }
    }

    async getReporteRango(req, res, next) {
        try {
            const { inicio, fin } = req.query;
            const reporte = await VentaService.obtenerReporteRango(inicio, fin);
            res.json(reporte);
        } catch (error) {
            next(error);
        }
    }

    async calcularTotales(req, res, next) {
        try {
            const { detalles, modoAjuste, tipoDescuento, valorDescuento } = req.body;
            const resultado = await VentaService.calcularTotales(detalles, modoAjuste, tipoDescuento, valorDescuento);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async obtenerTodasLasVentas(req, res, next) {
        try {
            const ventas = await VentaService.obtenerTodasLasVentas();
            res.json(ventas);
        } catch (error) {
            next(error);
        }
    }

    async desactivarProducto(req, res, next) {
        try {
            const result = await VentaService.desactivarProducto(req.params.id_producto);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

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

module.exports = new VentaController();