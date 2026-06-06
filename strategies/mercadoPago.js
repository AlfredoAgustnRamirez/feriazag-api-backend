const PagoStrategy = require('./pagoStrategy');

class MercadoPagoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales = {}) {
        const recargo = monto * 0.05;
        return {
            estado: 'PENDIENTE_QR',
            metodo: 'MERCADO_PAGO',
            total: monto + recargo,
            recargo: recargo,
            mensaje: `Mercado Pago - Recargo del 5%: $${recargo.toFixed(2)}`,
            qrData: datosAdicionales.qrData || null
        };
    }
}

module.exports = MercadoPagoStrategy;