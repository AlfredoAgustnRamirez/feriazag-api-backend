const PagoStrategy = require('./pagoStrategy');

class DebitoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        return {
            estado: 'APROBADO',
            metodo: 'DEBITO',
            total: monto,
            recargo: 0,
            mensaje: 'Pago con débito - Sin recargo'
        };
    }
}

module.exports = DebitoStrategy;