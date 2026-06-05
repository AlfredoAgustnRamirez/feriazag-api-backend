const VentaService = require('../services/venta.service');

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
}

module.exports = new VentaController();