// Importa el servicio de compras que contiene la lógica de negocio
const CompraService = require('../services/compra.service');

// Importa la función de validación de express-validator para verificar errores en los datos de entrada
const { validationResult } = require('express-validator');

/**
 * Controlador de Compras
 * Maneja todas las peticiones HTTP relacionadas con órdenes de compra, proveedores y productos
 * Es la capa de entrada de la API para el módulo de compras
 */
class CompraController {

    /**
     * Obtiene todas las órdenes de compra del sistema
     * GET /api/compras
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async listarCompras(req, res, next) {
        try {
            // Llama al servicio para obtener la lista de todas las órdenes de compra
            const compras = await CompraService.listarCompras();
            
            // Responde con código 200 OK y el listado de compras en formato JSON
            res.json(compras);
        } catch (error) {
            // Si hay error, lo pasa al middleware de errores (express)
            next(error);
        }
    }

    /**
     * Confirma la recepción de una orden de compra y actualiza el stock
     * PUT /api/compras/:id/confirmar-recepcion
     * 
     * @param {Object} req - Petición HTTP (params contiene el id de la compra)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async confirmarRecepcion(req, res, next) {
        try {
            // Extrae el ID de la compra desde los parámetros de la URL
            const { id } = req.params;
            
            // Llama al servicio para confirmar la recepción y actualizar el stock
            const resultado = await CompraService.confirmarRecepcion(id);
            
            // Responde con el resultado de la operación
            res.json(resultado);
        } catch (error) {
            // Si hay error, lo pasa al middleware
            next(error);
        }
    }

    /**
     * Obtiene una orden de compra por su ID, incluyendo sus productos
     * GET /api/compras/:id
     * 
     * @param {Object} req - Petición HTTP (params contiene el id de la compra)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async obtenerCompraPorId(req, res, next) {
        try {
            // Validación: verifica si hay errores de express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Si hay errores de validación, responde con código 400 Bad Request
                return res.status(400).json({ errores: errors.array() });
            }
            
            // Extrae el ID de la compra desde los parámetros de la URL
            const { id } = req.params;
            
            // Llama al servicio para obtener la compra con sus detalles
            const compra = await CompraService.obtenerCompraPorId(id);
            
            // Responde con los datos de la compra
            res.json(compra);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Crea una nueva orden de compra
     * POST /api/compras
     * 
     * @param {Object} req - Petición HTTP (body contiene los datos de la orden)
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async crearCompra(req, res, next) {
        try {
            // Validación: verifica si hay errores de express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Si hay errores de validación, responde con código 400 Bad Request
                return res.status(400).json({ 
                    mensaje: 'Error de validación',
                    errores: errors.array() 
                });
            }
            
            // Obtiene el ID del usuario autenticado desde el objeto `req.usuario`
            // Este objeto es agregado por el middleware de autenticación
            const userId = req.usuario?.id_usuario;
            
            // Llama al servicio para crear la orden de compra
            // Pasa el body de la petición y el ID del usuario que la crea
            const resultado = await CompraService.crearCompra(req.body, userId);
            
            // Responde con código 201 Created (recurso creado exitosamente)
            res.status(201).json(resultado);
        } catch (error) {
            // Captura errores y responde con código 400 Bad Request
            // Muestra el mensaje de error al cliente
            console.error('Error en crearCompra:', error.message);
            res.status(400).json({ mensaje: error.message });
        }
    }

    /**
     * Obtiene los productos activos para un local específico
     * GET /api/compras/productos-por-local/:id_local
     * 
     * @param {Object} req - Petición HTTP (params contiene id_local)
     * @param {Object} res - Respuesta HTTP
     */
    async getProductosPorLocal(req, res) {
        try {
            // Extrae el ID del local desde los parámetros de la URL
            const { id_local } = req.params;
            
            // Llama al servicio para obtener los productos activos de ese local
            const productos = await CompraService.listarProductosActivos(id_local);
            
            // Responde con el listado de productos
            res.json(productos);
        } catch (error) {
            // Si hay error, responde con código 500 Internal Server Error
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * Obtiene todos los proveedores activos para seleccionar en el formulario de compras
     * GET /api/compras/proveedores-activos
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async listarProveedoresActivos(req, res, next) {
        try {
            // Llama al servicio para obtener la lista de proveedores activos
            const proveedores = await CompraService.listarProveedoresActivos();
            
            // Responde con el listado de proveedores
            res.json(proveedores);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Obtiene todos los productos activos del sistema (sin filtro por local)
     * GET /api/compras/productos-activos
     * 
     * @param {Object} req - Petición HTTP
     * @param {Object} res - Respuesta HTTP
     * @param {Function} next - Middleware para manejo de errores
     */
    async listarProductosActivos(req, res, next) {
        try {
            // Llama al servicio para obtener la lista de productos activos
            const productos = await CompraService.listarProductosActivos();
            
            // Responde con el listado de productos
            res.json(productos);
        } catch (error) {
            next(error);
        }
    }
}

// Exporta una única instancia del controlador (Patrón Singleton)
// Esto asegura que todas las rutas usen la misma instancia
module.exports = new CompraController();