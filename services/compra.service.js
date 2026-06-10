// Importa el modelo de compras para operaciones de base de datos
const CompraModel = require('../models/compra.model');

/**
 * Servicio de Compras
 * Contiene toda la lógica de negocio relacionada con órdenes de compra
 * (creación, consulta, confirmación de recepción, actualización de stock)
 * Es la capa intermedia entre el controlador y el modelo
 */
class CompraService {

    /**
     * Obtiene todas las órdenes de compra del sistema
     * Convierte los valores numéricos de string a number
     * 
     * @returns {Promise<Array>} Lista de órdenes de compra con números convertidos
     */
    async listarCompras() {
        // Obtiene las compras del modelo (vienen como strings desde la BD)
        const compras = await CompraModel.listarCompras();
        
        // Convierte los valores numéricos de string a number
        return compras.map(compra => ({
            ...compra,
            subtotal: Number(compra.subtotal),   // Convierte a número
            iva: Number(compra.iva),             // Convierte a número
            total: Number(compra.total)          // Convierte a número
        }));
    }

    /**
     * Obtiene una orden de compra específica por su ID, incluyendo sus productos
     * 
     * @param {number} id_compra - ID de la orden de compra
     * @returns {Promise<Object>} Datos de la compra con sus productos
     * @throws {Error} Si la compra no existe
     */
    async obtenerCompraPorId(id_compra) {
        // Busca la compra en la base de datos
        const compra = await CompraModel.obtenerCompraPorId(id_compra);
        
        // Si no existe, lanza error
        if (!compra) {
            throw new Error('Compra no encontrada');
        }
        
        // Retorna la compra con todos sus valores convertidos a número
        return {
            ...compra,
            subtotal: Number(compra.subtotal),
            iva: Number(compra.iva),
            total: Number(compra.total),
            // Convierte también los productos del detalle
            productos: compra.productos.map(p => ({
                ...p,
                precio_compra: Number(p.precio_compra),
                subtotal: Number(p.subtotal)
            }))
        };
    }

    /**
     * Crea una nueva orden de compra
     * 
     * @param {Object} data - Datos de la orden de compra
     * @param {number} data.id_proveedor - ID del proveedor
     * @param {string} [data.numero_factura] - Número de factura (opcional)
     * @param {string} [data.fecha] - Fecha de la orden (default: fecha actual)
     * @param {number} data.subtotal - Subtotal de la orden
     * @param {number} data.iva - IVA (21% del subtotal)
     * @param {number} data.total - Total = subtotal + iva
     * @param {Array} data.detalles - Productos de la orden
     * @param {number} data.id_local - ID del local destino
     * @param {number} userId - ID del usuario que crea la orden
     * @returns {Promise<Object>} ID de la compra y mensaje de éxito
     */
    async crearCompra(data, userId) {
        // Desestructuración de los datos recibidos
        const { id_proveedor, fecha, numero_factura, subtotal, iva, total, detalles, id_local } = data;

        // ========== REGISTRO DE LA CABECERA DE LA ORDEN ==========
        // Crea la orden con estado 'pendiente'
        const id_compra = await CompraModel.crearCompra({
            id_proveedor,
            id_usuario: userId,                      // Usuario autenticado que crea la orden
            id_local: id_local || 18,                // Si no se especifica, usa local 18 por defecto
            fecha: fecha || new Date().toISOString().split('T')[0], // Fecha actual si no se provee
            numero_factura,                          // Puede ser null (se genera automáticamente después)
            subtotal,
            iva,
            total,
            estado: 'pendiente'                      // Estado inicial
        });

        // ========== REGISTRO DE LOS DETALLES DE LA ORDEN ==========
        // Procesa cada producto del detalle
        const detallesConPrecio = detalles.map(d => ({
            id_producto: d.id_producto,
            cantidad: d.cantidad,
            // Prioriza precio_compra, luego precio_costo, luego precio
            precio_compra: d.precio_compra || d.precio_costo || d.precio,
            // Calcula el subtotal del producto
            subtotal: (d.precio_compra || d.precio_costo || d.precio) * d.cantidad
        }));

        // Inserta todos los detalles en la base de datos
        await CompraModel.crearDetallesCompra(id_compra, detallesConPrecio);

        // Retorna el ID de la compra y mensaje de éxito
        return { 
            id_compra, 
            mensaje: 'Orden de compra creada correctamente' 
        };
    }

    /**
     * Confirma la recepción de una orden de compra
     * Actualiza el stock de los productos y cambia el estado de la orden a 'recibida'
     * 
     * @param {number} id_compra - ID de la orden de compra
     * @returns {Promise<Object>} Mensaje de éxito
     * @throws {Error} Si la compra no existe, no está pendiente o no tiene local asociado
     */
    async confirmarRecepcion(id_compra) {
        // ========== VERIFICACIÓN DE LA ORDEN ==========
        // Obtiene la compra completa con sus productos
        const compra = await CompraModel.obtenerCompraPorId(id_compra);

        // Verifica que la compra exista
        if (!compra) {
            throw new Error('Compra no encontrada');
        }

        // Verifica que la compra esté en estado pendiente
        if (compra.estado !== 'pendiente') {
            throw new Error('Solo se pueden recibir compras en estado pendiente');
        }

        // Obtiene el local asociado a la compra
        const id_local = compra.id_local;

        // Verifica que la compra tenga un local asociado
        if (!id_local) {
            throw new Error('La compra no tiene un local asociado');
        }

        // ========== ACTUALIZACIÓN DEL STOCK ==========
        // Itera sobre cada producto de la compra
        for (const detalle of compra.productos) {
            // Actualiza el stock sumando la cantidad comprada al stock actual
            await CompraModel.actualizarStockProducto(
                detalle.id_producto,   // ID del producto
                detalle.cantidad,      // Cantidad a sumar
                id_local               // Local donde se actualiza el stock
            );
        }

        // ========== ACTUALIZACIÓN DEL ESTADO ==========
        // Cambia el estado de la orden a 'recibida'
        await CompraModel.actualizarEstado(id_compra, 'recibida');
        
        // Retorna mensaje de éxito
        return { 
            mensaje: 'Compra recibida y stock actualizado correctamente' 
        };
    }

    /**
     * Lista los productos activos para un local específico
     * 
     * @param {number} id_local - ID del local
     * @returns {Promise<Array>} Lista de productos activos con precios convertidos a número
     */
    async listarProductosActivos(id_local) {
        // Obtiene los productos activos del local
        const productos = await CompraModel.listarProductosActivos(id_local);
        
        // Convierte los valores numéricos de string a number
        return productos.map(p => ({
            ...p,
            precio: Number(p.precio),
            cantidad: Number(p.cantidad)
        }));
    }

    /**
     * Lista todos los proveedores activos
     * Útil para selects en el formulario de creación de compras
     * 
     * @returns {Promise<Array>} Lista de proveedores activos
     */
    async listarProveedoresActivos() {
        // Llama al modelo para obtener los proveedores activos
        return await CompraModel.listarProveedoresActivos();
    }

    /**
     * Lista todos los productos activos del sistema (sin filtro por local)
     * 
     * @returns {Promise<Array>} Lista de productos activos con precios convertidos a número
     */
    async listarProductosActivos() {
        // Obtiene todos los productos activos
        const productos = await CompraModel.listarProductosActivos();
        
        // Convierte los valores numéricos de string a number
        return productos.map(p => ({
            ...p,
            precio: Number(p.precio),
            cantidad: Number(p.cantidad)
        }));
    }
}

// Exporta una única instancia del servicio (Patrón Singleton)
module.exports = new CompraService();