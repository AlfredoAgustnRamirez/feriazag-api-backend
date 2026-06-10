const VentaService = require('../../../services/venta.service');
const VentaModel = require('../../../models/venta.model');
const PagoFactory = require('../../../strategies/pagoFactory');

// Mockear todas las dependencias
jest.mock('../../../models/venta.model');
jest.mock('../../../strategies/pagoFactory');

describe('VentaService - Pruebas Unitarias', () => {
    let ventaService;

    beforeEach(() => {
        ventaService = VentaService;
        jest.clearAllMocks();
    });

    // ============================================
    // 1. PRUEBAS DE calcularTotalConRecargo
    // ============================================
    describe('calcularTotalConRecargo', () => {
        test('debería calcular recargo correctamente para crédito (10%)', async () => {
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 11000,
                    recargo: 1000,
                    recargoPorcentaje: 10,
                    metodo: 'CREDITO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            const resultado = await ventaService.calcularTotalConRecargo(10000, 3);

            expect(resultado.total).toBe(11000);
            expect(resultado.recargo).toBe(1000);
            expect(PagoFactory.getStrategy).toHaveBeenCalledWith(3);
        });

        test('debería calcular recargo correctamente para Mercado Pago (5%)', async () => {
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 10500,
                    recargo: 500,
                    recargoPorcentaje: 5,
                    metodo: 'MERCADO_PAGO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            const resultado = await ventaService.calcularTotalConRecargo(10000, 5);

            expect(resultado.total).toBe(10500);
            expect(resultado.recargo).toBe(500);
        });

        test('debería calcular sin recargo para efectivo', async () => {
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 10000,
                    recargo: 0,
                    recargoPorcentaje: 0,
                    metodo: 'EFECTIVO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            const resultado = await ventaService.calcularTotalConRecargo(10000, 1);

            expect(resultado.total).toBe(10000);
            expect(resultado.recargo).toBe(0);
        });
    });

    // ============================================
    // 2. PRUEBAS DE getMensajeRecargo
    // ============================================
    describe('getMensajeRecargo', () => {
        test('debería retornar "Recargo del 10%" para crédito', () => {
            const mensaje = ventaService.getMensajeRecargo(3);
            expect(mensaje).toBe('Recargo del 10%');
        });

        test('debería retornar "Recargo del 5%" para Mercado Pago', () => {
            const mensaje = ventaService.getMensajeRecargo(5);
            expect(mensaje).toBe('Recargo del 5%');
        });

        test('debería retornar "Sin recargo" para efectivo', () => {
            const mensaje = ventaService.getMensajeRecargo(1);
            expect(mensaje).toBe('Sin recargo');
        });

        test('debería retornar "Sin recargo" para medios desconocidos', () => {
            const mensaje = ventaService.getMensajeRecargo(99);
            expect(mensaje).toBe('Sin recargo');
        });
    });

    // ============================================
    // 3. PRUEBAS DE verificarCajaAbierta
    // ============================================
    describe('verificarCajaAbierta', () => {
        test('debería retornar true si la caja está abierta', async () => {
            VentaModel.verificarCajaAbierta.mockResolvedValue(true);

            const resultado = await ventaService.verificarCajaAbierta(1, 1);

            expect(resultado).toBe(true);
            expect(VentaModel.verificarCajaAbierta).toHaveBeenCalledWith(1, 1);
        });

        test('debería retornar false si la caja está cerrada', async () => {
            VentaModel.verificarCajaAbierta.mockResolvedValue(false);

            const resultado = await ventaService.verificarCajaAbierta(1, 1);

            expect(resultado).toBe(false);
        });
    });

    // ============================================
    // 4. PRUEBAS DE procesarPago
    // ============================================
    describe('procesarPago', () => {
        test('debería procesar pago correctamente', async () => {
            const mockStrategy = {
                procesar: jest.fn().mockResolvedValue({
                    total: 11000,
                    recargo: 1000,
                    metodo: 'CREDITO'
                })
            };
            PagoFactory.getStrategy.mockReturnValue(mockStrategy);

            const resultado = await ventaService.procesarPago(3, 10000, {});

            expect(resultado.total).toBe(11000);
            expect(PagoFactory.getStrategy).toHaveBeenCalledWith(3);
        });
    });

    // ============================================
    // 5. PRUEBAS DE calcularTotales
    // ============================================
    describe('calcularTotales', () => {
        const detalles = [
            { precio: 1000, cantidad: 2, descuento: 0 },
            { precio: 500, cantidad: 1, descuento: 0 }
        ];

        test('debería calcular subtotal correctamente sin descuentos', async () => {
            const resultado = await ventaService.calcularTotales(detalles, 'ninguno', 'porcentaje', 0);

            expect(resultado.subtotal).toBe(2500);
            expect(resultado.total).toBe(2500);
            expect(resultado.descuentoAplicado).toBe(0);
        });

        test('debería aplicar descuento porcentual global', async () => {
            const resultado = await ventaService.calcularTotales(detalles, 'descuento', 'porcentaje', 10);

            expect(resultado.subtotal).toBe(2500);
            expect(resultado.total).toBe(2250);
            expect(resultado.descuentoAplicado).toBe(250);
        });

        test('debería aplicar recargo porcentual global', async () => {
            const resultado = await ventaService.calcularTotales(detalles, 'recargo', 'porcentaje', 10);

            expect(resultado.subtotal).toBe(2500);
            expect(resultado.total).toBe(2750);
            expect(resultado.descuentoAplicado).toBe(250);
        });
    });
});