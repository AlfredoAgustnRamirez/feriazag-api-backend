// Importa el modelo de proveedores para operaciones de base de datos
const ProveedorModel = require('../models/proveedor.model');

/**
 * Servicio de Proveedores
 * Contiene toda la lógica de negocio relacionada con la gestión de proveedores
 * (alta, baja, modificación, consulta, activación/desactivación)
 * Es la capa intermedia entre el controlador y el modelo
 */
class ProveedorService {

    /**
     * Crea un nuevo proveedor en el sistema
     * 
     * @param {Object} data - Datos del proveedor
     * @param {string} data.nombre - Razón social o nombre del proveedor
     * @param {string} [data.cuit] - CUIT del proveedor (opcional pero recomendado)
     * @param {string} data.telefono - Teléfono de contacto
     * @param {string} [data.email] - Correo electrónico (opcional)
     * @param {string} [data.direccion] - Dirección (opcional)
     * @param {string} [data.contacto] - Persona de contacto (opcional)
     * @returns {Promise<Object>} Resultado con ID y mensaje
     * @throws {Error} Si el CUIT ya existe
     */
    async crearProveedor(data) {
        // Desestructuración de los datos recibidos
        const { cuit, nombre, telefono, email, direccion, contacto } = data;
        
        // ========== VALIDACIÓN DE CUIT ÚNICO ==========
        // Si se proporcionó un CUIT, verificar que no exista ya en la base de datos
        if (cuit) {
            const existente = await ProveedorModel.findByCuit(cuit);
            if (existente) {
                // Si el CUIT ya existe, lanza un error
                throw new Error(`Ya existe un proveedor con el CUIT ${cuit}`);
            }
        }
        
        // ========== CREACIÓN DEL PROVEEDOR ==========
        // Llama al modelo para insertar el nuevo proveedor
        const id = await ProveedorModel.crearProveedor(data);
        
        // Retorna el ID del proveedor creado y un mensaje de éxito
        return { 
            id, 
            mensaje: 'Proveedor creado correctamente' 
        };
    }

    /**
     * Actualiza los datos de un proveedor existente
     * 
     * @param {number} id_proveedor - ID del proveedor a actualizar
     * @param {Object} data - Datos actualizados del proveedor
     * @returns {Promise<Object>} Mensaje de éxito
     * @throws {Error} Si el CUIT ya existe en otro proveedor
     */
    async actualizarProveedor(id_proveedor, data) {
        // Extrae el CUIT de los datos (si viene)
        const { cuit } = data;
        
        // ========== VALIDACIÓN DE CUIT ÚNICO (EXCLUYENDO EL MISMO) ==========
        // Si se proporcionó un CUIT, verificar que no pertenezca a otro proveedor
        if (cuit) {
            // Busca otro proveedor con el mismo CUIT (excluyendo el actual)
            const existente = await ProveedorModel.findByCuitExcludingId(cuit, id_proveedor);
            if (existente) {
                // Si el CUIT ya pertenece a otro proveedor, lanza error
                throw new Error(`Ya existe otro proveedor con el CUIT ${cuit}`);
            }
        }
        
        // ========== ACTUALIZACIÓN DEL PROVEEDOR ==========
        // Llama al modelo para actualizar los datos
        await ProveedorModel.actualizarProveedor(id_proveedor, data);
        
        // Retorna mensaje de éxito
        return { 
            mensaje: 'Proveedor actualizado correctamente' 
        };
    }

    /**
     * Obtiene todos los proveedores del sistema (activos e inactivos)
     * 
     * @returns {Promise<Array>} Lista de todos los proveedores
     */
    async listarProveedores() {
        // Llama al modelo para obtener la lista completa
        return await ProveedorModel.listarProveedores();
    }

    /**
     * Obtiene solo los proveedores activos
     * Útil para selects en el frontend (formularios de compras)
     * 
     * @returns {Promise<Array>} Lista de proveedores activos
     */
    async listarActivos() {
        // Llama al modelo para obtener solo los proveedores con activo = 'Si'
        return await ProveedorModel.listarActivos();
    }

    /**
     * Obtiene un proveedor específico por su ID
     * 
     * @param {number} id_proveedor - ID del proveedor
     * @returns {Promise<Object>} Datos del proveedor
     * @throws {Error} Si el proveedor no existe
     */
    async obtenerProveedorPorId(id_proveedor) {
        // Busca el proveedor por ID en la base de datos
        const proveedor = await ProveedorModel.obtenerProveedorPorId(id_proveedor);
        
        // Si no se encuentra, lanza un error
        if (!proveedor) {
            throw new Error('Proveedor no encontrado');
        }
        
        // Retorna los datos del proveedor
        return proveedor;
    }

    /**
     * Cambia el estado de un proveedor (activar/desactivar)
     * Implementa baja lógica (no elimina físicamente el registro)
     * 
     * @param {number} id_proveedor - ID del proveedor
     * @param {string} activo - Nuevo estado ('Si' activo, 'No' inactivo)
     * @returns {Promise<Object>} Resultado de la operación
     * @throws {Error} Si se intenta desactivar un proveedor con compras asociadas
     */
    async cambiarEstado(id_proveedor, activo) {
        // ========== VALIDACIÓN PARA DESACTIVACIÓN ==========
        // Solo verifica si se está DESACTIVANDO (no al activar)
        if (activo === 'No') {
            // Verifica si el proveedor tiene órdenes de compra asociadas
            const tieneCompras = await ProveedorModel.tieneOrdenesCompra(id_proveedor);
            
            if (tieneCompras) {
                // Si tiene compras, no se puede desactivar (integridad referencial)
                throw new Error('No se puede desactivar el proveedor porque tiene órdenes de compra asociadas');
            }
        }
        
        // ========== CAMBIO DE ESTADO ==========
        // Llama al modelo para cambiar el estado
        const resultado = await ProveedorModel.cambiarEstado(id_proveedor, activo);
        
        // Retorna el resultado de la operación
        return resultado;
    }

    /**
     * Elimina físicamente un proveedor del sistema (baja física)
     * NOTA: Este método es de baja física. Para mantener historial,
     * se recomienda usar cambiarEstado() en su lugar.
     * 
     * @param {number} id_proveedor - ID del proveedor a eliminar
     * @returns {Promise<Object>} Mensaje de éxito
     * @throws {Error} Si el proveedor no existe
     */
    async eliminarProveedor(id_proveedor) {
        // Llama al modelo para eliminar el proveedor
        const affected = await ProveedorModel.eliminarProveedor(id_proveedor);
        
        // Si no se afectó ninguna fila, el proveedor no existe
        if (affected === 0) {
            throw new Error('Proveedor no encontrado');
        }
        
        // Retorna mensaje de éxito
        return { 
            mensaje: 'Proveedor eliminado correctamente' 
        };
    }
}

// Exporta una única instancia del servicio (Patrón Singleton)
module.exports = new ProveedorService();