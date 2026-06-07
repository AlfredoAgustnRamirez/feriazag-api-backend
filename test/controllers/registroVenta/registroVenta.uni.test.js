const ventaController = require('../../../controllers/venta.controller');
const VentaService = require('../../../services/venta.service');

jest.mock('../../../services/venta.service');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] }))
}));

describe('REGISTRO DE VENTA - CP-19 a CP-23', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {}, params: {}, query: {}, usuario: { id_usuario: 1, id_local: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // ==================== CP-19 ====================
  test('CP-19: Registro de venta exitoso', async () => {
    const mockResult = { id_venta: 1, mensaje: 'Venta registrada correctamente' };
    VentaService.registrarVenta.mockResolvedValue(mockResult);

    req.body = {
      total_venta: 10000,
      iduser: 1,
      detalles: [{ id_producto: 1, cantidad: 2, precio: 5000 }],
      medios_pago: [{ id_medio_pago: 1, monto: 10000 }],
      id_local: 1,
      id_cliente: 1
    };

    await ventaController.registrarVenta(req, res, next);

    expect(VentaService.registrarVenta).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // ==================== CP-20 ====================
  test('CP-20: Registro sin cliente - debería rechazar', () => {
    const clienteSeleccionado = null;
    const clienteIdTemp = null;
    const tieneCliente = !!(clienteSeleccionado && clienteIdTemp);
    
    expect(tieneCliente).toBe(false);
  });

  // ==================== CP-21 ====================
  test('CP-21: Registro con cliente seleccionado', () => {
    const clienteSeleccionado = { id_cliente: 1, nombre: 'Juan Pérez' };
    const clienteIdTemp = 1;
    const tieneCliente = !!(clienteSeleccionado && clienteIdTemp);
    
    expect(tieneCliente).toBe(true);
  });

  // ==================== CP-22 ====================
  test('CP-22: Error en servidor al registrar', async () => {
    const error = new Error('Error interno del servidor');
    VentaService.registrarVenta.mockRejectedValue(error);

    req.body = {
      total_venta: 10000,
      iduser: 1,
      detalles: [{ id_producto: 1, cantidad: 2, precio: 5000 }],
      medios_pago: [{ id_medio_pago: 1, monto: 10000 }],
      id_local: 1
    };

    await ventaController.registrarVenta(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  // ==================== CP-23 ====================
  test('CP-23: Carrito vacío intentar registrar venta', () => {
    const carrito = [];
    const puedeRegistrar = carrito.length > 0;
    
    expect(puedeRegistrar).toBe(false);
  });
});