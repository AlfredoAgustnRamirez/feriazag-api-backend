const PagoStrategy = require('./pagoStrategy');

class CreditoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        const recargo = monto * 0.10; // 10%
        return {
            estado: 'APROBADO',
            metodo: 'CREDITO',
            total: monto + recargo,
            recargo: recargo,
            mensaje: `Pago con crédito - Recargo del 10%: $${recargo.toFixed(2)}`
        };
    }
}

module.exports = CreditoStrategy;