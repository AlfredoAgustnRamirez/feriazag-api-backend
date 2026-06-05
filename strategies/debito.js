const PagoStrategy = require('./pagoStrategy');

class DebitoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales) {
        const { numeroTarjeta, pin, idVenta, idUsuario } = datosAdicionales;
        
        // Validar datos de tarjeta
        if (!numeroTarjeta || numeroTarjeta.length < 15) {
            throw new Error('Número de tarjeta inválido');
        }
        
        // Aquí iría la integración con la red de débito (Banelco, Link, etc.)
        const resultado = await this.procesarConRedDebito(numeroTarjeta, pin, monto);
        
        return {
            estado: 'APROBADO',
            metodo: 'DEBITO',
            mensaje: 'Pago con débito procesado con éxito',
            ultimosDigitos: numeroTarjeta.slice(-4),
            montoPagado: monto
        };
    }
}

module.exports = DebitoStrategy;