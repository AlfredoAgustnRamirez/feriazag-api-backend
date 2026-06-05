const PagoStrategy = require('./pagoStrategy');

class MercadoPagoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales) {
        const { idVenta, idUsuario } = datosAdicionales;
        
        // Aquí iría la integración con la API de Mercado Pago
         const preference = await this.crearPreferencia(monto, idVenta);
        
        return {
            estado: 'PENDIENTE_QR',
            metodo: 'MERCADO_PAGO',
            mensaje: 'Escanea el código QR para completar el pago',
            qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent('preference_id')}`,
            preferenceId: 'preference_id_generado',
            montoPagado: monto
        };
    }
}

module.exports = MercadoPagoStrategy;