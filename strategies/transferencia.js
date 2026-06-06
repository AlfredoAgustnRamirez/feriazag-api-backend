const PagoStrategy = require('./pagoStrategy');

class TransferenciaStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        return {
            estado: 'APROBADO',
            metodo: 'TRANSFERENCIA',
            total: monto,
            recargo: 0,
            mensaje: 'Pago por transferencia - Sin recargo'
        };
    }
}

module.exports = TransferenciaStrategy;