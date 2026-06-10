// Importa el servicio de proveedores que se va a probar
const ProveedorService = require('../../../services/proveedor.service');

// Importa el modelo de proveedores (será mockeado)
const ProveedorModel = require('../../../models/proveedor.model');

// ========== MOCK DE DEPENDENCIAS ==========
// Mockea el modelo de proveedores para evitar llamadas reales a la base de datos
jest.mock('../../../models/proveedor.model');

/**
 * Suite de pruebas unitarias para ProveedorService
 * 
 * Se prueban los siguientes métodos:
 * 1. crearProveedor - Creación de un nuevo proveedor
 * 2. actualizarProveedor - Actualización de proveedor existente
 * 3. listarProveedores - Listado de todos los proveedores
 * 4. listarActivos - Listado de proveedores activos
 * 5. obtenerProveedorPorId - Búsqueda de proveedor por ID
 * 6. cambiarEstado - Activación/desactivación de proveedor
 * 7. eliminarProveedor - Eliminación física de proveedor
 */
describe('ProveedorService - Pruebas Unitarias', () => {
    // Variable que contendrá la instancia del servicio
    let proveedorService;

    // ========== CONFIGURACIÓN INICIAL ==========
    // Se ejecuta antes de cada prueba para tener un estado limpio
    beforeEach(() => {
        // Asigna la instancia del servicio (es un Singleton)
        proveedorService = ProveedorService;
        
        // Limpia todos los mocks para evitar interferencias entre pruebas
        jest.clearAllMocks();
    });

    // ==========================================
    // 1. PRUEBAS DE crearProveedor
    // ==========================================
    /**
     * Prueba la creación de un nuevo proveedor
     * 
     * Validaciones:
     * - CUIT único (no puede existir otro proveedor con el mismo CUIT)
     * - CUIT opcional (puede crearse sin CUIT)
     */
    describe('crearProveedor', () => {
        // Datos de prueba de un proveedor válido
        const datosProveedor = {
            nombre: 'Distribuidora Ejemplo',
            cuit: '30-12345678-9',
            telefono: '3794123456',
            email: 'proveedor@ejemplo.com',
            direccion: 'Calle 123',
            contacto: 'Juan Perez'
        };

        /**
         * CP-34: Alta proveedor exitoso
         * 
         * Verifica que se puede crear un proveedor cuando el CUIT no existe
         */
        test('debería crear proveedor exitosamente cuando el CUIT no existe', async () => {
            // ========== ARRANGE (Configuración) ==========
            // Mock: No existe proveedor con ese CUIT
            ProveedorModel.findByCuit.mockResolvedValue(null);
            
            // Mock: La creación devuelve ID = 1
            ProveedorModel.crearProveedor.mockResolvedValue(1);

            // ========== ACT (Ejecución) ==========
            const resultado = await proveedorService.crearProveedor(datosProveedor);

            // ========== ASSERT (Verificaciones) ==========
            // Verifica que devuelve el ID correcto
            expect(resultado.id).toBe(1);
            
            // Verifica el mensaje de éxito
            expect(resultado.mensaje).toBe('Proveedor creado correctamente');
            
            // Verifica que se verificó la existencia del CUIT
            expect(ProveedorModel.findByCuit).toHaveBeenCalledWith(datosProveedor.cuit);
            
            // Verifica que se llamó a crear con los datos correctos
            expect(ProveedorModel.crearProveedor).toHaveBeenCalledWith(datosProveedor);
        });

        /**
         * CP-35: Alta con CUIT duplicado
         * 
         * Verifica que NO se puede crear un proveedor si el CUIT ya existe
         */
        test('debería lanzar error si el CUIT ya existe', async () => {
            // ========== ARRANGE ==========
            // Mock: Ya existe un proveedor con ese CUIT
            ProveedorModel.findByCuit.mockResolvedValue({ 
                id: 1, 
                cuit: '30-12345678-9' 
            });

            // ========== ACT & ASSERT ==========
            // Verifica que la promesa es rechazada con el mensaje de error
            await expect(proveedorService.crearProveedor(datosProveedor))
                .rejects
                .toThrow(`Ya existe un proveedor con el CUIT ${datosProveedor.cuit}`);

            // Verifica que NO se llamó a crear (la creación se cancela)
            expect(ProveedorModel.crearProveedor).not.toHaveBeenCalled();
        });

        /**
         * CP: Creación sin CUIT (opcional)
         * 
         * Verifica que se puede crear un proveedor sin proporcionar CUIT
         * En este caso, no se valida la unicidad del CUIT
         */
        test('debería crear proveedor sin CUIT (opcional)', async () => {
            // ========== ARRANGE ==========
            // Datos sin CUIT
            const datosSinCuit = { ...datosProveedor, cuit: undefined };
            
            // Mock: La creación devuelve ID = 2
            ProveedorModel.crearProveedor.mockResolvedValue(2);

            // ========== ACT ==========
            const resultado = await proveedorService.crearProveedor(datosSinCuit);

            // ========== ASSERT ==========
            expect(resultado.id).toBe(2);
            
            // Verifica que NO se verificó la existencia del CUIT (porque no hay CUIT)
            expect(ProveedorModel.findByCuit).not.toHaveBeenCalled();
            
            // Verifica que se llamó a crear con los datos sin CUIT
            expect(ProveedorModel.crearProveedor).toHaveBeenCalledWith(datosSinCuit);
        });
    });

    // ==========================================
    // 2. PRUEBAS DE actualizarProveedor
    // ==========================================
    /**
     * Prueba la actualización de un proveedor existente
     * 
     * Validaciones:
     * - Si se cambia el CUIT, debe ser único (no pertenecer a otro proveedor)
     * - Si no se cambia el CUIT, no se valida
     */
    describe('actualizarProveedor', () => {
        // Datos de prueba actualizados
        const datosActualizados = {
            nombre: 'Nuevo Nombre',
            cuit: '30-87654321-0',
            telefono: '3794999999'
        };

        /**
         * CP-38: Modificar proveedor exitosamente
         * 
         * Verifica que se puede actualizar un proveedor cuando el nuevo CUIT es único
         */
        test('debería actualizar proveedor exitosamente', async () => {
            // ========== ARRANGE ==========
            // Mock: No existe otro proveedor con ese CUIT
            ProveedorModel.findByCuitExcludingId.mockResolvedValue(null);
            
            // Mock: La actualización fue exitosa
            ProveedorModel.actualizarProveedor.mockResolvedValue({ affectedRows: 1 });

            // ========== ACT ==========
            const resultado = await proveedorService.actualizarProveedor(1, datosActualizados);

            // ========== ASSERT ==========
            expect(resultado.mensaje).toBe('Proveedor actualizado correctamente');
            
            // Verifica que se verificó la existencia del CUIT (excluyendo el mismo proveedor)
            expect(ProveedorModel.findByCuitExcludingId).toHaveBeenCalledWith(
                datosActualizados.cuit, 
                1  // ID del proveedor que se está actualizando
            );
            
            // Verifica que se llamó a actualizar con el ID y los datos
            expect(ProveedorModel.actualizarProveedor).toHaveBeenCalledWith(1, datosActualizados);
        });

        /**
         * CP-39: Modificar CUIT a uno existente
         * 
         * Verifica que NO se puede cambiar el CUIT a uno que ya pertenece a otro proveedor
         */
        test('debería lanzar error si el CUIT ya existe en otro proveedor', async () => {
            // ========== ARRANGE ==========
            // Mock: Ya existe otro proveedor (ID 2) con ese CUIT
            ProveedorModel.findByCuitExcludingId.mockResolvedValue({ 
                id: 2, 
                cuit: '30-87654321-0' 
            });

            // ========== ACT & ASSERT ==========
            await expect(proveedorService.actualizarProveedor(1, datosActualizados))
                .rejects
                .toThrow(`Ya existe otro proveedor con el CUIT ${datosActualizados.cuit}`);

            // Verifica que NO se llamó a actualizar
            expect(ProveedorModel.actualizarProveedor).not.toHaveBeenCalled();
        });

        /**
         * CP: Actualización sin cambiar CUIT
         * 
         * Verifica que se puede actualizar sin validar el CUIT si no se envía
         */
        test('debería actualizar sin validar CUIT si no se envía', async () => {
            // ========== ARRANGE ==========
            // Datos sin CUIT (solo se actualiza el nombre)
            const datosSinCuit = { nombre: 'Nuevo Nombre' };
            
            // Mock: La actualización fue exitosa
            ProveedorModel.actualizarProveedor.mockResolvedValue({ affectedRows: 1 });

            // ========== ACT ==========
            const resultado = await proveedorService.actualizarProveedor(1, datosSinCuit);

            // ========== ASSERT ==========
            expect(resultado.mensaje).toBe('Proveedor actualizado correctamente');
            
            // Verifica que NO se verificó la existencia del CUIT
            expect(ProveedorModel.findByCuitExcludingId).not.toHaveBeenCalled();
            
            // Verifica que se llamó a actualizar con los datos (sin CUIT)
            expect(ProveedorModel.actualizarProveedor).toHaveBeenCalledWith(1, datosSinCuit);
        });
    });

    // ==========================================
    // 3. PRUEBAS DE listarProveedores
    // ==========================================
    /**
     * Prueba el listado de todos los proveedores (activos e inactivos)
     */
    describe('listarProveedores', () => {
        /**
         * Verifica que retorna la lista completa de proveedores
         */
        test('debería retornar lista de proveedores', async () => {
            // ========== ARRANGE ==========
            const proveedoresMock = [
                { id_proveedor: 1, nombre: 'Proveedor A', cuit: '30-12345678-9' },
                { id_proveedor: 2, nombre: 'Proveedor B', cuit: '30-87654321-0' }
            ];
            ProveedorModel.listarProveedores.mockResolvedValue(proveedoresMock);

            // ========== ACT ==========
            const resultado = await proveedorService.listarProveedores();

            // ========== ASSERT ==========
            expect(resultado).toEqual(proveedoresMock);
            expect(ProveedorModel.listarProveedores).toHaveBeenCalled();
        });

        /**
         * Verifica que retorna un array vacío cuando no hay proveedores
         */
        test('debería retornar array vacío si no hay proveedores', async () => {
            // ========== ARRANGE ==========
            ProveedorModel.listarProveedores.mockResolvedValue([]);

            // ========== ACT ==========
            const resultado = await proveedorService.listarProveedores();

            // ========== ASSERT ==========
            expect(resultado).toEqual([]);
        });
    });

    // ==========================================
    // 4. PRUEBAS DE listarActivos
    // ==========================================
    /**
     * Prueba el listado de proveedores activos (útiles para selects del frontend)
     */
    describe('listarActivos', () => {
        /**
         * Verifica que retorna solo los proveedores con activo = 'Si'
         */
        test('debería retornar solo proveedores activos', async () => {
            // ========== ARRANGE ==========
            const activosMock = [
                { id_proveedor: 1, nombre: 'Proveedor A', activo: 'Si' }
            ];
            ProveedorModel.listarActivos.mockResolvedValue(activosMock);

            // ========== ACT ==========
            const resultado = await proveedorService.listarActivos();

            // ========== ASSERT ==========
            expect(resultado).toEqual(activosMock);
            expect(ProveedorModel.listarActivos).toHaveBeenCalled();
        });
    });

    // ==========================================
    // 5. PRUEBAS DE obtenerProveedorPorId
    // ==========================================
    /**
     * Prueba la obtención de un proveedor por su ID
     */
    describe('obtenerProveedorPorId', () => {
        /**
         * Verifica que retorna el proveedor cuando existe
         */
        test('debería retornar proveedor cuando existe', async () => {
            // ========== ARRANGE ==========
            const proveedorMock = { 
                id_proveedor: 1, 
                nombre: 'Proveedor A', 
                cuit: '30-12345678-9' 
            };
            ProveedorModel.obtenerProveedorPorId.mockResolvedValue(proveedorMock);

            // ========== ACT ==========
            const resultado = await proveedorService.obtenerProveedorPorId(1);

            // ========== ASSERT ==========
            expect(resultado).toEqual(proveedorMock);
            expect(ProveedorModel.obtenerProveedorPorId).toHaveBeenCalledWith(1);
        });

        /**
         * Verifica que lanza error cuando el proveedor no existe
         */
        test('debería lanzar error si el proveedor no existe', async () => {
            // ========== ARRANGE ==========
            ProveedorModel.obtenerProveedorPorId.mockResolvedValue(null);

            // ========== ACT & ASSERT ==========
            await expect(proveedorService.obtenerProveedorPorId(999))
                .rejects
                .toThrow('Proveedor no encontrado');
        });
    });

    // ==========================================
    // 6. PRUEBAS DE cambiarEstado
    // ==========================================
    /**
     * Prueba el cambio de estado del proveedor (activar/desactivar)
     * 
     * Validación especial: No se puede desactivar un proveedor con compras asociadas
     */
    describe('cambiarEstado', () => {
        /**
         * CP-40: Desactivar proveedor sin compras
         * 
         * Verifica que se puede desactivar un proveedor que no tiene órdenes de compra
         */
        test('debería desactivar proveedor si no tiene compras', async () => {
            // ========== ARRANGE ==========
            // Mock: El proveedor NO tiene compras asociadas
            ProveedorModel.tieneOrdenesCompra.mockResolvedValue(false);
            
            // Mock: Cambio de estado exitoso
            ProveedorModel.cambiarEstado.mockResolvedValue({ affectedRows: 1 });

            // ========== ACT ==========
            const resultado = await proveedorService.cambiarEstado(1, 'No');

            // ========== ASSERT ==========
            expect(resultado).toEqual({ affectedRows: 1 });
            
            // Verifica que se verificó si tiene compras
            expect(ProveedorModel.tieneOrdenesCompra).toHaveBeenCalledWith(1);
            
            // Verifica que se llamó a cambiarEstado
            expect(ProveedorModel.cambiarEstado).toHaveBeenCalledWith(1, 'No');
        });

        /**
         * CP-41: Desactivar proveedor con compras
         * 
         * Verifica que NO se puede desactivar un proveedor que tiene órdenes de compra
         */
        test('debería lanzar error al desactivar proveedor con compras asociadas', async () => {
            // ========== ARRANGE ==========
            // Mock: El proveedor SÍ tiene compras asociadas
            ProveedorModel.tieneOrdenesCompra.mockResolvedValue(true);

            // ========== ACT & ASSERT ==========
            await expect(proveedorService.cambiarEstado(1, 'No'))
                .rejects
                .toThrow('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');

            // Verifica que NO se llamó a cambiarEstado
            expect(ProveedorModel.cambiarEstado).not.toHaveBeenCalled();
        });

        /**
         * CP: Activar proveedor
         * 
         * Verifica que se puede activar un proveedor sin validar compras
         * (la validación solo aplica para desactivación)
         */
        test('debería activar proveedor sin validar compras', async () => {
            // ========== ARRANGE ==========
            // Mock: Cambio de estado exitoso
            ProveedorModel.cambiarEstado.mockResolvedValue({ affectedRows: 1 });

            // ========== ACT ==========
            const resultado = await proveedorService.cambiarEstado(1, 'Si');

            // ========== ASSERT ==========
            expect(resultado).toEqual({ affectedRows: 1 });
            
            // Verifica que NO se verificó si tiene compras (solo se verifica al desactivar)
            expect(ProveedorModel.tieneOrdenesCompra).not.toHaveBeenCalled();
            
            // Verifica que se llamó a cambiarEstado con 'Si'
            expect(ProveedorModel.cambiarEstado).toHaveBeenCalledWith(1, 'Si');
        });
    });

    // ==========================================
    // 7. PRUEBAS DE eliminarProveedor
    // ==========================================
    /**
     * Prueba la eliminación física de un proveedor
     * 
     * NOTA: Este método es de baja física. Para mantener historial,
     * se recomienda usar cambiarEstado() en su lugar.
     */
    describe('eliminarProveedor', () => {
        /**
         * Verifica que se puede eliminar un proveedor que existe
         */
        test('debería eliminar proveedor exitosamente', async () => {
            // ========== ARRANGE ==========
            // Mock: Eliminación afectó 1 fila (exitosa)
            ProveedorModel.eliminarProveedor.mockResolvedValue(1);

            // ========== ACT ==========
            const resultado = await proveedorService.eliminarProveedor(1);

            // ========== ASSERT ==========
            expect(resultado.mensaje).toBe('Proveedor eliminado correctamente');
            expect(ProveedorModel.eliminarProveedor).toHaveBeenCalledWith(1);
        });

        /**
         * Verifica que lanza error si el proveedor no existe
         */
        test('debería lanzar error si el proveedor no existe', async () => {
            // ========== ARRANGE ==========
            // Mock: Eliminación afectó 0 filas (no existía)
            ProveedorModel.eliminarProveedor.mockResolvedValue(0);

            // ========== ACT & ASSERT ==========
            await expect(proveedorService.eliminarProveedor(999))
                .rejects
                .toThrow('Proveedor no encontrado');
        });
    });
});