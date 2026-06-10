// Importa la clase base PagoStrategy que define el contrato para todas las estrategias
// La clase base asegura que todas las estrategias tengan el método procesar()
const PagoStrategy = require('./pagoStrategy');

/**
 * MercadoPagoStrategy - Estrategia de pago para Mercado Pago
 * 
 * Esta clase implementa la lógica específica para procesar pagos
 * realizados a través de la pasarela de pagos Mercado Pago.
 * 
 * Características del medio de pago:
 * - Medio de pago: Mercado Pago
 * - ID asociado: 5
 * - Recargo aplicado: 5%
 * - Estado: PENDIENTE_QR (requiere escaneo de código QR)
 * 
 * A diferencia de otros medios como Efectivo o Transferencia,
 * Mercado Pago requiere un paso adicional: el escaneo de un código QR
 * por parte del cliente para completar el pago.
 * 
 * Patrones de diseño utilizados:
 * - Strategy: Implementa una estrategia concreta de pago
 * - Template Method: Hereda de PagoStrategy y completa la implementación
 * 
 * @class MercadoPagoStrategy
 * @extends {PagoStrategy}
 */
class MercadoPagoStrategy extends PagoStrategy {
    
    /**
     * Procesa un pago con Mercado Pago
     * 
     * Aplica un recargo del 5% sobre el monto original.
     * El estado retornado es 'PENDIENTE_QR' porque el pago requiere
     * que el cliente escanee un código QR para completar la transacción.
     * 
     * @param {number} monto - Monto original a procesar (sin recargo)
     * @param {Object} datosAdicionales - Datos adicionales para el procesamiento
     *                                    Puede incluir:
     *                                    - qrData: string - Datos para generar el QR
     *                                    - preferenciaId: string - ID de preferencia de MP
     *                                    - initPoint: string - URL de inicio de pago
     * @returns {Promise<Object>} Resultado del procesamiento del pago
     * 
     * El objeto resultado contiene:
     * - estado: string - Estado del pago ('PENDIENTE_QR')
     * - metodo: string - Nombre del método ('MERCADO_PAGO')
     * - montoOriginal: number - Monto original (sin recargo)
     * - recargo: number - Monto del recargo (5% del monto)
     * - recargoPorcentaje: number - Porcentaje del recargo (5)
     * - total: number - Monto total (original + recargo)
     * - mensaje: string - Mensaje descriptivo
     * 
     * @example
     * // Ejemplo de uso básico
     * const strategy = new MercadoPagoStrategy();
     * const resultado = await strategy.procesar(10000, {
     *     qrData: 'https://mpago.la/xxxxx'
     * });
     * // resultado = {
     * //   estado: 'PENDIENTE_QR',
     * //   metodo: 'MERCADO_PAGO',
     * //   montoOriginal: 10000,
     * //   recargo: 500,
     * //   recargoPorcentaje: 5,
     * //   total: 10500,
     * //   mensaje: 'Pago con Mercado Pago - Recargo del 5%'
     * // }
     * 
     * @example
     * // En el frontend, al recibir estado 'PENDIENTE_QR'
     * if (resultado.estado === 'PENDIENTE_QR') {
     *     // Mostrar QR al cliente
     *     this.mostrarQR(resultado.qrData);
     *     // Esperar confirmación del pago
     *     await this.verificarPago(resultado.id);
     * }
     */
    async procesar(monto, datosAdicionales = {}) {
        // ========== CÁLCULO DEL RECARGO ==========
        // Mercado Pago tiene un recargo fijo del 5%
        // Fórmula: recargo = monto × 0.05
        const recargo = monto * 0.05;
        
        // ========== RESULTADO ==========
        // Retorna el resultado del procesamiento
        // El estado 'PENDIENTE_QR' indica que se debe mostrar un QR al cliente
        return {
            estado: 'PENDIENTE_QR',           // Estado pendiente de pago (requiere acción del cliente)
            metodo: 'MERCADO_PAGO',           // Nombre del método de pago
            montoOriginal: monto,             // Monto original (para referencia)
            recargo: recargo,                 // Monto del recargo (5% del monto)
            recargoPorcentaje: 5,             // Porcentaje del recargo
            total: monto + recargo,           // Total = monto original + recargo
            mensaje: `Pago con Mercado Pago - Recargo del 5%`
        };
    }
}

// Exporta la clase para que pueda ser utilizada por PagoFactory
module.exports = MercadoPagoStrategy;