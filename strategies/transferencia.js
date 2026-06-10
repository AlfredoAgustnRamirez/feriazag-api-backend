// Importa la clase base PagoStrategy que define el contrato para todas las estrategias
// La clase base asegura que todas las estrategias tengan el método procesar()
const PagoStrategy = require('./pagoStrategy');

/**
 * TransferenciaStrategy - Estrategia de pago para Transferencia Bancaria
 * 
 * Esta clase implementa la lógica específica para procesar pagos
 * realizados mediante transferencia bancaria.
 * 
 * Características del medio de pago:
 * - Medio de pago: Transferencia bancaria
 * - ID asociado: 4
 * - Recargo aplicado: 0% (sin recargo)
 * - Estado: APROBADO (no requiere validación adicional)
 * 
 * Patrones de diseño utilizados:
 * - Strategy: Implementa una estrategia concreta de pago
 * - Template Method: Hereda de PagoStrategy y completa la implementación
 * 
 * @class TransferenciaStrategy
 * @extends {PagoStrategy}
 */
class TransferenciaStrategy extends PagoStrategy {
    
    /**
     * Procesa un pago por transferencia bancaria
     * 
     * A diferencia de otros medios como Crédito o Mercado Pago,
     * la transferencia bancaria NO aplica ningún recargo adicional.
     * El total a pagar es exactamente el monto original.
     * 
     * @param {number} monto - Monto original a procesar (sin recargo)
     * @param {Object} datosAdicionales - Datos adicionales (no utilizados en esta estrategia)
     *                                    Podría incluir datos como:
     *                                    - comprobante: string - Número de comprobante
     *                                    - banco: string - Banco origen
     *                                    - fecha: string - Fecha de la transferencia
     * @returns {Promise<Object>} Resultado del procesamiento del pago
     * 
     * El objeto resultado contiene:
     * - estado: string - Estado del pago ('APROBADO')
     * - metodo: string - Nombre del método ('TRANSFERENCIA')
     * - total: number - Monto total (sin cambios, sin recargo)
     * - recargo: number - Monto del recargo (0)
     * - mensaje: string - Mensaje descriptivo
     * 
     * @example
     * const strategy = new TransferenciaStrategy();
     * const resultado = await strategy.procesar(10000, {
     *     comprobante: 'TR-123456',
     *     banco: 'Banco Nación'
     * });
     * // resultado = {
     * //   estado: 'APROBADO',
     * //   metodo: 'TRANSFERENCIA',
     * //   total: 10000,
     * //   recargo: 0,
     * //   mensaje: 'Pago por transferencia - Sin recargo'
     * // }
     */
    async procesar(monto, datosAdicionales = {}) {
        // Retorna el resultado del procesamiento
        // No se aplica ningún recargo, el total es igual al monto original
        return {
            estado: 'APROBADO',           // Estado exitoso del pago
            metodo: 'TRANSFERENCIA',      // Nombre del método de pago
            total: monto,                 // Total = monto original (sin recargo)
            recargo: 0,                   // Sin recargo
            mensaje: 'Pago por transferencia - Sin recargo'
        };
    }
}

// Exporta la clase para que pueda ser utilizada por PagoFactory
module.exports = TransferenciaStrategy;