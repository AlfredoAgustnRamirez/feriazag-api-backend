const EfectivoStrategy = require('./Efectivo');
const DebitoStrategy = require('./Debito');
const CreditoStrategy = require('./Credito');
const TransferenciaStrategy = require('./Transferencia');
const MercadoPagoStrategy = require('./MercadoPago');

class PagoFactory {
    static getStrategy(medioPagoId) {
        switch (parseInt(medioPagoId)) {
            case 1: // Efectivo
                return new EfectivoStrategy();
            case 2: // Débito
                return new DebitoStrategy();
            case 3: // Crédito
                return new CreditoStrategy();
            case 4: // Transferencia
                return new TransferenciaStrategy();
            case 5: // Mercado Pago
                return new MercadoPagoStrategy();
            default:
                throw new Error(`Medio de pago ${medioPagoId} no soportado`);
        }
    }
}

module.exports = PagoFactory;