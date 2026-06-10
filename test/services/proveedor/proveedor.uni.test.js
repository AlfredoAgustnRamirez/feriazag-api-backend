const ProveedorService = require('../../../services/proveedor.service');
const ProveedorModel = require('../../../models/proveedor.model');

// Mockear el modelo
jest.mock('../../../models/proveedor.model');

describe('ProveedorService - Pruebas Unitarias', () => {
    let proveedorService;

    beforeEach(() => {
        proveedorService = ProveedorService;
        jest.clearAllMocks();
    });

    // ============================================
    // 1. PRUEBAS DE crearProveedor
    // ============================================
    describe('crearProveedor', () => {
        const datosProveedor = {
            nombre: 'Distribuidora Ejemplo',
            cuit: '30-12345678-9',
            telefono: '3794123456',
            email: 'proveedor@ejemplo.com',
            direccion: 'Calle 123',
            contacto: 'Juan Perez'
        };

        test('debería crear proveedor exitosamente cuando el CUIT no existe', async () => {
            ProveedorModel.findByCuit.mockResolvedValue(null);
            ProveedorModel.crearProveedor.mockResolvedValue(1);

            const resultado = await proveedorService.crearProveedor(datosProveedor);

            expect(resultado.id).toBe(1);
            expect(resultado.mensaje).toBe('Proveedor creado correctamente');
            expect(ProveedorModel.findByCuit).toHaveBeenCalledWith(datosProveedor.cuit);
            expect(ProveedorModel.crearProveedor).toHaveBeenCalledWith(datosProveedor);
        });

        test('debería lanzar error si el CUIT ya existe', async () => {
            ProveedorModel.findByCuit.mockResolvedValue({ id: 1, cuit: '30-12345678-9' });

            await expect(proveedorService.crearProveedor(datosProveedor))
                .rejects
                .toThrow(`Ya existe un proveedor con el CUIT ${datosProveedor.cuit}`);

            expect(ProveedorModel.crearProveedor).not.toHaveBeenCalled();
        });

        test('debería crear proveedor sin CUIT (opcional)', async () => {
            const datosSinCuit = { ...datosProveedor, cuit: undefined };
            ProveedorModel.findByCuit.mockResolvedValue(null);
            ProveedorModel.crearProveedor.mockResolvedValue(2);

            const resultado = await proveedorService.crearProveedor(datosSinCuit);

            expect(resultado.id).toBe(2);
            expect(ProveedorModel.findByCuit).not.toHaveBeenCalled();
            expect(ProveedorModel.crearProveedor).toHaveBeenCalledWith(datosSinCuit);
        });
    });

    // ============================================
    // 2. PRUEBAS DE actualizarProveedor
    // ============================================
    describe('actualizarProveedor', () => {
        const datosActualizados = {
            nombre: 'Nuevo Nombre',
            cuit: '30-87654321-0',
            telefono: '3794999999'
        };

        test('debería actualizar proveedor exitosamente', async () => {
            ProveedorModel.findByCuitExcludingId.mockResolvedValue(null);
            ProveedorModel.actualizarProveedor.mockResolvedValue({ affectedRows: 1 });

            const resultado = await proveedorService.actualizarProveedor(1, datosActualizados);

            expect(resultado.mensaje).toBe('Proveedor actualizado correctamente');
            expect(ProveedorModel.findByCuitExcludingId).toHaveBeenCalledWith(datosActualizados.cuit, 1);
            expect(ProveedorModel.actualizarProveedor).toHaveBeenCalledWith(1, datosActualizados);
        });

        test('debería lanzar error si el CUIT ya existe en otro proveedor', async () => {
            ProveedorModel.findByCuitExcludingId.mockResolvedValue({ id: 2, cuit: '30-87654321-0' });

            await expect(proveedorService.actualizarProveedor(1, datosActualizados))
                .rejects
                .toThrow(`Ya existe otro proveedor con el CUIT ${datosActualizados.cuit}`);

            expect(ProveedorModel.actualizarProveedor).not.toHaveBeenCalled();
        });

        test('debería actualizar sin validar CUIT si no se envía', async () => {
            const datosSinCuit = { nombre: 'Nuevo Nombre' };
            ProveedorModel.actualizarProveedor.mockResolvedValue({ affectedRows: 1 });

            const resultado = await proveedorService.actualizarProveedor(1, datosSinCuit);

            expect(resultado.mensaje).toBe('Proveedor actualizado correctamente');
            expect(ProveedorModel.findByCuitExcludingId).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // 3. PRUEBAS DE listarProveedores
    // ============================================
    describe('listarProveedores', () => {
        test('debería retornar lista de proveedores', async () => {
            const proveedoresMock = [
                { id_proveedor: 1, nombre: 'Proveedor A', cuit: '30-12345678-9' },
                { id_proveedor: 2, nombre: 'Proveedor B', cuit: '30-87654321-0' }
            ];
            ProveedorModel.listarProveedores.mockResolvedValue(proveedoresMock);

            const resultado = await proveedorService.listarProveedores();

            expect(resultado).toEqual(proveedoresMock);
            expect(ProveedorModel.listarProveedores).toHaveBeenCalled();
        });

        test('debería retornar array vacío si no hay proveedores', async () => {
            ProveedorModel.listarProveedores.mockResolvedValue([]);

            const resultado = await proveedorService.listarProveedores();

            expect(resultado).toEqual([]);
        });
    });

    // ============================================
    // 4. PRUEBAS DE listarActivos
    // ============================================
    describe('listarActivos', () => {
        test('debería retornar solo proveedores activos', async () => {
            const activosMock = [
                { id_proveedor: 1, nombre: 'Proveedor A', activo: 'Si' }
            ];
            ProveedorModel.listarActivos.mockResolvedValue(activosMock);

            const resultado = await proveedorService.listarActivos();

            expect(resultado).toEqual(activosMock);
            expect(ProveedorModel.listarActivos).toHaveBeenCalled();
        });
    });

    // ============================================
    // 5. PRUEBAS DE obtenerProveedorPorId
    // ============================================
    describe('obtenerProveedorPorId', () => {
        test('debería retornar proveedor cuando existe', async () => {
            const proveedorMock = { id_proveedor: 1, nombre: 'Proveedor A', cuit: '30-12345678-9' };
            ProveedorModel.obtenerProveedorPorId.mockResolvedValue(proveedorMock);

            const resultado = await proveedorService.obtenerProveedorPorId(1);

            expect(resultado).toEqual(proveedorMock);
            expect(ProveedorModel.obtenerProveedorPorId).toHaveBeenCalledWith(1);
        });

        test('debería lanzar error si el proveedor no existe', async () => {
            ProveedorModel.obtenerProveedorPorId.mockResolvedValue(null);

            await expect(proveedorService.obtenerProveedorPorId(999))
                .rejects
                .toThrow('Proveedor no encontrado');
        });
    });

    // ============================================
    // 6. PRUEBAS DE cambiarEstado
    // ============================================
    describe('cambiarEstado', () => {
        test('debería desactivar proveedor si no tiene compras', async () => {
            ProveedorModel.tieneOrdenesCompra.mockResolvedValue(false);
            ProveedorModel.cambiarEstado.mockResolvedValue({ affectedRows: 1 });

            const resultado = await proveedorService.cambiarEstado(1, 'No');

            expect(resultado).toEqual({ affectedRows: 1 });
            expect(ProveedorModel.tieneOrdenesCompra).toHaveBeenCalledWith(1);
            expect(ProveedorModel.cambiarEstado).toHaveBeenCalledWith(1, 'No');
        });

        test('debería lanzar error al desactivar proveedor con compras asociadas', async () => {
            ProveedorModel.tieneOrdenesCompra.mockResolvedValue(true);

            await expect(proveedorService.cambiarEstado(1, 'No'))
                .rejects
                .toThrow('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');

            expect(ProveedorModel.cambiarEstado).not.toHaveBeenCalled();
        });

        test('debería activar proveedor sin validar compras', async () => {
            ProveedorModel.cambiarEstado.mockResolvedValue({ affectedRows: 1 });

            const resultado = await proveedorService.cambiarEstado(1, 'Si');

            expect(resultado).toEqual({ affectedRows: 1 });
            expect(ProveedorModel.tieneOrdenesCompra).not.toHaveBeenCalled();
            expect(ProveedorModel.cambiarEstado).toHaveBeenCalledWith(1, 'Si');
        });
    });

    // ============================================
    // 7. PRUEBAS DE eliminarProveedor
    // ============================================
    describe('eliminarProveedor', () => {
        test('debería eliminar proveedor exitosamente', async () => {
            ProveedorModel.eliminarProveedor.mockResolvedValue(1);

            const resultado = await proveedorService.eliminarProveedor(1);

            expect(resultado.mensaje).toBe('Proveedor eliminado correctamente');
            expect(ProveedorModel.eliminarProveedor).toHaveBeenCalledWith(1);
        });

        test('debería lanzar error si el proveedor no existe', async () => {
            ProveedorModel.eliminarProveedor.mockResolvedValue(0);

            await expect(proveedorService.eliminarProveedor(999))
                .rejects
                .toThrow('Proveedor no encontrado');
        });
    });
});