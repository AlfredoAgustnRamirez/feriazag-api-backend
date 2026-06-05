const VentaDetalleModel = require('../models/ventaDetalle.model');

class VentaDetalleService {

  async listarVentas() {
    const ventas = await VentaDetalleModel.listarVentas();
    
    return ventas.map(venta => ({
      id_cabecera: venta.id_cabecera,
      fecha: venta.fecha,
      total_venta: Number(venta.total_venta),
      cliente: venta.cliente,
      medios_pago: venta.medios_pago || 'Efectivo'
    }));
  }

  async obtenerVentaDetalle(idCabecera) {
    const venta = await VentaDetalleModel.obtenerVentaPorId(idCabecera);
    
    if (!venta) {
      throw new Error('Venta no encontrada');
    }
    
    const productos = await VentaDetalleModel.obtenerProductosPorVenta(idCabecera);
    const mediosPago = await VentaDetalleModel.obtenerMediosPagoPorVenta(idCabecera);
    
    return {
      id_cabecera: venta.id_cabecera,
      fecha: venta.fecha,
      total_venta: Number(venta.total_venta),
      cliente: venta.cliente,
      vendedor: venta.vendedor,
      medios_pago: venta.medios_pago || 'Efectivo',
      productos: productos.map(p => ({
        cod_producto: p.cod_producto,
        descripcion: p.descripcion,
        cantidad: p.cantidad,
        precio: Number(p.precio),
        subtotal: Number(p.subtotal)
      })),
      medios_pago_detalle: mediosPago.map(mp => ({
        descripcion: mp.descripcion,
        monto: Number(mp.monto)
      }))
    };
  }

  async obtenerMediosPagoPorVenta(idCabecera) {
    const medios = await VentaDetalleModel.obtenerMediosPagoPorVenta(idCabecera);
    return medios.map(mp => ({
      descripcion: mp.descripcion,
      monto: Number(mp.monto)
    }));
  }

  async reportePorRango(inicio, fin) {
    if (!inicio || !fin) {
      throw new Error('Fechas de inicio y fin son requeridas');
    }
    
    const reporte = await VentaDetalleModel.reportePorRango(inicio, fin);
    
    return reporte.map(r => ({
      ...r,
      total_venta: Number(r.total_venta),
      medios_pago: r.medios_pago || 'Efectivo'
    }));
  }

  async reporteCompleto(inicio = null, fin = null) {
    const reporte = await VentaDetalleModel.reporteCompleto(inicio, fin);
    
    return reporte.map(r => ({
      ...r,
      total_venta: Number(r.total_venta),
      medios_pago: r.medios_pago || 'Efectivo'
    }));
  }

  // ============ NUEVOS MÉTODOS PARA DÍA/SEMANA/MES ============

  async getVentaDetalleDia() {
    const hoy = new Date();
    const inicio = hoy.toISOString().split('T')[0];
    const fin = inicio;
    
    return await this.reportePorRango(inicio, fin);
  }

  async getVentaDetalleSemana() {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const finSemana = new Date(hoy);
    finSemana.setDate(hoy.getDate() + (6 - hoy.getDay()));
    
    const inicio = inicioSemana.toISOString().split('T')[0];
    const fin = finSemana.toISOString().split('T')[0];
    
    return await this.reportePorRango(inicio, fin);
  }

  async getVentaDetalleMes() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    const inicio = inicioMes.toISOString().split('T')[0];
    const fin = finMes.toISOString().split('T')[0];
    
    return await this.reportePorRango(inicio, fin);
  }
}

module.exports = new VentaDetalleService();