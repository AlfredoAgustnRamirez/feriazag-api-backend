// Importa la fábrica de estrategias de pago que contiene la lógica de selección
const PagoFactory = require('../strategies/pagoFactory');

/**
 * PaymentManager - Gestor de Pagos
 * 
 * Este es un Wrapper (envoltorio) alrededor de PagoFactory.
 * Su propósito es centralizar la gestión de pagos y servir como fachada
 * para el patrón Strategy de medios de pago.
 * 
 * Patrones de diseño utilizados:
 * - Facade: Proporciona una interfaz simplificada para el subsistema de pagos
 * - Singleton: Los métodos son estáticos, no requiere instanciación
 * - Wrapper: Envuelve a PagoFactory añadiendo una capa de abstracción
 */
class PaymentManager {
    
    /**
     * Obtiene la estrategia de pago correspondiente al medio de pago
     * 
     * Este método es un wrapper que delega en PagoFactory.
     * Sirve como punto de entrada único para obtener estrategias.
     * 
     * @param {number} medioPagoId - ID del medio de pago
     *                              1 = Efectivo
     *                              2 = Débito
     *                              3 = Crédito (+10% recargo)
     *                              4 = Transferencia
     *                              5 = Mercado Pago (+5% recargo)
     * @returns {PagoStrategy} Estrategia concreta que implementa el método procesar()
     * 
     * @example
     * const strategy = PaymentManager.getStrategy(3); // Devuelve CreditoStrategy
     */
    static getStrategy(medioPagoId) {
        // Delega en PagoFactory para obtener la estrategia correspondiente
        return PagoFactory.getStrategy(medioPagoId);
    }
    
    /**
     * Procesa un pago utilizando la estrategia correspondiente al medio de pago
     * 
     * Este método combina la obtención de la estrategia y su ejecución
     * en un solo paso, simplificando el uso del patrón Strategy.
     * 
     * @param {number} medioPagoId - ID del medio de pago
     * @param {number} monto - Monto original a procesar (sin recargo)
     * @param {Object} datosAdicionales - Datos adicionales específicos del medio de pago
     *                                    (ej: QR data para Mercado Pago, efectivo recibido, etc.)
     * @returns {Promise<Object>} Resultado del procesamiento del pago
     * 
     * El objeto resultado contiene:
     * - total: number - Monto final con recargo aplicado
     * - recargo: number - Monto del recargo (0 si no aplica)
     * - recargoPorcentaje: number - Porcentaje del recargo
     * - metodo: string - Nombre del método de pago (EFECTIVO, CREDITO, etc.)
     * - mensaje: string - Mensaje descriptivo
     * - qrData: string (opcional) - Datos QR para Mercado Pago
     * 
     * @example
     * // Procesar pago con tarjeta de crédito
     * const resultado = await PaymentManager.procesarPago(3, 10000, {});
     * // resultado.total = 11000 (10000 + 10% recargo)
     * 
     * @example
     * // Procesar pago en efectivo
     * const resultado = await PaymentManager.procesarPago(1, 10000, { efectivoRecibido: 10000 });
     * // resultado.total = 10000 (sin recargo)
     */
    static async procesarPago(medioPagoId, monto, datosAdicionales) {
        // Paso 1: Obtener la estrategia correspondiente al medio de pago
        const strategy = this.getStrategy(medioPagoId);
        
        // Paso 2: Ejecutar la estrategia para procesar el pago
        // Cada estrategia implementa su propia lógica de recargo
        return await strategy.procesar(monto, datosAdicionales);
    }
}

// Exporta la clase (los métodos son estáticos, no necesita instanciación)
module.exports = PaymentManager;