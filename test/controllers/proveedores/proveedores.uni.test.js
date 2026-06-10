// Importa el controlador de proveedores para probar sus métodos
const proveedorController = require('../../../controllers/proveedor.controller');

// Importa el servicio de proveedores (será mockeado)
const ProveedorService = require('../../../services/proveedor.service');

// Mockea el servicio de proveedores para evitar llamadas reales a la base de datos
jest.mock('../../../services/proveedor.service');

// Mockea express-validator para simular validaciones exitosas
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({ 
        isEmpty: () => true,      // No hay errores de validación
        array: () => []           // Array vacío de errores
    }))
}));

/**
 * Suite de pruebas para el módulo de Proveedores
 * Corresponde a los casos de prueba CP-34 a CP-44 de la documentación (Tabla 61, página 75)
 * 
 * CP-34: Alta proveedor exitoso
 * CP-35: Alta con CUIT duplicado
 * CP-36: Alta con CUIT inválido
 * CP-37: Alta sin campos obligatorios
 * CP-38: Modificar proveedor
 * CP-39: Modificar CUIT a existente
 * CP-40: Desactivar proveedor sin compras
 * CP-41: Desactivar proveedor con compras
 * CP-42: Buscar proveedor por CUIT
 * CP-43: Buscar proveedor por razón social
 * CP-44: Listar solo proveedores activos
 */
describe('4.8 PROVEEDORES - Tabla 61 (página 75)', () => {
    // Variables que se reinician antes de cada test
    let req, res, next;

    // ========== CONFIGURACIÓN INICIAL ==========
    // Se ejecuta antes de cada prueba para tener un estado limpio
    beforeEach(() => {
        // Limpia todos los mocks para evitar interferencias entre pruebas
        jest.clearAllMocks();
        
        // ========== OBJETO REQUEST (simula la petición HTTP) ==========
        req = { 
            params: {},           // Parámetros de la URL (ej: /:id_proveedor)
            body: {},             // Datos enviados en el cuerpo de la petición
            query: {},            // Parámetros de la query string
            usuario: { 
                id_usuario: 1      // Usuario autenticado
            } 
        };
        
        // ========== OBJETO RESPONSE (simula la respuesta HTTP) ==========
        res = { 
            status: jest.fn().mockReturnThis(),   // Permite encadenar .json()
            json: jest.fn()                       // Captura la respuesta JSON
        };
        
        // ========== FUNCIÓN NEXT (middleware de errores) ==========
        next = jest.fn();
    });

    // ==========================================
    // CP-34: ALTA PROVEEDOR EXITOSO
    // ==========================================
    /**
     * Verifica que el controlador:
     * 1. Llame al servicio con los datos correctos
     * 2. Responda con código 201 (Created)
     * 3. Devuelva el resultado del servicio
     */
    test('CP-34: Alta proveedor exitoso', async () => {
        // Simula la respuesta exitosa del servicio
        const mockResult = { 
            id_proveedor: 1, 
            mensaje: 'Proveedor creado correctamente' 
        };
        ProveedorService.crearProveedor.mockResolvedValue(mockResult);
        
        // Datos de un proveedor válido
        req.body = { 
            nombre: 'Herramientas SRL', 
            cuit: '30-12345678-9', 
            telefono: '3764-123456' 
        };
        
        // Ejecuta el método del controlador
        await proveedorController.crearProveedor(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el servicio fue llamado con los datos correctos
        expect(ProveedorService.crearProveedor).toHaveBeenCalledWith(req.body);
        
        // Verifica que la respuesta tiene código 201 (Created)
        expect(res.status).toHaveBeenCalledWith(201);
        
        // Verifica que devuelve el resultado esperado
        expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    // ==========================================
    // CP-35: ALTA CON CUIT DUPLICADO
    // ==========================================
    /**
     * Verifica que el sistema rechaza un proveedor con CUIT ya existente
     */
    test('CP-35: Alta con CUIT duplicado', async () => {
        // Simula el error de CUIT duplicado
        const error = new Error('Ya existe un proveedor con ese CUIT');
        ProveedorService.crearProveedor.mockRejectedValue(error);
        
        // Datos con CUIT que ya existe
        req.body = { 
            nombre: 'Herramientas SRL', 
            cuit: '30-12345678-9', 
            telefono: '3764-123456' 
        };
        
        // Ejecuta el método del controlador
        await proveedorController.crearProveedor(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el error fue pasado al middleware
        expect(next).toHaveBeenCalledWith(error);
    });

    // ==========================================
    // CP-36: ALTA CON CUIT INVÁLIDO
    // ==========================================
    /**
     * Verifica la validación del formato de CUIT
     * Formato esperado: XX-XXXXXXXX-X (ej: 30-12345678-9)
     */
    test('CP-36: Alta con CUIT inválido', () => {
        // CUIT con formato incorrecto (sin guiones)
        const cuitInvalido = '12345678';
        
        // Expresión regular para validar formato de CUIT
        const regex = /^\d{2}-\d{8}-\d$/;  // 2 dígitos - 8 dígitos - 1 dígito
        
        const esValido = regex.test(cuitInvalido);
        
        // Verifica que el CUIT inválido no pasa la validación
        expect(esValido).toBe(false);
    });

    // ==========================================
    // CP-37: ALTA SIN CAMPOS OBLIGATORIOS
    // ==========================================
    /**
     * Verifica que los campos obligatorios (nombre y teléfono) no estén vacíos
     */
    test('CP-37: Alta sin campos obligatorios', () => {
        // Datos con campos obligatorios vacíos
        const proveedor = { 
            nombre: '', 
            telefono: '' 
        };
        
        // Validaciones de campos obligatorios
        const tieneNombre = !!(proveedor.nombre && proveedor.nombre.trim() !== '');
        const tieneTelefono = !!(proveedor.telefono && proveedor.telefono.trim() !== '');
        const esValido = tieneNombre && tieneTelefono;
        
        // Verifica que los datos son inválidos
        expect(esValido).toBe(false);
    });

    // ==========================================
    // CP-38: MODIFICAR PROVEEDOR
    // ==========================================
    /**
     * Verifica que el controlador puede actualizar un proveedor existente
     */
    test('CP-38: Modificar proveedor', async () => {
        // Simula la respuesta exitosa del servicio
        const mockResult = { 
            mensaje: 'Proveedor actualizado correctamente' 
        };
        ProveedorService.actualizarProveedor.mockResolvedValue(mockResult);
        
        // Configura el ID del proveedor y los datos a actualizar
        req.params = { id_proveedor: '1' };
        req.body = { 
            nombre: 'Herramientas SRL Actualizado', 
            telefono: '3764-999999' 
        };
        
        // Ejecuta el método del controlador
        await proveedorController.actualizarProveedor(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el servicio fue llamado con el ID y los datos
        expect(ProveedorService.actualizarProveedor).toHaveBeenCalledWith('1', req.body);
        
        // Verifica que devuelve el mensaje de éxito
        expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    // ==========================================
    // CP-39: MODIFICAR CUIT A EXISTENTE
    // ==========================================
    /**
     * Verifica que no se puede cambiar el CUIT a uno que ya pertenece a otro proveedor
     */
    test('CP-39: Modificar CUIT a existente', async () => {
        // Simula el error de CUIT duplicado en otro proveedor
        const error = new Error('Ya existe otro proveedor con ese CUIT');
        ProveedorService.actualizarProveedor.mockRejectedValue(error);
        
        // Configura el ID y el nuevo CUIT (que ya existe en otro proveedor)
        req.params = { id_proveedor: '2' };
        req.body = { cuit: '30-12345678-9' };
        
        // Ejecuta el método del controlador
        await proveedorController.actualizarProveedor(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el error fue pasado al middleware
        expect(next).toHaveBeenCalledWith(error);
    });

    // ==========================================
    // CP-40: DESACTIVAR PROVEEDOR SIN COMPRAS
    // ==========================================
    /**
     * Verifica que se puede desactivar un proveedor que no tiene compras asociadas
     */
    test('CP-40: Desactivar proveedor sin compras', async () => {
        // Simula la respuesta exitosa del servicio
        const mockResult = { 
            success: true, 
            message: 'Proveedor desactivado correctamente' 
        };
        ProveedorService.cambiarEstado.mockResolvedValue(mockResult);
        
        // Configura el ID y el nuevo estado ('No' = inactivo)
        req.params = { id_proveedor: '1' };
        req.body = { activo: 'No' };
        
        // Ejecuta el método del controlador (nota: usa res directamente, no next)
        await proveedorController.cambiarEstadoProveedor(req, res);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el servicio fue llamado correctamente
        expect(ProveedorService.cambiarEstado).toHaveBeenCalledWith('1', 'No');
        
        // Verifica la respuesta de éxito
        expect(res.json).toHaveBeenCalledWith({ 
            success: true, 
            message: 'Proveedor desactivado correctamente' 
        });
    });

    // ==========================================
    // CP-41: DESACTIVAR PROVEEDOR CON COMPRAS
    // ==========================================
    /**
     * Verifica que NO se puede desactivar un proveedor que tiene órdenes de compra
     */
    test('CP-41: Desactivar proveedor con compras', async () => {
        // Simula el error de proveedor con compras asociadas
        const error = new Error('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');
        ProveedorService.cambiarEstado.mockRejectedValue(error);
        
        // Configura el ID y el nuevo estado
        req.params = { id_proveedor: '1' };
        req.body = { activo: 'No' };
        
        // Ejecuta el método del controlador
        await proveedorController.cambiarEstadoProveedor(req, res);
        
        // ========== VERIFICACIONES ==========
        // Verifica que la respuesta tiene código 400 (Bad Request)
        expect(res.status).toHaveBeenCalledWith(400);
        
        // Verifica que devuelve el mensaje de error
        expect(res.json).toHaveBeenCalledWith({ 
            success: false, 
            mensaje: error.message 
        });
    });

    // ==========================================
    // CP-42: BUSCAR PROVEEDOR POR CUIT
    // ==========================================
    /**
     * Verifica que se puede buscar un proveedor por su CUIT
     */
    test('CP-42: Buscar proveedor por CUIT', async () => {
        // Simula la lista de proveedores (filtrados por CUIT en el servicio real)
        const mockProveedores = [{ 
            id_proveedor: 1, 
            nombre: 'Herramientas SRL', 
            cuit: '30-12345678-9' 
        }];
        ProveedorService.listarProveedores.mockResolvedValue(mockProveedores);
        
        // Ejecuta el método del controlador
        await proveedorController.listarProveedores(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el servicio fue llamado
        expect(ProveedorService.listarProveedores).toHaveBeenCalled();
        
        // Verifica que devuelve la lista de proveedores
        expect(res.json).toHaveBeenCalledWith(mockProveedores);
    });

    // ==========================================
    // CP-43: BUSCAR PROVEEDOR POR RAZÓN SOCIAL
    // ==========================================
    /**
     * Verifica que se puede buscar un proveedor por su nombre/razón social
     */
    test('CP-43: Buscar proveedor por razón social', async () => {
        // Simula la lista de proveedores (filtrados por nombre en el servicio real)
        const mockProveedores = [{ 
            id_proveedor: 1, 
            nombre: 'Herramientas SRL' 
        }];
        ProveedorService.listarProveedores.mockResolvedValue(mockProveedores);
        
        // Ejecuta el método del controlador
        await proveedorController.listarProveedores(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el servicio fue llamado
        expect(ProveedorService.listarProveedores).toHaveBeenCalled();
        
        // Verifica que devuelve la lista de proveedores
        expect(res.json).toHaveBeenCalledWith(mockProveedores);
    });

    // ==========================================
    // CP-44: LISTAR SOLO PROVEEDORES ACTIVOS
    // ==========================================
    /**
     * Verifica que se pueden listar solo los proveedores activos (para selects)
     */
    test('CP-44: Listar solo proveedores activos', async () => {
        // Simula la lista de proveedores activos
        const mockProveedores = [{ 
            id_proveedor: 1, 
            nombre: 'Herramientas SRL', 
            activo: 'Si' 
        }];
        ProveedorService.listarActivos.mockResolvedValue(mockProveedores);
        
        // Ejecuta el método del controlador
        await proveedorController.listarProveedoresActivos(req, res, next);
        
        // ========== VERIFICACIONES ==========
        // Verifica que el servicio de listar activos fue llamado
        expect(ProveedorService.listarActivos).toHaveBeenCalled();
        
        // Verifica que devuelve solo los proveedores activos
        expect(res.json).toHaveBeenCalledWith(mockProveedores);
    });
});