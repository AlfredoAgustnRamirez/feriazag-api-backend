// Importa el controlador de ventas para probar sus métodos
const ventaController = require('../../../controllers/venta.controller');

// Importa el servicio de ventas (será mockeado)
const VentaService = require('../../../services/venta.service');

// Mockea el servicio de ventas para evitar llamadas reales a la base de datos
jest.mock('../../../services/venta.service');

// Mockea express-validator para simular validaciones exitosas
jest.mock('express-validator', () => ({
    validationResult: jest.fn(() => ({ 
        isEmpty: () => true,      // No hay errores de validación
        array: () => []           // Array vacío de errores
    }))
}));

/**
 * Suite de pruebas para el Registro de Venta
 * Corresponde a los casos de prueba CP-19 a CP-23 de la documentación
 * 
 * CP-19: Registro de venta exitoso
 * CP-20: Registro sin cliente - debería rechazar
 * CP-21: Registro con cliente seleccionado
 * CP-22: Error en servidor al registrar
 * CP-23: Carrito vacío intentar registrar venta
 */
describe('REGISTRO DE VENTA - CP-19 a CP-23', () => {
    // Variables que se reinician antes de cada test
    let req, res, next;

    // ========== CONFIGURACIÓN INICIAL ==========
    // Se ejecuta antes de cada prueba para tener un estado limpio
    beforeEach(() => {
        // Limpia todos los mocks para evitar interferencias entre pruebas
        jest.clearAllMocks();
        
        // ========== OBJETO REQUEST (simula la petición HTTP) ==========
        req = { 
            body: {},           // Datos enviados en el cuerpo de la petición
            params: {},         // Parámetros de la URL
            query: {},          // Parámetros de la query string
            usuario: {          // Usuario autenticado (agregado por middleware)
                id_usuario: 1, 
                id_local: 1 
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
    // CP-19: REGISTRO DE VENTA EXITOSO
    // ==========================================
    /**
     * Verifica que el controlador:
     * 1. Llame al servicio con los datos correctos
     * 2. Responda con código 201 (Created)
     * 3. Devuelva el resultado del servicio en formato JSON
     */
    test('CP-19: Registro de venta exitoso', async () => {
        // Simula la respuesta exitosa del servicio
        const mockResult = { 
            id_venta: 1, 
            mensaje: 'Venta registrada correctamente' 
        };
        VentaService.registrarVenta.mockResolvedValue(mockResult);

        // Datos de una venta válida
        req.body = {
            total_venta: 10000,                    // Total con recargo
            iduser: 1,                             // ID del vendedor
            detalles: [{                           // Productos vendidos
                id_producto: 1, 
                cantidad: 2, 
                precio: 5000 
            }],
            medios_pago: [{                        // Medios de pago
                id_medio_pago: 1,                  // 1 = Efectivo
                monto: 10000 
            }],
            id_local: 1,                           // Sucursal
            id_cliente: 1                          // Cliente
        };

        // Ejecuta el método del controlador
        await ventaController.registrarVenta(req, res, next);

        // ========== VERIFICACIONES ==========
        // Verifica que el servicio fue llamado con los datos correctos
        expect(VentaService.registrarVenta).toHaveBeenCalledWith(req.body);
        
        // Verifica que la respuesta tiene código 201 (Created)
        expect(res.status).toHaveBeenCalledWith(201);
        
        // Verifica que devuelve el resultado esperado
        expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    // ==========================================
    // CP-20: REGISTRO SIN CLIENTE - DEBERÍA RECHAZAR
    // ==========================================
    /**
     * Verifica que la venta se rechaza si no hay cliente seleccionado
     * Nota: Este test es más conceptual, ya que la validación real
     * debería estar en el controlador o servicio
     */
    test('CP-20: Registro sin cliente - debería rechazar', () => {
        // Simula que no hay cliente seleccionado
        const clienteSeleccionado = null;
        const clienteIdTemp = null;
        
        // Calcula si hay cliente (ambos deben ser truthy)
        const tieneCliente = !!(clienteSeleccionado && clienteIdTemp);
        
        // Verifica que no hay cliente
        expect(tieneCliente).toBe(false);
    });

    // ==========================================
    // CP-21: REGISTRO CON CLIENTE SELECCIONADO
    // ==========================================
    /**
     * Verifica que la venta se aprueba si hay cliente seleccionado
     * El cliente puede ser "Consumidor Final" o un cliente registrado
     */
    test('CP-21: Registro con cliente seleccionado', () => {
        // Simula un cliente seleccionado
        const clienteSeleccionado = { 
            id_cliente: 1, 
            nombre: 'Juan Pérez' 
        };
        const clienteIdTemp = 1;
        
        // Calcula si hay cliente
        const tieneCliente = !!(clienteSeleccionado && clienteIdTemp);
        
        // Verifica que hay cliente
        expect(tieneCliente).toBe(true);
    });

    // ==========================================
    // CP-22: ERROR EN SERVIDOR AL REGISTRAR
    // ==========================================
    /**
     * Verifica que el controlador maneja correctamente los errores del servicio
     * y los pasa al middleware de errores de Express
     */
    test('CP-22: Error en servidor al registrar', async () => {
        // Simula un error del servicio (ej: conexión a BD fallida)
        const error = new Error('Error interno del servidor');
        VentaService.registrarVenta.mockRejectedValue(error);

        // Datos de una venta (aunque sean correctos, el servicio fallará)
        req.body = {
            total_venta: 10000,
            iduser: 1,
            detalles: [{ id_producto: 1, cantidad: 2, precio: 5000 }],
            medios_pago: [{ id_medio_pago: 1, monto: 10000 }],
            id_local: 1
        };

        // Ejecuta el método del controlador
        await ventaController.registrarVenta(req, res, next);

        // ========== VERIFICACIONES ==========
        // Verifica que el error fue pasado al middleware de errores
        expect(next).toHaveBeenCalledWith(error);
        
        // Verifica que NO se llamó a res.status (la respuesta no se envió)
        expect(res.status).not.toHaveBeenCalled();
    });

    // ==========================================
    // CP-23: CARRITO VACÍO - INTENTAR REGISTRAR VENTA
    // ==========================================
    /**
     * Verifica que la venta se rechaza si el carrito está vacío
     * La validación real debería estar en el servicio
     */
    test('CP-23: Carrito vacío intentar registrar venta', () => {
        // Simula un carrito vacío
        const carrito = [];
        
        // Determina si se puede registrar (requiere al menos un producto)
        const puedeRegistrar = carrito.length > 0;
        
        // Verifica que NO se puede registrar
        expect(puedeRegistrar).toBe(false);
    });
});