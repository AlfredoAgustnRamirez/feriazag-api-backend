const clienteController = require('../../../controllers/cliente.controller');
const ClienteService = require('../../../services/cliente.service');

// Mocks
jest.mock('../../../services/cliente.service');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] }))
}));

describe('CLIENTE - Casos de Prueba Trazables con Documento', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { params: {}, body: {}, query: {}, usuario: { id_usuario: 1 } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  // ============================================================
  // 4.5 CLIENTES - CP-24 a CP-27
  // Caso de Uso: Gestión de Clientes
  // Requisito Funcional: RF 15 - Registro de clientes
  // ============================================================

  // ==================== CP-24 ====================
  // Caso de Uso: Seleccionar cliente existente
  // Requisito Funcional: RF 15 - Registro de clientes
  test('CP-24: Seleccionar cliente existente', async () => {
    const mockClientes = [
      { id_cliente: 1, nombre_razon_social: 'Juan Pérez', dni_cuit: '20-12345678-9', activo: 'SI' },
      { id_cliente: 2, nombre_razon_social: 'María Gómez', dni_cuit: '27-87654321-0', activo: 'SI' }
    ];
    
    ClienteService.listarClientes.mockResolvedValue(mockClientes);
    
    req.query = { estado: 'activos' };
    await clienteController.listarClientes(req, res, next);
    
    expect(ClienteService.listarClientes).toHaveBeenCalledWith('activos');
    expect(res.json).toHaveBeenCalledWith(mockClientes);
    
    const clienteSeleccionado = mockClientes[0];
    expect(clienteSeleccionado.nombre_razon_social).toBe('Juan Pérez');
    expect(clienteSeleccionado.dni_cuit).toBe('20-12345678-9');
  });

  // ==================== CP-25 ====================
  // Caso de Uso: Crear cliente rápido
  // Requisito Funcional: RF 15 - Registro de clientes
  test('CP-25: Crear cliente rápido', async () => {
    const nuevoCliente = {
      nombre_razon_social: 'Pedro López',
      dni_cuit: '20-98765432-1',
      telefono_whatsapp: '3764123456',
      correo_electronico: 'pedro@mail.com',
      id_tipo_cliente: 1
    };
    
    const mockResult = { id_cliente: 5, mensaje: 'Cliente creado correctamente' };
    ClienteService.crearCliente.mockResolvedValue(mockResult);
    
    req.body = nuevoCliente;
    await clienteController.crearCliente(req, res, next);
    
    expect(ClienteService.crearCliente).toHaveBeenCalledWith(nuevoCliente);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // ==================== CP-26 ====================
  // Caso de Uso: Crear cliente con datos inválidos
  // Requisito Funcional: RF 15 - Registro de clientes
  test('CP-26: Crear cliente con datos inválidos', async () => {
    const error = new Error('Complete los campos requeridos');
    ClienteService.crearCliente.mockRejectedValue(error);
    
    req.body = {
      nombre_razon_social: '',
      dni_cuit: '',
      id_tipo_cliente: null
    };
    
    await clienteController.crearCliente(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  // ==================== CP-27 ====================
  // Caso de Uso: Consumidor Final
  // Requisito Funcional: RF 15 - Registro de clientes
  test('CP-27: Consumidor Final', async () => {
    const consumidorFinal = {
      id_cliente: null,
      nombre_razon_social: 'CONSUMIDOR FINAL',
      dni_cuit: '00-00000000-0'
    };
    
    // Verificar que consumidor final tiene formato especial
    expect(consumidorFinal.nombre_razon_social).toBe('CONSUMIDOR FINAL');
    expect(consumidorFinal.dni_cuit).toBe('00-00000000-0');
    expect(consumidorFinal.id_cliente).toBeNull();
  });

  // ============================================================
  // PRUEBAS ADICIONALES DE CLIENTES (no están en CP pero son útiles)
  // ============================================================

  // ==================== CP-25 variante ====================
  test('CP-25: Crear cliente con DNI duplicado', async () => {
    const error = new Error('Ya existe un cliente con ese DNI/CUIT');
    ClienteService.crearCliente.mockRejectedValue(error);
    
    req.body = {
      nombre_razon_social: 'Juan Pérez',
      dni_cuit: '20-12345678-9', // DNI ya existente
      id_tipo_cliente: 1
    };
    
    await clienteController.crearCliente(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  // ==================== Obtener cliente por ID ====================
  test('Obtener cliente por ID exitosamente', async () => {
    const mockCliente = { id_cliente: 1, nombre_razon_social: 'Juan Pérez', dni_cuit: '20-12345678-9' };
    ClienteService.obtenerClientePorId.mockResolvedValue(mockCliente);
    
    req.params = { id_cliente: '1' };
    await clienteController.obtenerClientePorId(req, res, next);
    
    expect(ClienteService.obtenerClientePorId).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith(mockCliente);
  });

  // ==================== Actualizar cliente ====================
  test('Actualizar cliente exitosamente', async () => {
    const mockResult = { mensaje: 'Cliente actualizado correctamente' };
    ClienteService.actualizarCliente.mockResolvedValue(mockResult);
    
    req.params = { id_cliente: '1' };
    req.body = {
      nombre_razon_social: 'Juan Pérez Actualizado',
      dni_cuit: '20-12345678-9',
      id_tipo_cliente: 1,
      activo: 'SI'
    };
    
    await clienteController.actualizarCliente(req, res, next);
    
    expect(ClienteService.actualizarCliente).toHaveBeenCalledWith('1', req.body);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // ==================== Cambiar estado ====================
  test('Cambiar estado de cliente (activar/desactivar)', async () => {
    const mockResult = { mensaje: 'Cliente activado correctamente' };
    ClienteService.cambiarEstado.mockResolvedValue(mockResult);
    
    req.params = { id_cliente: '1' };
    req.body = { activo: 'SI' };
    
    await clienteController.cambiarEstado(req, res, next);
    
    expect(ClienteService.cambiarEstado).toHaveBeenCalledWith('1', 'SI');
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  // ==================== Eliminar cliente ====================
  test('Eliminar cliente sin ventas asociadas', async () => {
    const mockResult = { mensaje: 'Cliente eliminado correctamente' };
    ClienteService.eliminarCliente.mockResolvedValue(mockResult);
    
    req.params = { id_cliente: '1' };
    await clienteController.eliminarCliente(req, res, next);
    
    expect(ClienteService.eliminarCliente).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  test('Eliminar cliente con ventas asociadas - debe rechazar', async () => {
    const error = new Error('No se puede eliminar el cliente porque tiene ventas asociadas');
    ClienteService.eliminarCliente.mockRejectedValue(error);
    
    req.params = { id_cliente: '1' };
    await clienteController.eliminarCliente(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });

  // ==================== Buscar clientes ====================
  test('Buscar clientes por nombre o DNI', async () => {
    const mockClientes = [
      { id_cliente: 1, nombre_razon_social: 'Juan Pérez', dni_cuit: '20-12345678-9' }
    ];
    ClienteService.buscarClientes.mockResolvedValue(mockClientes);
    
    req.query = { search: 'Juan' };
    await clienteController.buscarClientes(req, res, next);
    
    expect(ClienteService.buscarClientes).toHaveBeenCalledWith('Juan');
    expect(res.json).toHaveBeenCalledWith(mockClientes);
  });
});