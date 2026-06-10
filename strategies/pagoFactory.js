// ========== IMPORTACIÓN DE ESTRATEGIAS ==========
// Importa cada estrategia concreta de pago
// Cada estrategia implementa la interfaz PagoStrategy con su propio método procesar()

// Estrategia para pago en efectivo (sin recargo)
const EfectivoStrategy = require('./efectivo');

// Estrategia para pago con tarjeta de débito (sin recargo)
const DebitoStrategy = require('./debito');

// Estrategia para pago con tarjeta de crédito (con 10% de recargo)
const CreditoStrategy = require('./credito');

// Estrategia para pago por transferencia bancaria (sin recargo)
const TransferenciaStrategy = require('./transferencia');

// Estrategia para pago con Mercado Pago (con 5% de recargo)
const MercadoPagoStrategy = require('./mercadoPago');

/**
 * PagoFactory - Fábrica de estrategias de pago
 * 
 * Implementa el patrón de diseño Factory Method.
 * Su responsabilidad es crear y devolver la estrategia de pago
 * correcta según el ID del medio de pago.
 * 
 * Patrones de diseño utilizados:
 * - Factory Method: Crea objetos de estrategia según el parámetro recibido
 * - Strategy: Las clases creadas implementan diferentes algoritmos de recargo
 * 
 * Ventajas de usar Factory:
 * 1. Centraliza la creación de objetos
 * 2. Oculta la lógica de instanciación
 * 3. Facilita agregar nuevos medios de pago (solo agregar un case)
 * 4. Promueve el principio Open/Closed (abierto para extensión, cerrado para modificación)
 */
class PagoFactory {
    
    /**
     * Obtiene la estrategia de pago correspondiente al medio de pago
     * 
     * Este método es estático, por lo que no es necesario instanciar la clase.
     * Actúa como un punto único de creación de estrategias.
     * 
     * @param {number} medioPagoId - ID del medio de pago
     *                               1 = Efectivo
     *                               2 = Débito
     *                               3 = Crédito
     *                               4 = Transferencia
     *                               5 = Mercado Pago
     * @returns {PagoStrategy} Una instancia de la estrategia concreta
     * @throws {Error} Si el medio de pago no es soportado
     * 
     * @example
     * // Obtener estrategia para crédito
     * const strategy = PagoFactory.getStrategy(3);
     * const resultado = await strategy.procesar(10000, {});
     * // resultado.total = 11000 (con 10% de recargo)
     * 
     * @example
     * // Obtener estrategia para efectivo
     * const strategy = PagoFactory.getStrategy(1);
     * const resultado = await strategy.procesar(10000, {});
     * // resultado.total = 10000 (sin recargo)
     */
    static getStrategy(medioPagoId) {
        // Convierte el parámetro a número (por si viene como string desde la petición)
        // Ejemplo: "3" (string) → 3 (number)
        const id = parseInt(medioPagoId);
        
        // Switch para seleccionar la estrategia según el ID
        switch (id) {
            // ========== CASO 1: EFECTIVO ==========
            case 1: // Efectivo - Sin recargo
                return new EfectivoStrategy();
            
            // ========== CASO 2: DÉBITO ==========
            case 2: // Débito - Sin recargo
                return new DebitoStrategy();
            
            // ========== CASO 3: CRÉDITO ==========
            case 3: // Crédito - Con 10% de recargo
                return new CreditoStrategy();
            
            // ========== CASO 4: TRANSFERENCIA ==========
            case 4: // Transferencia - Sin recargo
                return new TransferenciaStrategy();
            
            // ========== CASO 5: MERCADO PAGO ==========
            case 5: // Mercado Pago - Con 5% de recargo
                return new MercadoPagoStrategy();
            
            // ========== CASO POR DEFECTO: ERROR ==========
            default:
                // Si el ID no coincide con ningún caso, lanza un error
                throw new Error(`Medio de pago ${medioPagoId} no soportado`);
        }
    }
}

// Exporta la clase (los métodos son estáticos, no necesita instanciación)
module.exports = PagoFactory;