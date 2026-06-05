const VentaDetalleService = require('../services/ventaDetalle.service');
const { validationResult } = require('express-validator');

class VentaDetalleController {

  async listarVentas(req, res, next) {
    try {
      const ventas = await VentaDetalleService.listarVentas();
      res.json(ventas);
    } catch (error) {
      next(error);
    }
  }

  async obtenerVentaDetalle(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { idCabecera } = req.params;
      const venta = await VentaDetalleService.obtenerVentaDetalle(idCabecera);
      res.json(venta);
    } catch (error) {
      next(error);
    }
  }

  async obtenerMediosPagoPorVenta(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { idCabecera } = req.params;
      const medios = await VentaDetalleService.obtenerMediosPagoPorVenta(idCabecera);
      res.json(medios);
    } catch (error) {
      next(error);
    }
  }

  async reportePorRango(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
      }
      
      const { inicio, fin } = req.query;
      const reporte = await VentaDetalleService.reportePorRango(inicio, fin);
      res.json(reporte);
    } catch (error) {
      next(error);
    }
  }

  async reporteCompleto(req, res, next) {
    try {
      const { inicio, fin } = req.query;
      const reporte = await VentaDetalleService.reporteCompleto(inicio, fin);
      res.json(reporte);
    } catch (error) {
      next(error);
    }
  }

  // ============ NUEVOS MÉTODOS PARA DÍA/SEMANA/MES ============

  async getVentaDetalleDia(req, res, next) {
    try {
      const reporte = await VentaDetalleService.getVentaDetalleDia();
      res.json(reporte);
    } catch (error) {
      next(error);
    }
  }

  async getVentaDetalleSemana(req, res, next) {
    try {
      const reporte = await VentaDetalleService.getVentaDetalleSemana();
      res.json(reporte);
    } catch (error) {
      next(error);
    }
  }

  async getVentaDetalleMes(req, res, next) {
    try {
      const reporte = await VentaDetalleService.getVentaDetalleMes();
      res.json(reporte);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VentaDetalleController();