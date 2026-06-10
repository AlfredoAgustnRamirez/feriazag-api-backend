// test/services/compra/compra.service.test.js

// Importa el servicio de compras que se va a probar
const CompraService = require('../../../services/compra.service');

// Importa el modelo de compras (será mockeado)
const CompraModel = require('../../../models/compra.model');

// ========== MOCK DE DEPENDENCIAS ==========
// Mockea el modelo de compras para evitar llamadas reales a la base de datos
jest.mock('../../../models/compra.model');

/**
 * Suite de pruebas unitarias para CompraService
 * 
 * Se prueban los siguientes métodos:
 * 1. listarCompras - Listado de órdenes de compra con conversión de tipos
 * 2. obtenerCompraPorId - Obtención de una orden por ID
 * 3. crearCompra - Creación de una nueva orden de compra
 * 4. confirmarRecepcion - Confirmación de recepción y actualización de stock
 * 5. listarProductosActivos - Listado de productos activos
 * 6. listarProveedoresActivos - Listado de proveedores activos
 */
describe('CompraService - Pruebas Unitarias', () => {
    // Variable que contendrá la instancia del servicio
    let compraService;

    // ========== CONFIGURACIÓN INICIAL ==========
    // Se ejecuta antes de cada prueba para tener un estado limpio
    beforeEach(() => {
        // Asigna la instancia del servicio (es un Singleton)
        compraService = CompraService;
        
        // Limpia todos los mocks para evitar interferencias entre pruebas
        jest.clearAllMocks();
    });

    // ==========================================
    // 1. PRUEBAS DE listarCompras
    // ==========================================
    /**
     * Prueba el listado de todas las órdenes de compra
     * 
     * Importante: Los valores vienen como strings desde la BD y se convierten a number
     */
    describe('listarCompras', () => {
        /**
         * CP-51/52: Consultar órdenes por fecha/proveedor
         * 
         * Verifica que:
         * 1. Retorna la lista completa de órdenes
         * 2. Convierte correctamente los valores de string a number
         */
        test('debería retornar lista de compras con números convertidos', async () => {
            // ========== ARRANGE (Configuración) ==========
            // Simula datos de compras como vienen de la BD (strings)
            const comprasMock = [
                { id_compra: 1, subtotal: '1000.00', iva: '210.00', total: '1210.00' },
                { id_compra: 2, subtotal: '2000.00', iva: '420.00', total: '2420.00' }
            ];
            CompraModel.listarCompras.mockResolvedValue(comprasMock);

            // ========== ACT (Ejecución) ==========
            const resultado = await compraService.listarCompras();

            // ========== ASSERT (Verificaciones) ==========
            // Verifica que retorna 2 elementos
            expect(resultado).toHaveLength(2);
            
            // Verifica que los valores se convirtieron a número correctamente
            expect(resultado[0].subtotal).toBe(1000);  // String "1000.00" → Number 1000
            expect(resultado[0].iva).toBe(210);        // String "210.00" → Number 210
            expect(resultado[0].total).toBe(1210);     // String "1210.00" → Number 1210
            
            // Verifica que el modelo fue llamado
            expect(CompraModel.listarCompras).toHaveBeenCalled();
        });

        /**
         * Verifica que retorna un array vacío cuando no hay órdenes
         */
        test('debería retornar array vacío si no hay compras', async () => {
            // ========== ARRANGE ==========
            CompraModel.listarCompras.mockResolvedValue([]);

            // ========== ACT ==========
            const resultado = await compraService.listarCompras();

            // ========== ASSERT ==========
            expect(resultado).toEqual([]);
        });
    });

    // ==========================================
    // 2. PRUEBAS DE obtenerCompraPorId
    // ==========================================
    /**
     * Prueba la obtención de una orden de compra por su ID
     * 
     * CP-53: Ver detalle de orden
     */
    describe('obtenerCompraPorId', () => {
        /**
         * Verifica que retorna la compra completa con sus productos
         * cuando el ID existe
         */
        test('debería retornar compra cuando existe', async () => {
            // ========== ARRANGE ==========
            // Simula una compra completa con sus productos (valores como strings)
            const compraMock = {
                id_compra: 1,
                subtotal: '1000.00',
                iva: '210.00',
                total: '1210.00',
                productos: [
                    { id_producto: 1, precio_compra: '500.00', subtotal: '500.00', cantidad: 1 },
                    { id_producto: 2, precio_compra: '500.00', subtotal: '500.00', cantidad: 1 }
                ]
            };
            CompraModel.obtenerCompraPorId.mockResolvedValue(compraMock);

            // ========== ACT ==========
            const resultado = await compraService.obtenerCompraPorId(1);

            // ========== ASSERT ==========
            // Verifica los datos de la compra
            expect(resultado.id_compra).toBe(1);
            expect(resultado.subtotal).toBe(1000);  // String convertido a Number
            
            // Verifica que tiene 2 productos
            expect(resultado.productos).toHaveLength(2);
            
            // Verifica que el modelo fue llamado con el ID correcto
            expect(CompraModel.obtenerCompraPorId).toHaveBeenCalledWith(1);
        });

        /**
         * Verifica que lanza error cuando la compra no existe
         */
        test('debería lanzar error si la compra no existe', async () => {
            // ========== ARRANGE ==========
            // Simula que no se encontró la compra
            CompraModel.obtenerCompraPorId.mockResolvedValue(null);

            // ========== ACT & ASSERT ==========
            await expect(compraService.obtenerCompraPorId(999))
                .rejects
                .toThrow('Compra no encontrada');
        });
    });

    // ==========================================
    // 3. PRUEBAS DE crearCompra
    // ==========================================
    /**
     * Prueba la creación de una nueva orden de compra
     * 
     * CP-45: Orden de compra exitosa
     * CP-46: Orden con múltiples productos
     */
    describe('crearCompra', () => {
        // Datos de prueba para la orden
        const userId = 1;  // ID del usuario que crea la orden
        const dataCompra = {
            id_proveedor: 1,
            fecha: '2024-01-15',
            numero_factura: 'F-001',
            subtotal: 1000,
            iva: 210,
            total: 1210,
            id_local: 18,
            detalles: [
                { id_producto: 1, cantidad: 2, precio_compra: 500 },
                { id_producto: 2, cantidad: 1, precio_compra: 0 }
            ]
        };

        /**
         * Verifica que se puede crear una orden exitosamente
         */
        test('debería crear compra exitosamente', async () => {
            // ========== ARRANGE ==========
            // Mock: La creación de cabecera devuelve ID = 1
            CompraModel.crearCompra.mockResolvedValue(1);
            
            // Mock: La inserción de detalles fue exitosa
            CompraModel.crearDetallesCompra.mockResolvedValue(true);

            // ========== ACT ==========
            const resultado = await compraService.crearCompra(dataCompra, userId);

            // ========== ASSERT ==========
            // Verifica que devuelve el ID y el mensaje correcto
            expect(resultado.id_compra).toBe(1);
            expect(resultado.mensaje).toBe('Orden de compra creada correctamente');
            
            // Verifica que se llamó a crearCompra con los datos correctos
            expect(CompraModel.crearCompra).toHaveBeenCalledWith({
                id_proveedor: 1,
                id_usuario: userId,
                id_local: 18,
                fecha: '2024-01-15',
                numero_factura: 'F-001',
                subtotal: 1000,
                iva: 210,
                total: 1210,
                estado: 'pendiente'  // Estado inicial
            });
            
            // Verifica que se llamó a crearDetallesCompra
            expect(CompraModel.crearDetallesCompra).toHaveBeenCalled();
        });

        /**
         * Verifica que si no se proporciona fecha, se usa la fecha actual
         */
        test('debería usar fecha actual si no se proporciona', async () => {
            // ========== ARRANGE ==========
            const dataSinFecha = { ...dataCompra, fecha: undefined };
            CompraModel.crearCompra.mockResolvedValue(1);
            CompraModel.crearDetallesCompra.mockResolvedValue(true);

            // ========== ACT ==========
            await compraService.crearCompra(dataSinFecha, userId);

            // ========== ASSERT ==========
            // Verifica que se llamó con una fecha (cualquier string)
            expect(CompraModel.crearCompra).toHaveBeenCalledWith(
                expect.objectContaining({
                    fecha: expect.any(String)  // Acepta cualquier string como fecha
                })
            );
        });

        /**
         * Verifica que si no se proporciona local, se usa el local 18 por defecto
         */
        test('debería usar id_local por defecto 18 si no se proporciona', async () => {
            // ========== ARRANGE ==========
            const dataSinLocal = { ...dataCompra, id_local: undefined };
            CompraModel.crearCompra.mockResolvedValue(1);
            CompraModel.crearDetallesCompra.mockResolvedValue(true);

            // ========== ACT ==========
            await compraService.crearCompra(dataSinLocal, userId);

            // ========== ASSERT ==========
            // Verifica que se llamó con id_local = 18
            expect(CompraModel.crearCompra).toHaveBeenCalledWith(
                expect.objectContaining({
                    id_local: 18
                })
            );
        });
    });

    // ==========================================
    // 4. PRUEBAS DE confirmarRecepcion
    // ==========================================
    /**
     * Prueba la confirmación de recepción de una orden de compra
     * 
     * Este método:
     * 1. Verifica que la orden exista
     * 2. Verifica que esté en estado 'pendiente'
     * 3. Verifica que tenga un local asociado
     * 4. Actualiza el stock de cada producto
     * 5. Cambia el estado de la orden a 'recibida'
     */
    describe('confirmarRecepcion', () => {
        const id_compra = 1;

        /**
         * CP: Confirmar recepción exitosamente
         * 
         * Verifica el flujo completo de recepción
         */
        test('debería confirmar recepción exitosamente', async () => {
            // ========== ARRANGE ==========
            // Simula una orden pendiente con 2 productos
            const compraMock = {
                id_compra: 1,
                estado: 'pendiente',
                id_local: 18,
                productos: [
                    { id_producto: 1, cantidad: 2 },
                    { id_producto: 2, cantidad: 1 }
                ]
            };
            CompraModel.obtenerCompraPorId.mockResolvedValue(compraMock);
            CompraModel.actualizarStockProducto.mockResolvedValue(true);
            CompraModel.actualizarEstado.mockResolvedValue(true);

            // ========== ACT ==========
            const resultado = await compraService.confirmarRecepcion(id_compra);

            // ========== ASSERT ==========
            // Verifica el mensaje de éxito
            expect(resultado.mensaje).toBe('Compra recibida y stock actualizado correctamente');
            
            // Verifica que se actualizó el stock para cada producto (2 veces)
            expect(CompraModel.actualizarStockProducto).toHaveBeenCalledTimes(2);
            
            // Verifica que se actualizó el estado a 'recibida'
            expect(CompraModel.actualizarEstado).toHaveBeenCalledWith(id_compra, 'recibida');
        });

        /**
         * CP-47: Producto no existe (orden no existe)
         */
        test('debería lanzar error si la compra no existe', async () => {
            // ========== ARRANGE ==========
            CompraModel.obtenerCompraPorId.mockResolvedValue(null);

            // ========== ACT & ASSERT ==========
            await expect(compraService.confirmarRecepcion(999))
                .rejects
                .toThrow('Compra no encontrada');
        });

        /**
         * Verifica que solo se pueden recibir órdenes en estado 'pendiente'
         */
        test('debería lanzar error si la compra no está pendiente', async () => {
            // ========== ARRANGE ==========
            // Simula una orden ya recibida (estado 'recibida')
            const compraMock = { id_compra: 1, estado: 'recibida', id_local: 18 };
            CompraModel.obtenerCompraPorId.mockResolvedValue(compraMock);

            // ========== ACT & ASSERT ==========
            await expect(compraService.confirmarRecepcion(id_compra))
                .rejects
                .toThrow('Solo se pueden recibir compras en estado pendiente');
        });

        /**
         * Verifica que la orden debe tener un local asociado
         */
        test('debería lanzar error si la compra no tiene local asociado', async () => {
            // ========== ARRANGE ==========
            // Simula una orden sin local (id_local = null)
            const compraMock = { id_compra: 1, estado: 'pendiente', id_local: null };
            CompraModel.obtenerCompraPorId.mockResolvedValue(compraMock);

            // ========== ACT & ASSERT ==========
            await expect(compraService.confirmarRecepcion(id_compra))
                .rejects
                .toThrow('La compra no tiene un local asociado');
        });
    });

    // ==========================================
    // 5. PRUEBAS DE listarProductosActivos
    // ==========================================
    /**
     * Prueba el listado de productos activos
     * 
     * Convierte los precios y cantidades de string a number
     */
    describe('listarProductosActivos', () => {
        /**
         * Verifica que retorna la lista de productos con valores convertidos
         */
        test('debería retornar lista de productos activos', async () => {
            // ========== ARRANGE ==========
            // Simula productos con valores como strings
            const productosMock = [
                { id_producto: 1, descripcion: 'Producto A', precio: '1000.00', cantidad: '10' },
                { id_producto: 2, descripcion: 'Producto B', precio: '500.00', cantidad: '5' }
            ];
            CompraModel.listarProductosActivos.mockResolvedValue(productosMock);

            // ========== ACT ==========
            const resultado = await compraService.listarProductosActivos();

            // ========== ASSERT ==========
            // Verifica que retorna 2 productos
            expect(resultado).toHaveLength(2);
            
            // Verifica que los valores se convirtieron a número
            expect(resultado[0].precio).toBe(1000);   // String "1000.00" → Number 1000
            expect(resultado[0].cantidad).toBe(10);   // String "10" → Number 10
        });
    });

    // ==========================================
    // 6. PRUEBAS DE listarProveedoresActivos
    // ==========================================
    /**
     * Prueba el listado de proveedores activos
     * 
     * Útil para selects en el formulario de creación de compras
     */
    describe('listarProveedoresActivos', () => {
        /**
         * Verifica que retorna la lista de proveedores activos
         */
        test('debería retornar lista de proveedores activos', async () => {
            // ========== ARRANGE ==========
            const proveedoresMock = [
                { id_proveedor: 1, nombre: 'Proveedor A' },
                { id_proveedor: 2, nombre: 'Proveedor B' }
            ];
            CompraModel.listarProveedoresActivos.mockResolvedValue(proveedoresMock);

            // ========== ACT ==========
            const resultado = await compraService.listarProveedoresActivos();

            // ========== ASSERT ==========
            expect(resultado).toEqual(proveedoresMock);
            expect(CompraModel.listarProveedoresActivos).toHaveBeenCalled();
        });
    });
});