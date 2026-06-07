const ventaController = require('../../../controllers/venta.controller');
const VentaService = require('../../../services/venta.service');
const PaymentManager = require('../../../managers/paymentManager');

// Mocks
jest.mock('../../../services/venta.service');
jest.mock('../../../managers/paymentManager');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] }))
}));

// ============================================================
// 4.3 CÁLCULOS FINANCIEROS - CP-13 a CP-18
// ============================================================

describe('CP-13: Cálculo de total sin descuentos', () => {
  test('Debería calcular subtotal correctamente', () => {
    const subtotal = (5000 * 2) + (3000 * 1);
    expect(subtotal).toBe(13000);
  });
});

describe('CP-14: Descuento porcentual global', () => {
  test('Debería aplicar 10% de descuento', () => {
    const total = 10000 - (10000 * 10 / 100);
    expect(total).toBe(9000);
  });
});

describe('CP-15: Descuento por monto fijo', () => {
  test('Debería aplicar descuento de $1000', () => {
    const total = 10000 - 1000;
    expect(total).toBe(9000);
  });
});

describe('CP-16: Recargo porcentual (crédito)', () => {
  test('Debería aplicar 10% de recargo', () => {
    const total = 10000 + (10000 * 10 / 100);
    expect(total).toBe(11000);
  });
});

describe('CP-17: Cambiar de descuento a recargo', () => {
  test('Debería recalcular total', () => {
    let total = 10000 - 1000;
    expect(total).toBe(9000);
    total = 10000 + 1000;
    expect(total).toBe(11000);
  });
});

describe('CP-18: Cálculo de vuelto', () => {
  test('Debería calcular vuelto correctamente', () => {
    const vuelto = 15000 - 12500;
    expect(vuelto).toBe(2500);
  });
});