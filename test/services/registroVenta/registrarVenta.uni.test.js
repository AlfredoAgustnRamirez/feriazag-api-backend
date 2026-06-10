// Importa el servicio de ventas que se va a probar
const VentaService = require('../../../services/venta.service');

// Importa el modelo de ventas (será mockeado)
const VentaModel = require('../../../models/venta.model');

// Importa la fábrica de estrategias de pago (será mockeada)
const PagoFactory = require('../../../strategies/pagoFactory');

// ========== MOCKS DE DEPENDENCIAS ==========
// Mockea el modelo de ventas para evitar llamadas reales a la base de datos
jest.mock('../../../models/venta.model');

// Mockea la fábrica de estrategias para controlar qué estrategia devuelve
jest.mock('../../../strategies/pagoFactory');

/**
 * Suite de pruebas unitarias para VentaService
 * 
 * Se prueban los siguientes métodos:
 * 1. calcularTotalConRecargo - Cálculo de recargos según medio de pago (Patrón Strategy)
 * 2. getMensajeRecargo - Mensajes descriptivos de recargos
 * 3. verificarCajaAbierta - Verificación de estado de caja
 * 4. procesarPago - Procesamiento de pagos con Strategy
 * 5. calcularTotales - Cálculo de totales con descuentos/recargos globales
 */
describe('VentaService - Pruebas Unitarias', () => {
    // Variable que contendrá la instancia del servicio
    let ventaService;

    // ========== CONFIGURACIÓN INICIAL ==========
    // Se ejecuta antes de cada prueba para tener un estado limpio
    beforeEach(() => {
        // Asigna la instancia del servicio (es un Singleton)
        ventaService = VentaService;
        
        // Limpia todos los mocks para evitar interferencias entre pruebas
        jest.clearAllMocks();
    });

    // ==========================================
    // 1. PRUEBAS DE calcularTotalConRecargo
    // ==========================================
    /**
     * Prueba el cálculo del total con recargo usando el patrón Strategy
     * 
     * Este método utiliza PagoFactory.getStrategy() para obtener la estrategia
     * correspondiente al medio de pago, y luego llama a su método procesar()
     */
    describe('calcularTotalConRecargo', () => {
        /**
         * CP: Crédito - debe aplicar 10% de recargo
         * 
         * Configuración:
         * - Mock de la estrategia de crédito que devuelve total=11000, recargo=1000
         * - Verifica que se llame a getStrategy con id=3 (crédito)
         * - Verifica que el total calculado sea 11000
         */
        test('debería calcular recargo correctamente para crédito (10%)', async () => {
            // ========== ARRANGE (Configuración) ==========
            // Crea un mock de la estrategia de crédito
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 11000,           // 10000 + 10% = 11000
                    recargo: 1000,          // 10% de 10000 = 1000
                    recargoPorcentaje: 10,
                    metodo: 'CREDITO'
                })
            };
            
            // Configura PagoFactory para que devuelva esta estrategia cuando se pida id=3
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            // ========== ACT (Ejecución) ==========
            // Ejecuta el método con subtotal=10000 y medioPagoId=3 (crédito)
            const resultado = await ventaService.calcularTotalConRecargo(10000, 3);

            // ========== ASSERT (Verificaciones) ==========
            // Verifica que el total sea 11000
            expect(resultado.total).toBe(11000);
            
            // Verifica que el recargo sea 1000
            expect(resultado.recargo).toBe(1000);
            
            // Verifica que se llamó a getStrategy con el id correcto (3 = crédito)
            expect(PagoFactory.getStrategy).toHaveBeenCalledWith(3);
        });

        /**
         * CP: Mercado Pago - debe aplicar 5% de recargo
         * 
         * Configuración:
         * - Mock de la estrategia de Mercado Pago que devuelve total=10500, recargo=500
         * - Verifica que se llame a getStrategy con id=5
         * - Verifica que el total calculado sea 10500
         */
        test('debería calcular recargo correctamente para Mercado Pago (5%)', async () => {
            // ========== ARRANGE ==========
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 10500,           // 10000 + 5% = 10500
                    recargo: 500,           // 5% de 10000 = 500
                    recargoPorcentaje: 5,
                    metodo: 'MERCADO_PAGO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            // ========== ACT ==========
            const resultado = await ventaService.calcularTotalConRecargo(10000, 5);

            // ========== ASSERT ==========
            expect(resultado.total).toBe(10500);
            expect(resultado.recargo).toBe(500);
        });

        /**
         * CP: Efectivo - sin recargo (0%)
         * 
         * Configuración:
         * - Mock de la estrategia de efectivo que devuelve total=10000, recargo=0
         * - Verifica que el total sea el mismo que el subtotal
         */
        test('debería calcular sin recargo para efectivo', async () => {
            // ========== ARRANGE ==========
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 10000,           // Sin recargo
                    recargo: 0,
                    recargoPorcentaje: 0,
                    metodo: 'EFECTIVO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            // ========== ACT ==========
            const resultado = await ventaService.calcularTotalConRecargo(10000, 1);

            // ========== ASSERT ==========
            expect(resultado.total).toBe(10000);
            expect(resultado.recargo).toBe(0);
        });
    });

    // ==========================================
    // 2. PRUEBAS DE getMensajeRecargo
    // ==========================================
    /**
     * Prueba los mensajes descriptivos de recargos según el medio de pago
     * Este método es puramente de lógica, no tiene dependencias externas
     */
    describe('getMensajeRecargo', () => {
        /**
         * Verifica que para crédito (id=3) devuelva "Recargo del 10%"
         */
        test('debería retornar "Recargo del 10%" para crédito', () => {
            const mensaje = ventaService.getMensajeRecargo(3);
            expect(mensaje).toBe('Recargo del 10%');
        });

        /**
         * Verifica que para Mercado Pago (id=5) devuelva "Recargo del 5%"
         */
        test('debería retornar "Recargo del 5%" para Mercado Pago', () => {
            const mensaje = ventaService.getMensajeRecargo(5);
            expect(mensaje).toBe('Recargo del 5%');
        });

        /**
         * Verifica que para efectivo (id=1) devuelva "Sin recargo"
         */
        test('debería retornar "Sin recargo" para efectivo', () => {
            const mensaje = ventaService.getMensajeRecargo(1);
            expect(mensaje).toBe('Sin recargo');
        });

        /**
         * Verifica que para IDs desconocidos devuelva "Sin recargo"
         * (comportamiento por defecto)
         */
        test('debería retornar "Sin recargo" para medios desconocidos', () => {
            const mensaje = ventaService.getMensajeRecargo(99);
            expect(mensaje).toBe('Sin recargo');
        });
    });

    // ==========================================
    // 3. PRUEBAS DE verificarCajaAbierta
    // ==========================================
    /**
     * Prueba la verificación del estado de la caja
     * Este método depende de VentaModel.verificarCajaAbierta()
     */
    describe('verificarCajaAbierta', () => {
        /**
         * Verifica que retorna true cuando el modelo indica que la caja está abierta
         */
        test('debería retornar true si la caja está abierta', async () => {
            // Mockea el modelo para que retorne true (caja abierta)
            VentaModel.verificarCajaAbierta.mockResolvedValue(true);

            const resultado = await ventaService.verificarCajaAbierta(1, 1);

            // Verifica el resultado
            expect(resultado).toBe(true);
            
            // Verifica que se llamó al modelo con los parámetros correctos
            expect(VentaModel.verificarCajaAbierta).toHaveBeenCalledWith(1, 1);
        });

        /**
         * Verifica que retorna false cuando el modelo indica que la caja está cerrada
         */
        test('debería retornar false si la caja está cerrada', async () => {
            // Mockea el modelo para que retorne false (caja cerrada)
            VentaModel.verificarCajaAbierta.mockResolvedValue(false);

            const resultado = await ventaService.verificarCajaAbierta(1, 1);

            expect(resultado).toBe(false);
        });
    });

    // ==========================================
    // 4. PRUEBAS DE procesarPago
    // ==========================================
    /**
     * Prueba el procesamiento de pagos que también usa el patrón Strategy
     * Es similar a calcularTotalConRecargo pero más genérico
     */
    describe('procesarPago', () => {
        /**
         * Verifica que procesarPago llama a la estrategia correcta y devuelve el resultado
         */
        test('debería procesar pago correctamente', async () => {
            // ========== ARRANGE ==========
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 11000,
                    recargo: 1000,
                    metodo: 'CREDITO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            // ========== ACT ==========
            const resultado = await ventaService.procesarPago(3, 10000, {});

            // ========== ASSERT ==========
            // Verifica que el total sea 11000
            expect(resultado.total).toBe(11000);
            
            // Verifica que se llamó a getStrategy con id=3
            expect(PagoFactory.getStrategy).toHaveBeenCalledWith(3);
        });
    });

    // ==========================================
    // 5. PRUEBAS DE calcularTotales
    // ==========================================
    /**
     * Prueba el cálculo de totales con descuentos/recargos globales
     * Este método no depende de la base de datos, es pura lógica matemática
     */
    describe('calcularTotales', () => {
        // Datos de prueba: 2 productos (2x1000 + 1x500 = 2500)
        const detalles = [
            { precio: 1000, cantidad: 2, descuento: 0 },
            { precio: 500, cantidad: 1, descuento: 0 }
        ];

        /**
         * Verifica el cálculo del subtotal sin descuentos ni recargos
         * Subtotal esperado: (1000×2) + (500×1) = 2000 + 500 = 2500
         */
        test('debería calcular subtotal correctamente sin descuentos', async () => {
            const resultado = await ventaService.calcularTotales(
                detalles, 
                'ninguno',    // Sin ajuste
                'porcentaje', // No aplica
                0             // Valor 0
            );

            expect(resultado.subtotal).toBe(2500);
            expect(resultado.total).toBe(2500);
            expect(resultado.descuentoAplicado).toBe(0);
        });

        /**
         * Verifica la aplicación de un descuento porcentual global (10%)
         * Total esperado: 2500 - 10% = 2500 - 250 = 2250
         */
        test('debería aplicar descuento porcentual global', async () => {
            const resultado = await ventaService.calcularTotales(
                detalles, 
                'descuento',   // Modo descuento
                'porcentaje',  // Tipo porcentaje
                10             // 10% de descuento
            );

            expect(resultado.subtotal).toBe(2500);      // Subtotal sin cambios
            expect(resultado.total).toBe(2250);         // 2500 - 10% = 2250
            expect(resultado.descuentoAplicado).toBe(250); // Monto del descuento
        });

        /**
         * Verifica la aplicación de un recargo porcentual global (10%)
         * Total esperado: 2500 + 10% = 2500 + 250 = 2750
         */
        test('debería aplicar recargo porcentual global', async () => {
            const resultado = await ventaService.calcularTotales(
                detalles, 
                'recargo',     // Modo recargo
                'porcentaje',  // Tipo porcentaje
                10             // 10% de recargo
            );

            expect(resultado.subtotal).toBe(2500);      // Subtotal sin cambios
            expect(resultado.total).toBe(2750);         // 2500 + 10% = 2750
            expect(resultado.descuentoAplicado).toBe(250); // Monto del recargo
        });
    });
});