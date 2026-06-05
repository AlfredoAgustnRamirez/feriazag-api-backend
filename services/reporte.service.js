const ReporteModel = require('../models/reporte.model');

class ReporteService {
  async getVentasPorRango(inicio, fin, idLocal) {
    return await ReporteModel.getVentasPorRango(inicio, fin, idLocal);
  }

  async getResumenVentasPorDia(inicio, fin, idLocal) {
    return await ReporteModel.getResumenVentasPorDia(inicio, fin, idLocal);
  }

  async getVentasPorMedioPago(inicio, fin, idLocal) {
    return await ReporteModel.getVentasPorMedioPago(inicio, fin, idLocal);
  }

  async getTopProductosVendidos(inicio, fin, idLocal, limit) {
    return await ReporteModel.getTopProductosVendidos(inicio, fin, idLocal, limit);
  }

  async getVentasPorLocal(inicio, fin) {
    return await ReporteModel.getVentasPorLocal(inicio, fin);
  }

  async getProductosPocoStock(idLocal, limite) {
    return await ReporteModel.getProductosPocoStock(idLocal, limite);
  }

  async getProductosSinStock(idLocal) {
    return await ReporteModel.getProductosSinStock(idLocal);
  }

  async getProductosMayorStock(idLocal, limit) {
    return await ReporteModel.getProductosMayorStock(idLocal, limit);
  }

  async getTopClientes(inicio, fin, idLocal, limit) {
    return await ReporteModel.getTopClientes(inicio, fin, idLocal, limit);
  }

  async getResumenCaja(inicio, fin, idLocal) {
    return await ReporteModel.getResumenCaja(inicio, fin, idLocal);
  }
}

module.exports = new ReporteService();