const ReporteService = require('../services/reporte.service');
const { validationResult } = require('express-validator');

class ReporteController {

  // ============ REPORTE DE VENTAS ============

  async getVentasPorRango(req, res, next) {
    try {
      const { inicio, fin, idLocal } = req.query;
      const data = await ReporteService.getVentasPorRango(inicio, fin, idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getResumenVentasPorDia(req, res, next) {
    try {
      const { inicio, fin, idLocal } = req.query;
      const data = await ReporteService.getResumenVentasPorDia(inicio, fin, idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getVentasPorMedioPago(req, res, next) {
    try {
      const { inicio, fin, idLocal } = req.query;
      const data = await ReporteService.getVentasPorMedioPago(inicio, fin, idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getTopProductosVendidos(req, res, next) {
    try {
      const { inicio, fin, idLocal, limit } = req.query;
      const data = await ReporteService.getTopProductosVendidos(inicio, fin, idLocal, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getVentasPorLocal(req, res, next) {
    try {
      const { inicio, fin } = req.query;
      const data = await ReporteService.getVentasPorLocal(inicio, fin);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // ============ REPORTE DE PRODUCTOS ============

  async getProductosPocoStock(req, res, next) {
    try {
      const { idLocal, limite } = req.query;
      const data = await ReporteService.getProductosPocoStock(idLocal, limite);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getProductosSinStock(req, res, next) {
    try {
      const { idLocal } = req.query;
      const data = await ReporteService.getProductosSinStock(idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getProductosMayorStock(req, res, next) {
    try {
      const { idLocal, limit } = req.query;
      const data = await ReporteService.getProductosMayorStock(idLocal, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // ============ REPORTE DE CLIENTES ============

  async getTopClientes(req, res, next) {
    try {
      const { inicio, fin, idLocal, limit } = req.query;
      const data = await ReporteService.getTopClientes(inicio, fin, idLocal, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  // ============ REPORTE DE CAJA ============

  async getResumenCaja(req, res, next) {
    try {
      const { inicio, fin, idLocal } = req.query;
      const data = await ReporteService.getResumenCaja(inicio, fin, idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReporteController();