const DashboardModel = require('../models/dashboard.model');

class DashboardService {

  async getStatus(idLocal) {
    return await DashboardModel.getStatus(idLocal);
  }

  async getDistribucionPagos(idLocal) {
    return await DashboardModel.getDistribucionPagos(idLocal);
  }

  async getStockCritico(idLocal) {
    return await DashboardModel.getStockCritico(idLocal);
  }

  async getVentasRecientes(idLocal) {
    return await DashboardModel.getVentasRecientes(idLocal);
  }

  async getVentasPorPeriodo(periodo, idLocal) {
    return await DashboardModel.getVentasPorPeriodo(periodo, idLocal);
  }

  async getTopProductos(idLocal, limit) {
    return await DashboardModel.getTopProductos(idLocal, limit || 5);
  }
}

module.exports = new DashboardService();