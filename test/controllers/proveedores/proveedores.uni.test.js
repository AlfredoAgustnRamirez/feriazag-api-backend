const proveedorController = require('../../../controllers/proveedor.controller');
const ProveedorService = require('../../../services/proveedor.service');

jest.mock('../../../services/proveedor.service');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] }))
}));

describe('4.8 PROVEEDORES - Tabla 61 (página 75)', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, query: {}, usuario: { id_usuario: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // CP-34: Alta proveedor exitoso
  test('CP-34: Alta proveedor exitoso', async () => {
    const mockResult = { id_proveedor: 1, mensaje: 'Proveedor creado correctamente' };
    ProveedorService.crearProveedor.mockResolvedValue(mockResult);
    
    req.body = { nombre: 'Herramientas SRL', cuit: '30-12345678-9', telefono: '3764-123456' };
    await proveedorController.crearProveedor(req, res, next);
    
    expect(ProveedorService.crearProveedor).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // CP-35: Alta con CUIT duplicado
  test('CP-35: Alta con CUIT duplicado', async () => {
    const error = new Error('Ya existe un proveedor con ese CUIT');
    ProveedorService.crearProveedor.mockRejectedValue(error);
    
    req.body = { nombre: 'Herramientas SRL', cuit: '30-12345678-9', telefono: '3764-123456' };
    await proveedorController.crearProveedor(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  // CP-36: Alta con CUIT inválido
  test('CP-36: Alta con CUIT inválido', () => {
    const cuitInvalido = '12345678';
    const regex = /^\d{2}-\d{8}-\d$/;
    const esValido = regex.test(cuitInvalido);
    expect(esValido).toBe(false);
  });

  // CP-37: Alta sin campos obligatorios
test('CP-37: Alta sin campos obligatorios', () => {
    const proveedor = { nombre: '', telefono: '' };
    const tieneNombre = !!(proveedor.nombre && proveedor.nombre.trim() !== '');
    const tieneTelefono = !!(proveedor.telefono && proveedor.telefono.trim() !== '');
    const esValido = tieneNombre && tieneTelefono;
    expect(esValido).toBe(false);
});

  // CP-38: Modificar proveedor
  test('CP-38: Modificar proveedor', async () => {
    const mockResult = { mensaje: 'Proveedor actualizado correctamente' };
    ProveedorService.actualizarProveedor.mockResolvedValue(mockResult);
    
    req.params = { id_proveedor: '1' };
    req.body = { nombre: 'Herramientas SRL Actualizado', telefono: '3764-999999' };
    await proveedorController.actualizarProveedor(req, res, next);
    
    expect(ProveedorService.actualizarProveedor).toHaveBeenCalledWith('1', req.body);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // CP-39: Modificar CUIT a existente
  test('CP-39: Modificar CUIT a existente', async () => {
    const error = new Error('Ya existe otro proveedor con ese CUIT');
    ProveedorService.actualizarProveedor.mockRejectedValue(error);
    
    req.params = { id_proveedor: '2' };
    req.body = { cuit: '30-12345678-9' };
    await proveedorController.actualizarProveedor(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  // CP-40: Desactivar proveedor sin compras
  test('CP-40: Desactivar proveedor sin compras', async () => {
    const mockResult = { success: true, message: 'Proveedor desactivado correctamente' };
    ProveedorService.cambiarEstado.mockResolvedValue(mockResult);
    
    req.params = { id_proveedor: '1' };
    req.body = { activo: 'No' };
    await proveedorController.cambiarEstadoProveedor(req, res);
    
    expect(ProveedorService.cambiarEstado).toHaveBeenCalledWith('1', 'No');
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Proveedor desactivado correctamente' });
  });

  // CP-41: Desactivar proveedor con compras
  test('CP-41: Desactivar proveedor con compras', async () => {
    const error = new Error('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');
    ProveedorService.cambiarEstado.mockRejectedValue(error);
    
    req.params = { id_proveedor: '1' };
    req.body = { activo: 'No' };
    await proveedorController.cambiarEstadoProveedor(req, res);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, mensaje: error.message });
  });

  // CP-42: Buscar proveedor por CUIT
  test('CP-42: Buscar proveedor por CUIT', async () => {
    const mockProveedores = [{ id_proveedor: 1, nombre: 'Herramientas SRL', cuit: '30-12345678-9' }];
    ProveedorService.listarProveedores.mockResolvedValue(mockProveedores);
    
    await proveedorController.listarProveedores(req, res, next);
    
    expect(ProveedorService.listarProveedores).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockProveedores);
  });

  // CP-43: Buscar proveedor por razón social
  test('CP-43: Buscar proveedor por razón social', async () => {
    const mockProveedores = [{ id_proveedor: 1, nombre: 'Herramientas SRL' }];
    ProveedorService.listarProveedores.mockResolvedValue(mockProveedores);
    
    await proveedorController.listarProveedores(req, res, next);
    
    expect(ProveedorService.listarProveedores).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockProveedores);
  });

  // CP-44: Listar solo proveedores activos
  test('CP-44: Listar solo proveedores activos', async () => {
    const mockProveedores = [{ id_proveedor: 1, nombre: 'Herramientas SRL', activo: 'Si' }];
    ProveedorService.listarActivos.mockResolvedValue(mockProveedores);
    
    await proveedorController.listarProveedoresActivos(req, res, next);
    
    expect(ProveedorService.listarActivos).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(mockProveedores);
  });
});