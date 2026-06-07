const PagoStrategy = require('./pagoStrategy');

class CreditoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        const recargo = monto * 0.10; 
        return {
            estado: 'APROBADO',
            metodo: 'CREDITO',
            montoOriginal: monto,
            total: monto + recargo,
            recargo: recargo,
            recargoPorcentaje: 10,
            mensaje: `Pago con crédito - Recargo del 10%: $${recargo.toFixed(2)}`
            
        };
    }
}

module.exports = CreditoStrategy;