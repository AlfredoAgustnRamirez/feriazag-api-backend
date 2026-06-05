const { MockRequest, MockResponse, mockNext, createMockService } = require('../../helpers/mockFactory');
const ProductoController = require('../../../controllers/producto.controller');

// Configuración específica para este test
const mockServiceMethods = [
  'crearProducto',
  'actualizarProducto',
  'obtenerTodosLosProductos',
  'obtenerProductosConStock',
  'obtenerProductosPorLocal',
  'obtenerProductosActivos',
  'obtenerProductosVendidos',
  'obtenerProductosNoVendidos',
  'obtenerProductosBajoStock',
  'obtenerProductosNoAsignados',
  'activarProducto',
  'desactivarProducto',
  'obtenerStockPorSucursales',
  'obtenerStockTodasSucursales',
  'transferirStock',
  'asignarProductoALocal',
  'desactivarProductoEnLocal',
  'buscarProductos',
  'obtenerSucursalesUsuario'
];

describe('ProductoController - Unit Tests', () => {
  let mockProductoService;
  let controller;
  let req, res, next;

  beforeEach(() => {
    // Crear mock del servicio con todos los métodos necesarios
    mockProductoService = createMockService(mockServiceMethods);
    
    // Inyectar el mock en el controlador
    controller = new ProductoController();
    controller.ProductoService = mockProductoService;
    
    // Crear mocks de req, res, next
    req = MockRequest.create();
    res = MockResponse.create();
    next = mockNext;
  });

  test('obtenerTodosLosProductos - debe usar idLocal por defecto', async () => {
    req.query = {};
    mockProductoService.obtenerTodosLosProductos.mockResolvedValue([]);
    
    await controller.obtenerTodosLosProductos(req, res, next);
    
    expect(mockProductoService.obtenerTodosLosProductos).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalled();
  });

  // ... más tests usando los mismos helpers
});