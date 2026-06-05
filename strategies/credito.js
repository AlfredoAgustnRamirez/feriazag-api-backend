const PagoStrategy = require('./pagoStrategy');

class CreditoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales) {
        const { numeroTarjeta, fechaVencimiento, codigoSeguridad, cuotas, idVenta, idUsuario } = datosAdicionales;
        
        // Validar datos de tarjeta
        if (!numeroTarjeta || numeroTarjeta.length < 15) {
            throw new Error('Número de tarjeta inválido');
        }
        
        if (!cuotas || cuotas < 1 || cuotas > 12) {
            throw new Error('Cantidad de cuotas inválida (1-12)');
        }
        
        // Calcular interés según cantidad de cuotas
        const interes = this.calcularInteres(cuotas);
        const valorCuota = (monto * (1 + interes)) / cuotas;
        
        // Aquí iría la integración con la red de crédito (Visa, Mastercard, etc.)
        
        return {
            estado: 'APROBADO',
            metodo: 'CREDITO',
            mensaje: `Pago con crédito aprobado en ${cuotas} cuotas de $${valorCuota.toFixed(2)}`,
            cuotas: cuotas,
            valorCuota: valorCuota,
            montoPagado: monto,
            interesAplicado: interes * 100
        };
    }
    
    calcularInteres(cuotas) {
        // Ejemplo de interés por cuotas
        const intereses = {
            1: 0,
            2: 0.03,
            3: 0.05,
            6: 0.10,
            12: 0.18
        };
        return intereses[cuotas] || 0.05;
    }
}

module.exports = CreditoStrategy;