const PagoFactory = require('../strategies/PagoFactory');

class PaymentManager {
    static async procesarPago(medioPagoId, monto, datosAdicionales) {
        const strategy = PagoFactory.getStrategy(medioPagoId);
        return await strategy.procesar(monto, datosAdicionales);
    }
}

module.exports = PaymentManager;