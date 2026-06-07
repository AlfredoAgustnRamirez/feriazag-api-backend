const CreditoStrategy = require('../../services/strategies/CreditoStrategy');

describe('CreditoStrategy - Pruebas Unitarias', () => {
  let strategy;

  beforeEach(() => {
    strategy = new CreditoStrategy();
  });

  test('debería aplicar 10% de recargo correctamente', async () => {
    const resultado = await strategy.procesar(10000);
    
    expect(resultado.total).toBe(11000);
    expect(resultado.recargo).toBe(1000);
    expect(resultado.recargoPorcentaje).toBe(10);
    expect(resultado.metodo).toBe('CREDITO');
    expect(resultado.estado).toBe('APROBADO');
  });

  test('debería funcionar con monto 0', async () => {
    const resultado = await strategy.procesar(0);
    
    expect(resultado.total).toBe(0);
    expect(resultado.recargo).toBe(0);
  });

  test('debería funcionar con montos decimales', async () => {
    const resultado = await strategy.procesar(99.99);
    
    expect(resultado.total).toBe(109.989);
    expect(resultado.recargo).toBe(9.999);
  });
});