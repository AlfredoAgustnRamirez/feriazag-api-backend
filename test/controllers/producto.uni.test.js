// test/controllers/producto.uni.test.js
const productoController = require('../../controllers/producto.controller');
const ProductoService = require('../../services/producto.service');

// Mockear express-validator para que siempre pase validación a menos que se especifique lo contrario
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

describe('ProductoController - Pruebas Unitarias', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Resetear todos los mocks
    jest.clearAllMocks();
    
    // Asignar mocks a TODOS los métodos del servicio
    ProductoService.crearProducto = jest.fn().mockResolvedValue({ id: 1, mensaje: 'Creado' });
    ProductoService.actualizarProducto = jest.fn().mockResolvedValue({ id: 1, mensaje: 'Actualizado' });
    ProductoService.obtenerTodosLosProductos = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosConStock = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosPorLocal = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosActivos = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosVendidos = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosNoVendidos = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosBajoStock = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerProductosNoAsignados = jest.fn().mockResolvedValue([]);
    ProductoService.activarProducto = jest.fn().mockResolvedValue({ mensaje: 'Activado' });
    ProductoService.desactivarProducto = jest.fn().mockResolvedValue({ mensaje: 'Desactivado' });
    ProductoService.obtenerStockPorSucursales = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerStockTodasSucursales = jest.fn().mockResolvedValue([]);
    ProductoService.transferirStock = jest.fn().mockResolvedValue({ mensaje: 'Transferido' });
    ProductoService.asignarProductoALocal = jest.fn().mockResolvedValue({ mensaje: 'Asignado' });
    ProductoService.desactivarProductoEnLocal = jest.fn().mockResolvedValue({ mensaje: 'Desactivado' });
    ProductoService.buscarProductos = jest.fn().mockResolvedValue([]);
    ProductoService.obtenerSucursalesUsuario = jest.fn().mockResolvedValue([]);

    // Mock de request
    req = {
      params: {},
      body: {},
      query: {},
      file: null,
      usuario: { id_usuario: 1 }
    };

    // Mock de response
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock de next
    next = jest.fn();
  });

  // ========== PRUEBAS DE PARÁMETROS POR DEFECTO ==========
  describe('Manejo de parámetros por defecto', () => {
    test('obtenerTodosLosProductos - debería usar idLocal=1 cuando no se proporciona', async () => {
      req.query = {};
      await productoController.obtenerTodosLosProductos(req, res, next);
      expect(ProductoService.obtenerTodosLosProductos).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalled();
    });

    test('obtenerTodosLosProductos - debería usar idLocal del query cuando existe', async () => {
      req.query = { idLocal: '5' };
      await productoController.obtenerTodosLosProductos(req, res, next);
      expect(ProductoService.obtenerTodosLosProductos).toHaveBeenCalledWith('5');
    });

    test('obtenerProductosConStock - debería usar idLocal=1 por defecto', async () => {
      req.query = {};
      await productoController.obtenerProductosConStock(req, res, next);
      expect(ProductoService.obtenerProductosConStock).toHaveBeenCalledWith(1);
    });

    test('obtenerProductosConStock - debería usar idLocal proporcionado', async () => {
      req.query = { idLocal: '3' };
      await productoController.obtenerProductosConStock(req, res, next);
      expect(ProductoService.obtenerProductosConStock).toHaveBeenCalledWith('3');
    });

    test('obtenerProductosVendidos - debería usar idLocal=1 por defecto', async () => {
      req.query = {};
      await productoController.obtenerProductosVendidos(req, res, next);
      expect(ProductoService.obtenerProductosVendidos).toHaveBeenCalledWith(1);
    });

    test('obtenerProductosNoVendidos - debería usar idLocal=1 por defecto', async () => {
      req.query = {};
      await productoController.obtenerProductosNoVendidos(req, res, next);
      expect(ProductoService.obtenerProductosNoVendidos).toHaveBeenCalledWith(1);
    });

    test('obtenerProductosBajoStock - debería usar idLocal=1 por defecto', async () => {
      req.query = {};
      await productoController.obtenerProductosBajoStock(req, res, next);
      expect(ProductoService.obtenerProductosBajoStock).toHaveBeenCalledWith(1);
    });
  });

  // ========== PRUEBAS DE PARÁMETROS DE RUTA ==========
  describe('Manejo de parámetros de ruta', () => {
    test('obtenerProductosPorLocal - debería usar idLocal de params', async () => {
      req.params = { idLocal: '2' };
      await productoController.obtenerProductosPorLocal(req, res, next);
      expect(ProductoService.obtenerProductosPorLocal).toHaveBeenCalledWith('2');
    });

    test('obtenerProductosNoAsignados - debería usar idLocal de params', async () => {
      req.params = { idLocal: '4' };
      await productoController.obtenerProductosNoAsignados(req, res, next);
      expect(ProductoService.obtenerProductosNoAsignados).toHaveBeenCalledWith('4');
    });
  });

  // ========== PRUEBAS DE MANEJO DE ARCHIVOS ==========
  describe('Manejo de archivos en actualizaciones', () => {
    test('actualizarProducto - debería pasar hasFile=false cuando no hay archivo', async () => {
      req.params = { id_producto: '1' };
      req.body = { nombre: 'Actualizado' };
      req.file = null;
      await productoController.actualizarProducto(req, res, next);
      expect(ProductoService.actualizarProducto).toHaveBeenCalledWith('1', req.body, false);
    });

    test('actualizarProducto - debería pasar hasFile=true cuando hay archivo', async () => {
      req.params = { id_producto: '1' };
      req.body = { nombre: 'Actualizado' };
      req.file = { filename: 'imagen.jpg' };
      await productoController.actualizarProducto(req, res, next);
      expect(ProductoService.actualizarProducto).toHaveBeenCalledWith('1', req.body, true);
    });
  });

  // ========== PRUEBAS DE USUARIO AUTENTICADO ==========
  describe('Manejo de usuario autenticado', () => {
    test('obtenerStockPorSucursales - debería pasar userId cuando existe usuario', async () => {
      req.params = { id_producto: '1' };
      req.usuario = { id_usuario: 10 };
      await productoController.obtenerStockPorSucursales(req, res, next);
      expect(ProductoService.obtenerStockPorSucursales).toHaveBeenCalledWith('1', 10);
    });

    test('obtenerStockPorSucursales - debería pasar undefined cuando no hay usuario', async () => {
      req.params = { id_producto: '1' };
      req.usuario = null;
      await productoController.obtenerStockPorSucursales(req, res, next);
      expect(ProductoService.obtenerStockPorSucursales).toHaveBeenCalledWith('1', undefined);
    });

    test('obtenerSucursalesUsuario - debería pasar userId cuando existe usuario', async () => {
      req.usuario = { id_usuario: 20 };
      await productoController.obtenerSucursalesUsuario(req, res, next);
      expect(ProductoService.obtenerSucursalesUsuario).toHaveBeenCalledWith(20);
    });

    test('obtenerSucursalesUsuario - debería pasar undefined cuando no hay usuario', async () => {
      req.usuario = null;
      await productoController.obtenerSucursalesUsuario(req, res, next);
      expect(ProductoService.obtenerSucursalesUsuario).toHaveBeenCalledWith(undefined);
    });
  });

  // ========== PRUEBAS DE MANEJO DE ERRORES ==========
  describe('Manejo de errores', () => {
    test('debería llamar a next cuando el servicio lanza error', async () => {
      const error = new Error('Error en base de datos');
      ProductoService.obtenerTodosLosProductos.mockRejectedValue(error);
      req.query = {};
      await productoController.obtenerTodosLosProductos(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
      expect(res.json).not.toHaveBeenCalled();
    });

    test('debería propagar errores de crearProducto a next', async () => {
      const error = new Error('Error al crear');
      ProductoService.crearProducto.mockRejectedValue(error);
      req.body = { nombre: 'Test' };
      await productoController.crearProducto(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== PRUEBAS DE RESPUESTAS EXITOSAS ==========
  describe('Verificación de respuestas exitosas', () => {
    test('crearProducto - debería retornar 201 en creación exitosa', async () => {
      const mockResultado = { id: 1, nombre: 'Producto' };
      ProductoService.crearProducto.mockResolvedValue(mockResultado);
      req.body = { nombre: 'Producto', precio: 100 };
      req.file = null;
      await productoController.crearProducto(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });

    test('actualizarProducto - debería retornar el resultado del servicio', async () => {
      const mockResultado = { id: 1, nombre: 'Actualizado' };
      ProductoService.actualizarProducto.mockResolvedValue(mockResultado);
      req.params = { id_producto: '1' };
      req.body = { nombre: 'Actualizado' };
      await productoController.actualizarProducto(req, res, next);
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });

    test('obtenerTodosLosProductos - debería retornar array vacío cuando no hay productos', async () => {
      ProductoService.obtenerTodosLosProductos.mockResolvedValue([]);
      await productoController.obtenerTodosLosProductos(req, res, next);
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});