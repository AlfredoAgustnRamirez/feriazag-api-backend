const PagoFactory = require('../strategies/pagoFactory');

class PaymentManager {
    static getStrategy(medioPagoId) {
        return PagoFactory.getStrategy(medioPagoId);
    }
    
    static async procesarPago(medioPagoId, monto, datosAdicionales) {
        const strategy = this.getStrategy(medioPagoId);
        return await strategy.procesar(monto, datosAdicionales);
    }
}

module.exports = PaymentManager;