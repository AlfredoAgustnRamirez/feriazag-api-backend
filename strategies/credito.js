// Importa la clase base PagoStrategy que define el contrato para todas las estrategias
// La clase base asegura que todas las estrategias tengan el método procesar()
const PagoStrategy = require('./pagoStrategy');

/**
 * CreditoStrategy - Estrategia de pago para Tarjeta de Crédito
 * 
 * Esta clase implementa la lógica específica para procesar pagos
 * realizados con tarjeta de crédito.
 * 
 * Características del medio de pago:
 * - Medio de pago: Tarjeta de Crédito
 * - ID asociado: 3
 * - Recargo aplicado: 10%
 * - Estado: APROBADO (aprobación inmediata)
 * 
 * La tarjeta de crédito tiene el recargo más alto del sistema (10%)
 * debido a las comisiones que cobran los bancos y procesadores de pago.
 * 
 * Patrones de diseño utilizados:
 * - Strategy: Implementa una estrategia concreta de pago
 * - Template Method: Hereda de PagoStrategy y completa la implementación
 * 
 * @class CreditoStrategy
 * @extends {PagoStrategy}
 */
class CreditoStrategy extends PagoStrategy {
    
    /**
     * Procesa un pago con tarjeta de crédito
     * 
     * Aplica un recargo del 10% sobre el monto original.
     * El estado retornado es 'APROBADO' porque la aprobación es inmediata
     * (en un sistema real, se comunicaría con el gateway de pagos).
     * 
     * @param {number} monto - Monto original a procesar (sin recargo)
     * @param {Object} datosAdicionales - Datos adicionales para el procesamiento
     *                                    Puede incluir:
     *                                    - cuotas: number - Cantidad de cuotas
     *                                    - tarjeta: string - Últimos 4 dígitos
     *                                    - token: string - Token de la transacción
     * @returns {Promise<Object>} Resultado del procesamiento del pago
     * 
     * El objeto resultado contiene:
     * - estado: string - Estado del pago ('APROBADO')
     * - metodo: string - Nombre del método ('CREDITO')
     * - montoOriginal: number - Monto original (sin recargo)
     * - total: number - Monto total (original + recargo)
     * - recargo: number - Monto del recargo (10% del monto)
     * - recargoPorcentaje: number - Porcentaje del recargo (10)
     * - mensaje: string - Mensaje descriptivo con el monto del recargo
     * 
     * @example
     * // Ejemplo de uso básico
     * const strategy = new CreditoStrategy();
     * const resultado = await strategy.procesar(10000, {
     *     cuotas: 3,
     *     tarjeta: '1234'
     * });
     * // resultado = {
     * //   estado: 'APROBADO',
     * //   metodo: 'CREDITO',
     * //   montoOriginal: 10000,
     * //   total: 11000,
     * //   recargo: 1000,
     * //   recargoPorcentaje: 10,
     * //   mensaje: 'Pago con crédito - Recargo del 10%: $1000.00'
     * // }
     * 
     * @example
     * // Cálculo del recargo
     * // monto = 10000
     * // recargo = 10000 × 0.10 = 1000
     * // total = 10000 + 1000 = 11000
     */
    async procesar(monto, datosAdicionales = {}) {
        // ========== CÁLCULO DEL RECARGO ==========
        // Tarjeta de crédito tiene un recargo fijo del 10%
        // Fórmula: recargo = monto × 0.10
        const recargo = monto * 0.10;
        
        // ========== RESULTADO ==========
        // Retorna el resultado del procesamiento
        // El estado 'APROBADO' indica que el pago fue aprobado
        return {
            estado: 'APROBADO',               // Estado exitoso del pago
            metodo: 'CREDITO',               // Nombre del método de pago
            montoOriginal: monto,            // Monto original (para referencia)
            total: monto + recargo,          // Total = monto original + recargo
            recargo: recargo,                // Monto del recargo (10% del monto)
            recargoPorcentaje: 10,           // Porcentaje del recargo
            mensaje: `Pago con crédito - Recargo del 10%: $${recargo.toFixed(2)}`
        };
    }
}

// Exporta la clase para que pueda ser utilizada por PagoFactory
module.exports = CreditoStrategy;