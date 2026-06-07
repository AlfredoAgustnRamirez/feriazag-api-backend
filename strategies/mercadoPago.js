const PagoStrategy = require('./pagoStrategy');

class MercadoPagoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        const recargo = monto * 0.05;
        return {
            estado: 'PENDIENTE_QR',
            metodo: 'MERCADO_PAGO',
            montoOriginal: monto,
            recargo: recargo,
            recargoPorcentaje: 5, 
            total: monto + recargo,
            mensaje: `Pago con Mercado Pago - Recargo del 5%`
        };
    }
}

module.exports = MercadoPagoStrategy;