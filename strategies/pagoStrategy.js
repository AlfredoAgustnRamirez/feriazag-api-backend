/**
 * PagoStrategy - Clase base abstracta para estrategias de pago
 * 
 * Esta clase define el contrato (interfaz) que deben implementar
 * todas las estrategias concretas de pago.
 * 
 * Patrones de diseño utilizados:
 * - Strategy: Define la interfaz común para todas las estrategias
 * - Template Method: Establece el esqueleto del método procesar()
 * 
 * Principios SOLID aplicados:
 * - Liskov Substitution: Cualquier estrategia concreta puede reemplazar a esta clase
 * - Interface Segregation: Define solo el método necesario (procesar)
 * - Open/Closed: Abierto para extensión (nuevas estrategias), cerrado para modificación
 * 
 * @abstract
 * @class PagoStrategy
 */
class PagoStrategy {
    
    /**
     * Procesa un pago aplicando la lógica específica de cada estrategia
     * 
     * Este método debe ser implementado por todas las subclases concretas.
     * Si una subclase no lo implementa, se lanza este error por defecto.
     * 
     * @param {number} monto - Monto original a procesar (sin recargo)
     * @param {Object} datosAdicionales - Datos adicionales específicos de cada estrategia
     *                                    Ejemplos:
     *                                    - Efectivo: { efectivoRecibido: number }
     *                                    - Mercado Pago: { qrData: string }
     *                                    - Crédito: { cuotas: number }
     * @returns {Promise<Object>} Resultado del procesamiento del pago
     * 
     * @throws {Error} Siempre lanza error si no es implementado por la subclase
     * 
     * @example
     * // Implementación esperada en una subclase
     * class CreditoStrategy extends PagoStrategy {
     *     async procesar(monto, datosAdicionales) {
     *         const recargo = monto * 0.10;
     *         return {
     *             total: monto + recargo,
     *             recargo: recargo,
     *             recargoPorcentaje: 10,
     *             metodo: 'CREDITO'
     *         };
     *     }
     * }
     */
    async procesar(monto, datosAdicionales) {
        // Lanza un error indicando que el método debe ser implementado
        // Esto actúa como un método abstracto en lenguajes que soportan abstract
        throw new Error('Método procesar debe ser implementado por cada estrategia');
    }
}

// Exporta la clase base para que pueda ser extendida por las estrategias concretas
module.exports = PagoStrategy;