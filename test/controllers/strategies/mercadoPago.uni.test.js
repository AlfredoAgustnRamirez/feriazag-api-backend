const MercadoPagoStrategy = require('../../../strategies/MercadoPago');

describe('MercadoPagoStrategy - Pruebas Unitarias', () => {
  let strategy;

  beforeEach(() => {
    strategy = new MercadoPagoStrategy();
  });

  test('debería aplicar 5% de recargo correctamente', async () => {
    const resultado = await strategy.procesar(10000);
    
    expect(resultado.total).toBe(10500);
    expect(resultado.recargo).toBe(500);
    expect(resultado.recargoPorcentaje).toBe(5);
    expect(resultado.metodo).toBe('MERCADO_PAGO');
  });
});