// test/controllers/producto.test.js
const productoController = require('../../controllers/producto.controller');
const ProductoService = require('../../services/producto.service');
const { validationResult } = require('express-validator');

// Mockear express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({
    isEmpty: () => true,
    array: () => []
  }))
}));

describe('ProductoController', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Limpiar y espiar todos los métodos del servicio REAL
    jest.clearAllMocks();
    
    // Espiar métodos de ProductoService
    jest.spyOn(ProductoService, 'crearProducto').mockResolvedValue({ id: 1, mensaje: 'Creado' });
    jest.spyOn(ProductoService, 'actualizarProducto').mockResolvedValue({ id: 1, mensaje: 'Actualizado' });
    jest.spyOn(ProductoService, 'obtenerTodosLosProductos').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosConStock').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosPorLocal').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosActivos').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosVendidos').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosNoVendidos').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosBajoStock').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerProductosNoAsignados').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'activarProducto').mockResolvedValue({ mensaje: 'Activado' });
    jest.spyOn(ProductoService, 'desactivarProducto').mockResolvedValue({ mensaje: 'Desactivado' });
    jest.spyOn(ProductoService, 'obtenerStockPorSucursales').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerStockTodasSucursales').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'transferirStock').mockResolvedValue({ mensaje: 'Transferido' });
    jest.spyOn(ProductoService, 'asignarProductoALocal').mockResolvedValue({ mensaje: 'Asignado' });
    jest.spyOn(ProductoService, 'desactivarProductoEnLocal').mockResolvedValue({ mensaje: 'Desactivado' });
    jest.spyOn(ProductoService, 'buscarProductos').mockResolvedValue([]);
    jest.spyOn(ProductoService, 'obtenerSucursalesUsuario').mockResolvedValue([]);

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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ========== CREAR PRODUCTO ==========
  describe('crearProducto', () => {
    it('debería crear un producto exitosamente', async () => {
      const mockProducto = { id: 1, nombre: 'Producto Test' };
      ProductoService.crearProducto.mockResolvedValue(mockProducto);

      req.body = { nombre: 'Producto Test', precio: 100 };
      req.file = { filename: 'imagen.jpg' };

      await productoController.crearProducto(req, res, next);

      expect(ProductoService.crearProducto).toHaveBeenCalledWith(req.body, req.file);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockProducto);
    });

    it('debería retornar 400 si hay errores de validación', async () => {
      const mockErrors = [{ msg: 'El nombre es requerido' }];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      req.body = {};

      await productoController.crearProducto(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ errores: mockErrors });
      expect(ProductoService.crearProducto).not.toHaveBeenCalled();
    });

    it('debería llamar a next si hay error en el servicio', async () => {
      const error = new Error('Error en base de datos');
      ProductoService.crearProducto.mockRejectedValue(error);

      req.body = { nombre: 'Producto Test' };

      await productoController.crearProducto(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ========== ACTUALIZAR PRODUCTO ==========
  describe('actualizarProducto', () => {
    it('debería actualizar un producto exitosamente', async () => {
      const mockResultado = { id: 1, nombre: 'Actualizado' };
      ProductoService.actualizarProducto.mockResolvedValue(mockResultado);

      req.params = { id_producto: '1' };
      req.body = { nombre: 'Actualizado' };
      req.file = null;

      await productoController.actualizarProducto(req, res, next);

      expect(ProductoService.actualizarProducto).toHaveBeenCalledWith('1', req.body, false);
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });

    it('debería detectar si hay archivo en la actualización', async () => {
      req.params = { id_producto: '1' };
      req.body = { nombre: 'Actualizado' };
      req.file = { filename: 'nueva-imagen.jpg' };

      await productoController.actualizarProducto(req, res, next);

      expect(ProductoService.actualizarProducto).toHaveBeenCalledWith('1', req.body, true);
    });
  });

  // ========== OBTENER TODOS ==========
  describe('obtenerTodosLosProductos', () => {
    it('debería obtener todos los productos con idLocal por defecto', async () => {
      const mockProductos = [{ id: 1, nombre: 'Producto 1' }];
      ProductoService.obtenerTodosLosProductos.mockResolvedValue(mockProductos);

      req.query = {};

      await productoController.obtenerTodosLosProductos(req, res, next);

      expect(ProductoService.obtenerTodosLosProductos).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });

    it('debería usar el idLocal enviado en query', async () => {
      const mockProductos = [{ id: 1 }];
      ProductoService.obtenerTodosLosProductos.mockResolvedValue(mockProductos);

      req.query = { idLocal: '5' };

      await productoController.obtenerTodosLosProductos(req, res, next);

      expect(ProductoService.obtenerTodosLosProductos).toHaveBeenCalledWith('5');
    });
  });

  // ========== CON STOCK ==========
  describe('obtenerProductosConStock', () => {
    it('debería obtener productos con stock', async () => {
      const mockProductos = [{ id: 1, stock: 10 }];
      ProductoService.obtenerProductosConStock.mockResolvedValue(mockProductos);

      req.query = { idLocal: 2 };

      await productoController.obtenerProductosConStock(req, res, next);

      expect(ProductoService.obtenerProductosConStock).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== POR LOCAL ==========
  describe('obtenerProductosPorLocal', () => {
    it('debería obtener productos por ID de local', async () => {
      const mockProductos = [{ id: 1 }];
      ProductoService.obtenerProductosPorLocal.mockResolvedValue(mockProductos);

      req.params = { idLocal: '3' };

      await productoController.obtenerProductosPorLocal(req, res, next);

      expect(ProductoService.obtenerProductosPorLocal).toHaveBeenCalledWith('3');
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== ACTIVOS ==========
  describe('obtenerProductosActivos', () => {
    it('debería obtener productos activos', async () => {
      const mockProductos = [{ id: 1, activo: true }];
      ProductoService.obtenerProductosActivos.mockResolvedValue(mockProductos);

      await productoController.obtenerProductosActivos(req, res, next);

      expect(ProductoService.obtenerProductosActivos).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== VENDIDOS ==========
  describe('obtenerProductosVendidos', () => {
    it('debería obtener productos vendidos', async () => {
      const mockProductos = [{ id: 1, vendidos: 5 }];
      ProductoService.obtenerProductosVendidos.mockResolvedValue(mockProductos);

      req.query = { idLocal: 2 };

      await productoController.obtenerProductosVendidos(req, res, next);

      expect(ProductoService.obtenerProductosVendidos).toHaveBeenCalledWith(2);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== NO VENDIDOS ==========
  describe('obtenerProductosNoVendidos', () => {
    it('debería obtener productos no vendidos', async () => {
      const mockProductos = [{ id: 1, vendidos: 0 }];
      ProductoService.obtenerProductosNoVendidos.mockResolvedValue(mockProductos);

      await productoController.obtenerProductosNoVendidos(req, res, next);

      expect(ProductoService.obtenerProductosNoVendidos).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== BAJO STOCK ==========
  describe('obtenerProductosBajoStock', () => {
    it('debería obtener productos con stock bajo', async () => {
      const mockProductos = [{ id: 1, stock: 2 }];
      ProductoService.obtenerProductosBajoStock.mockResolvedValue(mockProductos);

      await productoController.obtenerProductosBajoStock(req, res, next);

      expect(ProductoService.obtenerProductosBajoStock).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== NO ASIGNADOS ==========
  describe('obtenerProductosNoAsignados', () => {
    it('debería obtener productos no asignados a un local', async () => {
      const mockProductos = [{ id: 1 }];
      ProductoService.obtenerProductosNoAsignados.mockResolvedValue(mockProductos);

      req.params = { idLocal: '4' };

      await productoController.obtenerProductosNoAsignados(req, res, next);

      expect(ProductoService.obtenerProductosNoAsignados).toHaveBeenCalledWith('4');
      expect(res.json).toHaveBeenCalledWith(mockProductos);
    });
  });

  // ========== ACTIVAR ==========
  describe('activarProducto', () => {
    it('debería activar un producto', async () => {
      const mockResultado = { id: 1, activo: true };
      ProductoService.activarProducto.mockResolvedValue(mockResultado);

      req.params = { id_producto: '1' };

      await productoController.activarProducto(req, res, next);

      expect(ProductoService.activarProducto).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });
  });

  // ========== DESACTIVAR ==========
  describe('desactivarProducto', () => {
    it('debería desactivar un producto', async () => {
      const mockResultado = { id: 1, activo: false };
      ProductoService.desactivarProducto.mockResolvedValue(mockResultado);

      req.params = { id_producto: '1' };

      await productoController.desactivarProducto(req, res, next);

      expect(ProductoService.desactivarProducto).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });
  });

  // ========== STOCK POR SUCURSALES ==========
  describe('obtenerStockPorSucursales', () => {
    it('debería obtener stock por sucursales para un usuario', async () => {
      const mockStock = [{ sucursal: 'Sucursal 1', stock: 10 }];
      ProductoService.obtenerStockPorSucursales.mockResolvedValue(mockStock);

      req.params = { id_producto: '1' };
      req.usuario = { id_usuario: 5 };

      await productoController.obtenerStockPorSucursales(req, res, next);

      expect(ProductoService.obtenerStockPorSucursales).toHaveBeenCalledWith('1', 5);
      expect(res.json).toHaveBeenCalledWith(mockStock);
    });
  });

  // ========== STOCK TODAS SUCURSALES ==========
  describe('obtenerStockTodasSucursales', () => {
    it('debería obtener stock de todas las sucursales', async () => {
      const mockStock = [{ sucursal: 'Sucursal 1', stock: 10 }];
      ProductoService.obtenerStockTodasSucursales.mockResolvedValue(mockStock);

      req.params = { id_producto: '1' };

      await productoController.obtenerStockTodasSucursales(req, res, next);

      expect(ProductoService.obtenerStockTodasSucursales).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockStock);
    });
  });

  // ========== TRANSFERIR STOCK ==========
  describe('transferirStock', () => {
    it('debería transferir stock entre sucursales', async () => {
      const mockResultado = { mensaje: 'Transferencia exitosa' };
      ProductoService.transferirStock.mockResolvedValue(mockResultado);

      req.body = { id_producto: 1, origen: 1, destino: 2, cantidad: 5 };

      await productoController.transferirStock(req, res, next);

      expect(ProductoService.transferirStock).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });
  });

  // ========== ASIGNAR A LOCAL ==========
  describe('asignarProductoALocal', () => {
    it('debería asignar producto a un local', async () => {
      const mockResultado = { mensaje: 'Producto asignado' };
      ProductoService.asignarProductoALocal.mockResolvedValue(mockResultado);

      req.body = { id_producto: 1, id_local: 2, stock_inicial: 10 };

      await productoController.asignarProductoALocal(req, res, next);

      expect(ProductoService.asignarProductoALocal).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });
  });

  // ========== DESACTIVAR EN LOCAL ==========
  describe('desactivarProductoEnLocal', () => {
    it('debería desactivar producto en un local específico', async () => {
      const mockResultado = { mensaje: 'Desactivado' };
      ProductoService.desactivarProductoEnLocal.mockResolvedValue(mockResultado);

      req.params = { id_producto: '1', id_local: '2' };

      await productoController.desactivarProductoEnLocal(req, res, next);

      expect(ProductoService.desactivarProductoEnLocal).toHaveBeenCalledWith('1', '2');
      expect(res.json).toHaveBeenCalledWith(mockResultado);
    });
  });

  // ========== BUSCAR ==========
  describe('buscarProductos', () => {
    it('debería buscar productos por término', async () => {
      const mockResultados = [{ id: 1, nombre: 'Producto encontrado' }];
      ProductoService.buscarProductos.mockResolvedValue(mockResultados);

      req.query = { busqueda: 'laptop' };

      await productoController.buscarProductos(req, res, next);

      expect(ProductoService.buscarProductos).toHaveBeenCalledWith('laptop');
      expect(res.json).toHaveBeenCalledWith(mockResultados);
    });
  });

  // ========== SUCURSALES DEL USUARIO ==========
  describe('obtenerSucursalesUsuario', () => {
    it('debería obtener sucursales del usuario autenticado', async () => {
      const mockSucursales = [{ id: 1, nombre: 'Sucursal 1' }];
      ProductoService.obtenerSucursalesUsuario.mockResolvedValue(mockSucursales);

      req.usuario = { id_usuario: 10 };

      await productoController.obtenerSucursalesUsuario(req, res, next);

      expect(ProductoService.obtenerSucursalesUsuario).toHaveBeenCalledWith(10);
      expect(res.json).toHaveBeenCalledWith(mockSucursales);
    });

    it('debería manejar usuario no autenticado', async () => {
      req.usuario = null;

      await productoController.obtenerSucursalesUsuario(req, res, next);

      expect(ProductoService.obtenerSucursalesUsuario).toHaveBeenCalledWith(undefined);
    });
  });
});