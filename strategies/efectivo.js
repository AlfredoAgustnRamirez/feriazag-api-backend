const PagoStrategy = require('./pagoStrategy');

class EfectivoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        return {
            estado: 'APROBADO',
            metodo: 'EFECTIVO',
            total: monto,
            recargo: 0,
            mensaje: 'Pago en efectivo - Sin recargo'
        };
    }
}

module.exports = EfectivoStrategy;