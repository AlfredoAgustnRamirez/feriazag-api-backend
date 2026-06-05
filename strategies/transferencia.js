const PagoStrategy = require('./pagoStrategy');

class TransferenciaStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales) {
        const { cbu, alias, email, idVenta, idUsuario } = datosAdicionales;
        
        // Validar datos de transferencia
        if (!cbu && !alias) {
            throw new Error('Debe proporcionar CBU o alias para la transferencia');
        }
        
        // Aquí iría la integración con MercadoPago, Transferencias 3.0, etc.
         const resultado = await this.generarLinkPago(monto, email);
        
        return {
            estado: 'PENDIENTE',
            metodo: 'TRANSFERENCIA',
            mensaje: 'Solicitud de transferencia generada. Debes transferir el monto indicado.',
            datosTransferencia: {
                cbu: '1234567890123456789012',
                alias: 'feriazag.pagos',
                titular: 'FeriaZAG SRL',
                monto: monto
            },
            montoPagado: monto
        };
    }
}

module.exports = TransferenciaStrategy;