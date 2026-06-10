const EfectivoStrategy = require('../../../strategies/Efectivo');

describe('EfectivoStrategy - Pruebas Unitarias', () => {
  let strategy;

  beforeEach(() => {
    strategy = new EfectivoStrategy();
  });

  test('no debería aplicar recargo', async () => {
    const resultado = await strategy.procesar(10000);
    
    expect(resultado.total).toBe(10000);
    expect(resultado.recargo).toBe(0);
    expect(resultado.recargoPorcentaje).toBe(0);
    expect(resultado.metodo).toBe('EFECTIVO');
  });
});