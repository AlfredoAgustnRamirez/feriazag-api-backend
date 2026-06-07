const PagoStrategy = require('./pagoStrategy');

class EfectivoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        return {
            estado: 'APROBADO',
            metodo: 'EFECTIVO',
            montoOriginal: monto,
            recargo: 0,
            recargoPorcentaje: 0,  
            total: monto,
            mensaje: 'Pago en efectivo - Sin recargo'
        };
    }
}

module.exports = EfectivoStrategy;