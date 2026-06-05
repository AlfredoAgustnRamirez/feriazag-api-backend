const DashboardService = require('../services/dashboard.service');
const { validationResult } = require('express-validator');

class DashboardController {

  async getStatus(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const data = await DashboardService.getStatus(idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getDistribucionPagos(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const data = await DashboardService.getDistribucionPagos(idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getStockCritico(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const data = await DashboardService.getStockCritico(idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getVentasRecientes(req, res, next) {
    try {
      const idLocal = req.query.idLocal || 1;
      const data = await DashboardService.getVentasRecientes(idLocal);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getVentasPorPeriodo(req, res, next) {
    try {
      const { periodo, idLocal } = req.query;
      const localId = idLocal || 1;
      const data = await DashboardService.getVentasPorPeriodo(periodo, localId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async getTopProductos(req, res, next) {
    try {
      const { idLocal, limit } = req.query;
      const localId = idLocal || 1;
      const data = await DashboardService.getTopProductos(localId, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();