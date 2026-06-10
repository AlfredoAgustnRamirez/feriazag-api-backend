// test/services/compra/compra.service.test.js

const CompraService = require('../../../services/compra.service');
const CompraModel = require('../../../models/compra.model');

// Mockear el modelo
jest.mock('../../../models/compra.model');

describe('CompraService - Pruebas Unitarias', () => {
    let compraService;

    beforeEach(() => {
        compraService = CompraService;
        jest.clearAllMocks();
    });

    // ============================================
    // 1. PRUEBAS DE listarCompras
    // ============================================
    describe('listarCompras', () => {
        test('debería retornar lista de compras con números convertidos', async () => {
            const comprasMock = [
                { id_compra: 1, subtotal: '1000.00', iva: '210.00', total: '1210.00' },
                { id_compra: 2, subtotal: '2000.00', iva: '420.00', total: '2420.00' }
            ];
            CompraModel.listarCompras.mockResolvedValue(comprasMock);

            const resultado = await compraService.listarCompras();

            expect(resultado).toHaveLength(2);
            expect(resultado[0].subtotal).toBe(1000);
            expect(resultado[0].iva).toBe(210);
            expect(resultado[0].total).toBe(1210);
            expect(CompraModel.listarCompras).toHaveBeenCalled();
        });

        test('debería retornar array vacío si no hay compras', async () => {
            CompraModel.listarCompras.mockResolvedValue([]);

            const resultado = await compraService.listarCompras();

            expect(resultado).toEqual([]);
        });
    });

    // ============================================
    // 2. PRUEBAS DE obtenerCompraPorId
    // ============================================
    describe('obtenerCompraPorId', () => {
        test('debería retornar compra cuando existe', async () => {
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

            const resultado = await compraService.obtenerCompraPorId(1);

            expect(resultado.id_compra).toBe(1);
            expect(resultado.subtotal).toBe(1000);
            expect(resultado.productos).toHaveLength(2);
            expect(CompraModel.obtenerCompraPorId).toHaveBeenCalledWith(1);
        });

        test('debería lanzar error si la compra no existe', async () => {
            CompraModel.obtenerCompraPorId.mockResolvedValue(null);

            await expect(compraService.obtenerCompraPorId(999))
                .rejects
                .toThrow('Compra no encontrada');
        });
    });

    // ============================================
    // 3. PRUEBAS DE crearCompra
    // ============================================
    describe('crearCompra', () => {
        const userId = 1;
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

        test('debería crear compra exitosamente', async () => {
            CompraModel.crearCompra.mockResolvedValue(1);
            CompraModel.crearDetallesCompra.mockResolvedValue(true);

            const resultado = await compraService.crearCompra(dataCompra, userId);

            expect(resultado.id_compra).toBe(1);
            expect(resultado.mensaje).toBe('Orden de compra creada correctamente');
            expect(CompraModel.crearCompra).toHaveBeenCalledWith({
                id_proveedor: 1,
                id_usuario: userId,
                id_local: 18,
                fecha: '2024-01-15',
                numero_factura: 'F-001',
                subtotal: 1000,
                iva: 210,
                total: 1210,
                estado: 'pendiente'
            });
            expect(CompraModel.crearDetallesCompra).toHaveBeenCalled();
        });

        test('debería usar fecha actual si no se proporciona', async () => {
            const dataSinFecha = { ...dataCompra, fecha: undefined };
            CompraModel.crearCompra.mockResolvedValue(1);
            CompraModel.crearDetallesCompra.mockResolvedValue(true);

            await compraService.crearCompra(dataSinFecha, userId);

            expect(CompraModel.crearCompra).toHaveBeenCalledWith(
                expect.objectContaining({
                    fecha: expect.any(String)
                })
            );
        });

        test('debería usar id_local por defecto 18 si no se proporciona', async () => {
            const dataSinLocal = { ...dataCompra, id_local: undefined };
            CompraModel.crearCompra.mockResolvedValue(1);
            CompraModel.crearDetallesCompra.mockResolvedValue(true);

            await compraService.crearCompra(dataSinLocal, userId);

            expect(CompraModel.crearCompra).toHaveBeenCalledWith(
                expect.objectContaining({
                    id_local: 18
                })
            );
        });
    });

    // ============================================
    // 4. PRUEBAS DE confirmarRecepcion
    // ============================================
    describe('confirmarRecepcion', () => {
        const id_compra = 1;

        test('debería confirmar recepción exitosamente', async () => {
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

            const resultado = await compraService.confirmarRecepcion(id_compra);

            expect(resultado.mensaje).toBe('Compra recibida y stock actualizado correctamente');
            expect(CompraModel.actualizarStockProducto).toHaveBeenCalledTimes(2);
            expect(CompraModel.actualizarEstado).toHaveBeenCalledWith(id_compra, 'recibida');
        });

        test('debería lanzar error si la compra no existe', async () => {
            CompraModel.obtenerCompraPorId.mockResolvedValue(null);

            await expect(compraService.confirmarRecepcion(999))
                .rejects
                .toThrow('Compra no encontrada');
        });

        test('debería lanzar error si la compra no está pendiente', async () => {
            const compraMock = { id_compra: 1, estado: 'recibida', id_local: 18 };
            CompraModel.obtenerCompraPorId.mockResolvedValue(compraMock);

            await expect(compraService.confirmarRecepcion(id_compra))
                .rejects
                .toThrow('Solo se pueden recibir compras en estado pendiente');
        });

        test('debería lanzar error si la compra no tiene local asociado', async () => {
            const compraMock = { id_compra: 1, estado: 'pendiente', id_local: null };
            CompraModel.obtenerCompraPorId.mockResolvedValue(compraMock);

            await expect(compraService.confirmarRecepcion(id_compra))
                .rejects
                .toThrow('La compra no tiene un local asociado');
        });
    });

    // ============================================
    // 5. PRUEBAS DE listarProductosActivos
    // ============================================
    describe('listarProductosActivos', () => {
        test('debería retornar lista de productos activos', async () => {
            const productosMock = [
                { id_producto: 1, descripcion: 'Producto A', precio: '1000.00', cantidad: '10' },
                { id_producto: 2, descripcion: 'Producto B', precio: '500.00', cantidad: '5' }
            ];
            CompraModel.listarProductosActivos.mockResolvedValue(productosMock);

            const resultado = await compraService.listarProductosActivos();

            expect(resultado).toHaveLength(2);
            expect(resultado[0].precio).toBe(1000);
            expect(resultado[0].cantidad).toBe(10);
        });
    });

    // ============================================
    // 6. PRUEBAS DE listarProveedoresActivos
    // ============================================
    describe('listarProveedoresActivos', () => {
        test('debería retornar lista de proveedores activos', async () => {
            const proveedoresMock = [
                { id_proveedor: 1, nombre: 'Proveedor A' },
                { id_proveedor: 2, nombre: 'Proveedor B' }
            ];
            CompraModel.listarProveedoresActivos.mockResolvedValue(proveedoresMock);

            const resultado = await compraService.listarProveedoresActivos();

            expect(resultado).toEqual(proveedoresMock);
            expect(CompraModel.listarProveedoresActivos).toHaveBeenCalled();
        });
    });
});