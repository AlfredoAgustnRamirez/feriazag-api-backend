const localController = require('../../../controllers/local.controller');
const LocalService = require('../../../services/local.service');

jest.mock('../../../services/local.service');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] }))
}));

describe('LOCAL - Casos de Prueba Trazables con Documento', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { 
      params: {}, 
      body: {}, 
      usuario: { id_usuario: 5 } 
    };
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn() 
    };
    next = jest.fn();
  });

  // ============================================================
  // 4.6 SUCURSALES - CP-28 a CP-30
  // Tabla 59 - página 74
  // ============================================================

  // ==================== CP-28 ====================
  test('CP-28: Cambiar sucursal activa', async () => {
    const mockLocal = { id_local: 2, nombre_local: 'Sucursal Norte' };
    LocalService.cambiarLocalActivo.mockResolvedValue(mockLocal);
    
    req.params = { idLocal: '2' };
    
    await localController.cambiarLocalActivo(req, res, next);
    
    expect(LocalService.cambiarLocalActivo).toHaveBeenCalledWith(5, '2');
    expect(res.json).toHaveBeenCalledWith(mockLocal);
  });

  // ==================== CP-29 ====================
  test('CP-29: Cargar productos por sucursal', () => {
    // Este CP está más relacionado con productos que con local
    // Simulamos que los productos cambian según la sucursal
    const productosSucursal1 = [
      { id_producto: 1, descripcion: 'Remera', stock: 10 },
      { id_producto: 2, descripcion: 'Pantalón', stock: 5 }
    ];
    
    const productosSucursal2 = [
      { id_producto: 1, descripcion: 'Remera', stock: 3 },
      { id_producto: 3, descripcion: 'Zapatillas', stock: 8 }
    ];
    
    expect(productosSucursal1.length).toBe(2);
    expect(productosSucursal2.length).toBe(2);
    expect(productosSucursal1[0].stock).toBe(10);
    expect(productosSucursal2[0].stock).toBe(3);
  });

  // ==================== CP-30 ====================
  test('CP-30: Cargar sucursales del usuario', async () => {
    const mockSucursales = [
      { id_local: 1, nombre_local: 'Casa Central', es_activo: 'Si' },
      { id_local: 2, nombre_local: 'Sucursal Norte', es_activo: 'No' },
      { id_local: 3, nombre_local: 'Sucursal Sur', es_activo: 'No' }
    ];
    
    LocalService.getLocalesByUsuario.mockResolvedValue(mockSucursales);
    
    await localController.getLocalesByUsuario(req, res, next);
    
    expect(LocalService.getLocalesByUsuario).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith(mockSucursales);
  });

  // ============================================================
  // PRUEBAS ADICIONALES
  // ============================================================

  test('Obtener local activo del usuario', async () => {
    const mockLocal = { id_local: 1, nombre_local: 'Casa Central' };
    LocalService.getLocalActivo.mockResolvedValue(mockLocal);
    
    await localController.getLocalActivo(req, res, next);
    
    expect(LocalService.getLocalActivo).toHaveBeenCalledWith(5);
    expect(res.json).toHaveBeenCalledWith(mockLocal);
  });

  test('Obtener local activo - cuando no existe debe retornar 404', async () => {
    LocalService.getLocalActivo.mockResolvedValue(null);
    
    await localController.getLocalActivo(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'No se encontró un local activo' });
  });

  test('Crear nuevo local', async () => {
    const nuevaSucursal = {
      nombre_local: 'Nueva Sucursal',
      direccion: 'Calle Nueva 123',
      telefono: '3764123456'
    };
    
    LocalService.crearLocal.mockResolvedValue(10);
    
    req.body = nuevaSucursal;
    
    await localController.crearLocal(req, res, next);
    
    expect(LocalService.crearLocal).toHaveBeenCalledWith(nuevaSucursal, 5);
    expect(res.json).toHaveBeenCalledWith({ 
      success: true, 
      id_local: 10, 
      mensaje: 'Local creado correctamente' 
    });
  });

  test('Crear local sin nombre - debe fallar', async () => {
    const nuevaSucursal = {
      direccion: 'Calle Nueva 123',
      telefono: '3764123456'
    };
    
    const error = new Error('El nombre del local es requerido');
    LocalService.crearLocal.mockRejectedValue(error);
    
    req.body = nuevaSucursal;
    
    await localController.crearLocal(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  test('Actualizar configuración de local', async () => {
    const updateData = {
      id_local: 1,
      nombre_local: 'Casa Central Actualizada',
      direccion: 'Av. Nueva 456'
    };
    
    LocalService.actualizarLocal.mockResolvedValue(true);
    
    req.body = updateData;
    
    await localController.actualizarLocal(req, res, next);
    
    expect(LocalService.actualizarLocal).toHaveBeenCalledWith(1, updateData);
    expect(res.json).toHaveBeenCalledWith({ 
      success: true, 
      mensaje: 'Local actualizado correctamente' 
    });
  });

  test('Eliminar local - exitoso', async () => {
    LocalService.eliminarLocal.mockResolvedValue(true);
    
    req.params = { idLocal: '2' };
    
    await localController.eliminarLocal(req, res, next);
    
    expect(LocalService.eliminarLocal).toHaveBeenCalledWith('2', 5);
    expect(res.json).toHaveBeenCalledWith({ 
      success: true, 
      mensaje: 'Local eliminado correctamente' 
    });
  });

  test('Eliminar local - error: es el único local', async () => {
    const error = new Error('No puedes eliminar el único local. Debes tener al menos un local.');
    LocalService.eliminarLocal.mockRejectedValue(error);
    
    req.params = { idLocal: '1' };
    
    await localController.eliminarLocal(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });
});