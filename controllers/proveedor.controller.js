// Importa el servicio de proveedores que contiene la lógica de negocio
const ProveedorService = require('../services/proveedor.service');

// Importa la función de validación de express-validator para verificar errores en los datos de entrada
const { validationResult } = require('express-validator');

/**
 * Controlador de Proveedores
 * Maneja todas las peticiones HTTP relacionadas con la gestión de proveedores
 * (alta, baja, modificación, consulta, activación/desactivación)
 * Es la capa de entrada de la API para el módulo de proveedores
 */
class ProveedorController {

    /**
     * Crea un nuevo proveedor en el sistema
     * POST /api/proveedores
     * 
     * @param {Object} req - Petición HTTP (body contiene los datos del proveedor)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async crearProveedor(req, res, next) {
        try {
            // Validación: verifica si hay errores de express-validator
            const errors = validationResult(req);
            
            // Si hay errores de validación, responde con código 400 Bad Request
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            // Llama al servicio para crear el proveedor con los datos del body
            const resultado = await ProveedorService.crearProveedor(req.body);
            
            // Responde con código 201 Created (recurso creado exitosamente)
            res.status(201).json(resultado);
        } catch (error) {
            // Si hay error, lo pasa al middleware de errores (express)
            next(error);
        }
    }

    /**
     * Actualiza los datos de un proveedor existente
     * PUT /api/proveedores/:id_proveedor
     * 
     * @param {Object} req - Petición HTTP (params contiene id, body contiene los datos a actualizar)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async actualizarProveedor(req, res, next) {
        try {
            // Validación: verifica si hay errores de express-validator
            const errors = validationResult(req);
            
            // Si hay errores de validación, responde con código 400 Bad Request
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            // Extrae el ID del proveedor desde los parámetros de la URL
            const { id_proveedor } = req.params;
            
            // Llama al servicio para actualizar el proveedor con el ID y los nuevos datos
            const resultado = await ProveedorService.actualizarProveedor(id_proveedor, req.body);
            
            // Responde con código 200 OK y el resultado
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los proveedores del sistema (activos e inactivos)
     * GET /api/proveedores
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async listarProveedores(req, res, next) {
        try {
            // Llama al servicio para obtener la lista completa de proveedores
            const proveedores = await ProveedorService.listarProveedores();
            
            // Responde con la lista de proveedores en formato JSON
            res.json(proveedores);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene solo los proveedores activos (para usar en selects del frontend)
     * GET /api/proveedores/activos
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async listarProveedoresActivos(req, res, next) {
        try {
            // Llama al servicio para obtener solo los proveedores activos
            const proveedores = await ProveedorService.listarActivos();
            
            // Responde con la lista de proveedores activos
            res.json(proveedores);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene un proveedor específico por su ID
     * GET /api/proveedores/:id_proveedor
     * 
     * @param {Object} req - Petición HTTP (params contiene el id del proveedor)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async obtenerProveedorPorId(req, res, next) {
        try {
            // Validación: verifica si hay errores de express-validator
            const errors = validationResult(req);
            
            // Si hay errores de validación, responde con código 400 Bad Request
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            // Extrae el ID del proveedor desde los parámetros de la URL
            const { id_proveedor } = req.params;
            
            // Llama al servicio para obtener el proveedor por su ID
            const proveedor = await ProveedorService.obtenerProveedorPorId(id_proveedor);
            
            // Responde con los datos del proveedor
            res.json(proveedor);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cambia el estado de un proveedor (activar/desactivar)
     * PATCH /api/proveedores/:id_proveedor/estado
     * 
     * @param {Object} req - Petición HTTP (params contiene id, body contiene { activo: 'Si' o 'No' })
     * @param {Object} res - Respuesta HTTP
     */
    async cambiarEstadoProveedor(req, res) {
        try {
            // Extrae el ID del proveedor desde los parámetros de la URL
            const { id_proveedor } = req.params;
            
            // Extrae el nuevo estado del body de la petición
            const { activo } = req.body;
            
            // Llama al servicio para cambiar el estado del proveedor
            const resultado = await ProveedorService.cambiarEstado(id_proveedor, activo);
            
            // Responde con un mensaje de éxito según la acción
            res.json({
                success: true,
                message: `Proveedor ${activo === 'Si' ? 'activado' : 'desactivado'} correctamente`
            });
        } catch (error) {
            // Si hay error, responde con código 400 Bad Request y el mensaje de error
            res.status(400).json({
                success: false,
                mensaje: error.message 
            });
        }
    }

    /**
     * Elimina físicamente un proveedor del sistema
     * DELETE /api/proveedores/:id_proveedor
     * 
     * @param {Object} req - Petición HTTP (params contiene el id del proveedor)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async eliminarProveedor(req, res, next) {
        try {
            // Validación: verifica si hay errores de express-validator
            const errors = validationResult(req);
            
            // Si hay errores de validación, responde con código 400 Bad Request
            if (!errors.isEmpty()) {
                return res.status(400).json({ errores: errors.array() });
            }
            
            // Extrae el ID del proveedor desde los parámetros de la URL
            const { id_proveedor } = req.params;
            
            // Llama al servicio para eliminar el proveedor
            const resultado = await ProveedorService.eliminarProveedor(id_proveedor);
            
            // Responde con el resultado de la operación
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

// Exporta una única instancia del controlador (Patrón Singleton)
// Esto asegura que todas las rutas usen la misma instancia
module.exports = new ProveedorController();