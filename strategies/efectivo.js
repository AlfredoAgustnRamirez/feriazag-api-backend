const PagoStrategy = require('./pagoStrategy');

class EfectivoStrategy extends PagoStrategy {
    async procesar(monto, datosAdicionales) {
        const { efectivoRecibido, idVenta, idUsuario } = datosAdicionales;
        
        // Validar que el efectivo recibido sea suficiente
        if (efectivoRecibido < monto) {
            throw new Error(`Efectivo insuficiente. Recibido: $${efectivoRecibido}, Total: $${monto}`);
        }
        
        // Calcular vuelto
        const vuelto = efectivoRecibido - monto;
        
        // Aquí puedes guardar el pago en efectivo en la base de datos si lo necesitas
         await this.registrarPagoEfectivo(idVenta, monto, efectivoRecibido, vuelto, idUsuario);
        
        return {
            estado: 'APROBADO',
            metodo: 'EFECTIVO',
            mensaje: `Pago en efectivo procesado con éxito. Vuelto: $${vuelto.toFixed(2)}`,
            vuelto: vuelto,
            efectivoRecibido: efectivoRecibido,
            montoPagado: monto
        };
    }
}

module.exports = EfectivoStrategy;