// ============================================================================
// IMPORTACIONES
// ============================================================================
// Importa las funciones de validación de express-validator
// body: valida campos del cuerpo de la petición (POST, PUT)
// param: valida parámetros de la URL (ej: /:id)
// query: valida parámetros de query string (ej: ?page=1)
// validationResult: extrae los resultados de la validación
const { body, param, query, validationResult } = require('express-validator');

// ============================================================================
// VALIDACIONES DE VENTAS
// ============================================================================

/**
 * Validación para el registro de una nueva venta
 * 
 * Verifica que todos los datos necesarios para crear una venta sean válidos
 * 
 * @type {Array} Array de reglas de validación
 */
const validateRegistroVenta = [
    // ========== DATOS PRINCIPALES ==========
    // total_venta: debe ser un número decimal mayor o igual a 0
    body('total_venta').isFloat({ min: 0 }).withMessage('Total de venta inválido'),
    
    // iduser: debe ser un entero positivo
    body('iduser').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    
    // ========== DETALLES DE PRODUCTOS ==========
    // detalles: debe ser un array con al menos 1 producto
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    
    // Validación de cada producto en el array detalles
    body('detalles.*.id_producto').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('detalles.*.precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('detalles.*.cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida'),
    
    // ========== MEDIOS DE PAGO ==========
    // medios_pago: debe ser un array con al menos 1 medio
    body('medios_pago').isArray({ min: 1 }).withMessage('Debe especificar al menos un medio de pago'),
    
    // Validación de cada medio de pago
    body('medios_pago.*.id_medio_pago').isInt({ min: 1, max: 4 }).withMessage('ID de medio pago inválido'),
    body('medios_pago.*.monto').isFloat({ min: 0 }).withMessage('Monto inválido'),
    
    // ========== DATOS DE LOCAL Y CLIENTE ==========
    body('id_local').isInt({ min: 1 }).withMessage('ID de local inválido'),
    body('id_cliente').optional().isInt({ min: 1 }).withMessage('ID de cliente inválido')
];

/**
 * Validación para reporte por rango de fechas
 * 
 * @type {Array}
 */
const validateReporteRango = [
    query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

// ============================================================================
// VALIDACIONES DE PRODUCTO
// ============================================================================

/**
 * Validación para la creación de un nuevo producto
 * 
 * @type {Array}
 */
const validateProductoCreate = [
    // Código: alfanumérico, entre 1 y 6 caracteres
    body('cod_producto').trim().escape().isLength({ min: 1, max: 6 }).withMessage('Código inválido'),
    
    // Categoría: entero positivo
    body('id_categoria').isInt({ min: 1 }).withMessage('Categoría inválida'),
    
    // Descripción: texto, entre 1 y 100 caracteres
    body('descripcion').trim().escape().isLength({ min: 1, max: 100 }).withMessage('Descripción requerida'),
    
    // Talle: texto, entre 1 y 10 caracteres
    body('talle').trim().escape().isLength({ min: 1, max: 10 }).withMessage('Talle requerido'),
    
    // Precio: numérico
    body('precio').isNumeric().withMessage('Precio inválido'),
    
    // Cantidad: opcional, entero >= 0
    body('cantidad').optional().isInt({ min: 0 }).withMessage('Cantidad inválida'),
    
    // Local: opcional, entero positivo
    body('id_local').optional().isInt({ min: 1 }).withMessage('Local inválido')
];

/**
 * Validación para la actualización de un producto
 * 
 * @type {Array}
 */
const validateProductoUpdate = [
    // ID del producto (en la URL)
    param('id_producto').isInt().withMessage('ID producto inválido'),
    
    // Todos los campos son opcionales en una actualización
    body('cod_producto').optional().trim().escape().isLength({ max: 6 }),
    body('id_categoria').optional().isInt({ min: 1 }),
    body('descripcion').optional().trim().escape().isLength({ max: 100 }),
    body('talle').optional().trim().escape().isLength({ max: 10 }),
    body('precio').optional().isNumeric(),
    body('activo').optional().isIn(['Si', 'No'])
];

/**
 * Validación para ID de producto (parámetro)
 * 
 * @type {Array}
 */
const validateProductoId = [
    param('id_producto').isInt().withMessage('ID producto inválido')
];

/**
 * Validación para transferencia de stock entre sucursales
 * 
 * @type {Array}
 */
const validateStockTransfer = [
    body('id_producto').isInt({ min: 1 }).withMessage('ID producto inválido'),
    body('id_local_origen').isInt({ min: 1 }).withMessage('Local origen inválido'),
    body('id_local_destino').isInt({ min: 1 }).withMessage('Local destino inválido'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad inválida')
];

/**
 * Validación para ID de local
 * 
 * @type {Array}
 */
const validateProductoLocal = [
    param('idLocal').isInt({ min: 1 }).withMessage('ID local inválido')
];

// ============================================================================
// VALIDACIONES DE PROVEEDOR
// ============================================================================

/**
 * Validación para la creación de un proveedor
 * 
 * @type {Array}
 */
const validateProveedorCreate = [
    // Nombre: texto, entre 1 y 100 caracteres
    body('nombre').trim().escape().isLength({ min: 1, max: 100 })
        .withMessage('El nombre del proveedor es requerido'),
    
    // CUIT: opcional, máximo 20 caracteres
    body('cuit').optional().trim().escape().isLength({ max: 20 })
        .withMessage('CUIT inválido'),
    
    // Teléfono: opcional
    body('telefono').optional().trim().escape().isLength({ max: 20 })
        .withMessage('Teléfono inválido'),
    
    // Email: opcional, debe tener formato válido
    body('email').optional().trim().isEmail().withMessage('Email inválido'),
    
    // Dirección: opcional
    body('direccion').optional().trim().escape().isLength({ max: 200 })
        .withMessage('Dirección inválida'),
    
    // Contacto: opcional
    body('contacto').optional().trim().escape().isLength({ max: 100 })
        .withMessage('Contacto inválido')
];

/**
 * Validación para actualización de proveedor
 * 
 * @type {Array}
 */
const validateProveedorUpdate = [
    param('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
    body('nombre').optional().trim().escape().isLength({ min: 1, max: 100 })
        .withMessage('El nombre no puede estar vacío'),
    body('cuit').optional().trim().escape().isLength({ max: 20 }),
    body('telefono').optional().trim().escape().isLength({ max: 20 }),
    body('email').optional().trim().isEmail(),
    body('direccion').optional().trim().escape().isLength({ max: 200 }),
    body('contacto').optional().trim().escape().isLength({ max: 100 }),
    body('activo').optional().isIn(['Si', 'No']).withMessage('Activo debe ser "Si" o "No"')
];

/**
 * Validación para ID de proveedor
 * 
 * @type {Array}
 */
const validateProveedorId = [
    param('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido')
];

/**
 * Validación para cambio de estado de proveedor
 * 
 * @type {Array}
 */
const validateProveedorEstado = [
    param('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado debe ser "Si" o "No"')
];

// ============================================================================
// VALIDACIONES DE VENTA DETALLE
// ============================================================================

/**
 * Validación para ID de cabecera de venta
 * 
 * @type {Array}
 */
const validateIdCabecera = [
    param('idCabecera').isInt({ min: 1 }).withMessage('ID de cabecera inválido')
];

// ============================================================================
// VALIDACIONES DE COMPRA
// ============================================================================

/**
 * Validación para la creación de una orden de compra
 * 
 * @type {Array}
 */
const validateCompraCreate = [
    // Proveedor requerido
    body('id_proveedor').isInt({ min: 1 }).withMessage('El proveedor es requerido'),
    
    // Detalles: array con al menos un producto
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    
    // Validación de cada detalle
    body('detalles.*.id_producto').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad inválida'),
    body('detalles.*.precio_compra').isFloat({ min: 0 }).withMessage('Precio de compra inválido'),
    body('detalles.*.subtotal').isFloat({ min: 0 }).withMessage('Subtotal inválido'),
    
    // Campos de totales (opcionales, se calculan automáticamente)
    body('subtotal').optional().isFloat({ min: 0 }),
    body('iva').optional().isFloat({ min: 0 }),
    body('total').optional().isFloat({ min: 0 }),
    
    // Datos de la orden
    body('numero_factura').optional().isString().isLength({ max: 50 }),
    body('fecha').optional().isDate().withMessage('Fecha inválida')
];

/**
 * Validación para ID de compra
 * 
 * @type {Array}
 */
const validateCompraId = [
    param('id').isInt({ min: 1 }).withMessage('ID de compra inválido')
];

// ============================================================================
// VALIDACIONES DE CLIENTE
// ============================================================================

/**
 * Validación para la creación de un cliente
 * 
 * @type {Array}
 */
const validateClienteCreate = [
    // Nombre/Razón Social: entre 3 y 100 caracteres
    body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 })
        .withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
    
    // DNI/CUIT: formato válido (20-12345678-9 o 12345678)
    body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/)
        .withMessage('DNI/CUIT inválido (formato: 20-12345678-9 o 12345678)'),
    
    // Teléfono: opcional, solo números, 6-15 dígitos
    body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/)
        .withMessage('Teléfono inválido (solo números, 6-15 dígitos)'),
    
    // Email: opcional, formato válido
    body('correo_electronico').optional().isEmail().normalizeEmail()
        .withMessage('Email inválido'),
    
    // Tipo de cliente: 1-4
    body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
    
    // Estado: opcional
    body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
];

/**
 * Validación para actualización de cliente
 * 
 * @type {Array}
 */
const validateClienteUpdate = [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
    body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 })
        .withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
    body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/)
        .withMessage('DNI/CUIT inválido (formato: 20-12345678-9 o 12345678)'),
    body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/)
        .withMessage('Teléfono inválido (solo números, 6-15 dígitos)'),
    body('correo_electronico').optional().isEmail().normalizeEmail()
        .withMessage('Email inválido'),
    body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
    body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
];

/**
 * Validación para ID de cliente
 * 
 * @type {Array}
 */
const validateClienteId = [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
];

/**
 * Validación para cambio de estado de cliente
 * 
 * @type {Array}
 */
const validateClienteEstado = [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
    body('activo').isIn(['SI', 'NO']).withMessage('Estado inválido')
];

/**
 * Validación para búsqueda de cliente
 * 
 * @type {Array}
 */
const validateClienteBusqueda = [
    query('search').optional().trim().escape().isLength({ max: 100 })
        .withMessage('Búsqueda demasiado larga')
];

/**
 * Validación para filtro de estado de cliente
 * 
 * @type {Array}
 */
const validateClienteEstadoQuery = [
    query('estado').optional().isIn(['activos', 'inactivos'])
        .withMessage('Estado inválido')
];

// ============================================================================
// VALIDACIONES DE CATEGORÍA
// ============================================================================

/**
 * Validación para creación de categoría
 * 
 * @type {Array}
 */
const validateCategoriaCreate = [
    body('descripcion').trim().escape().isLength({ min: 3, max: 50 })
        .withMessage('La descripción debe tener entre 3 y 50 caracteres'),
    body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

/**
 * Validación para actualización de categoría
 * 
 * @type {Array}
 */
const validateCategoriaUpdate = [
    param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido'),
    body('descripcion').trim().escape().isLength({ min: 3, max: 50 })
        .withMessage('La descripción debe tener entre 3 y 50 caracteres'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado inválido')
];

/**
 * Validación para ID de categoría
 * 
 * @type {Array}
 */
const validateCategoriaId = [
    param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido')
];

/**
 * Validación para cambio de estado de categoría
 * 
 * @type {Array}
 */
const validateCategoriaEstado = [
    param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado inválido')
];

// ============================================================================
// MIDDLEWARE DE VALIDACIÓN
// ============================================================================

/**
 * Middleware para manejar errores de validación
 * 
 * Se ejecuta después de las reglas de validación.
 * Si hay errores, responde con código 400 y la lista de errores.
 * Si no hay errores, pasa al siguiente middleware/controlador.
 * 
 * @param {Object} req - Petición HTTP
 * @param {Object} res - Respuesta HTTP
 * @param {Function} next - Función para continuar
 * @returns {Object} Respuesta de error si hay validaciones fallidas
 * 
 * @example
 * // Uso en ruta
 * router.post('/productos', 
 *     validateProductoCreate,   // Reglas de validación
 *     handleValidationErrors,    // Middleware de errores
 *     productoController.crear   // Controlador
 * );
 */
const handleValidationErrors = (req, res, next) => {
    // Extrae los errores de validación
    const errors = validationResult(req);
    
    // Si hay errores, responde con código 400
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    
    // Si no hay errores, continúa
    next();
};

// ============================================================================
// VALIDACIONES DE REPORTES
// ============================================================================

/**
 * Validación para reporte con fechas obligatorias
 * 
 * @type {Array}
 */
const validateReporteFechas = [
    query('inicio').isISO8601().withMessage('Fecha inicio inválida'),
    query('fin').isISO8601().withMessage('Fecha fin inválida')
];

/**
 * Validación para reporte con fechas opcionales
 * 
 * @type {Array}
 */
const validateReporteFechasOpcional = [
    query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

/**
 * Validación para ID de local en reportes
 * 
 * @type {Array}
 */
const validateReporteIdLocal = [
    query('idLocal').optional().isInt({ min: 1 }).withMessage('ID local inválido')
];

/**
 * Validación para límite de resultados
 * 
 * @type {Array}
 */
const validateReporteLimit = [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
];

const validateReporteLimite = [
    query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
];

// ============================================================================
// VALIDACIONES DE USUARIO
// ============================================================================

/**
 * Validación para login de usuario
 * 
 * @type {Array}
 */
const validateLogin = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Contraseña requerida')
];

/**
 * Validación para creación de usuario
 * 
 * @type {Array}
 */
const validateUsuarioCreate = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('nombre').trim().escape().isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener 2-50 caracteres'),
    body('apellido').trim().escape().isLength({ min: 2, max: 50 })
        .withMessage('Apellido debe tener 2-50 caracteres'),
    body('usuario').trim().escape().isLength({ min: 3, max: 20 })
        .withMessage('Usuario debe tener 3-20 caracteres'),
    body('password').isLength({ min: 4 }).withMessage('Contraseña debe tener al menos 4 caracteres'),
    body('id_perfil').isInt({ min: 1 }).withMessage('Perfil inválido'),
    body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

/**
 * Validación para actualización de usuario
 * 
 * @type {Array}
 */
const validateUsuarioUpdate = [
    param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('nombre').optional().trim().escape().isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener 2-50 caracteres'),
    body('apellido').optional().trim().escape().isLength({ min: 2, max: 50 })
        .withMessage('Apellido debe tener 2-50 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('usuario').optional().trim().escape().isLength({ min: 3, max: 20 })
        .withMessage('Usuario debe tener 3-20 caracteres'),
    body('id_perfil').optional().isInt({ min: 1 }).withMessage('Perfil inválido'),
    body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

/**
 * Validación para ID de usuario
 * 
 * @type {Array}
 */
const validateUsuarioId = [
    param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

/**
 * Validación para cambio de estado de usuario
 * 
 * @type {Array}
 */
const validateUsuarioEstado = [
    param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado debe ser "Si" o "No"')
];

/**
 * Validación para cambio de contraseña
 * 
 * @type {Array}
 */
const validateCambioPassword = [
    param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('passwordActual').notEmpty().withMessage('Contraseña actual requerida'),
    body('passwordNueva').isLength({ min: 4 })
        .withMessage('Nueva contraseña debe tener al menos 4 caracteres')
];

// ============================================================================
// VALIDACIONES DE BITÁCORA
// ============================================================================

/**
 * Validación para registro en bitácora
 * 
 * @type {Array}
 */
const validateBitacoraRegister = [
    body('accion').notEmpty().withMessage('La acción es requerida'),
    body('entidad').notEmpty().withMessage('La entidad es requerida'),
    body('id_usuario').optional().isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('nombre_usuario').optional().isString().isLength({ max: 100 }),
    body('id_registro').optional().isInt({ min: 1 }).withMessage('ID de registro inválido'),
    body('ip_address').optional().isString(),
    body('user_agent').optional().isString()
];

/**
 * Validación para filtros de bitácora
 * 
 * @type {Array}
 */
const validateBitacoraFiltros = [
    query('accion').optional().isString().isLength({ max: 50 }),
    query('entidad').optional().isString().isLength({ max: 50 }),
    query('usuario').optional().isString().isLength({ max: 100 }),
    query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

/**
 * Validación para bitácora por usuario
 * 
 * @type {Array}
 */
const validateBitacoraUsuario = [
    param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

/**
 * Validación para bitácora por entidad y registro
 * 
 * @type {Array}
 */
const validateBitacoraEntidad = [
    param('entidad').isString().notEmpty().withMessage('Entidad requerida'),
    param('id_registro').isInt({ min: 1 }).withMessage('ID de registro inválido')
];

// ============================================================================
// VALIDACIONES DE DASHBOARD
// ============================================================================

/**
 * Validación para ID de local en dashboard
 * 
 * @type {Array}
 */
const validateDashboardIdLocal = [
    query('idLocal').optional().isInt({ min: 1 }).withMessage('ID local inválido')
];

/**
 * Validación para período en dashboard
 * 
 * @type {Array}
 */
const validateDashboardPeriodo = [
    query('periodo').optional().isIn(['semana', 'mes', 'anio'])
        .withMessage('Período inválido'),
    query('idLocal').optional().isInt({ min: 1 })
];

/**
 * Validación para límite en dashboard
 * 
 * @type {Array}
 */
const validateDashboardLimit = [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite inválido')
];

// ============================================================================
// EXPORTACIÓN
// ============================================================================

module.exports = {
    // Ventas
    validateRegistroVenta,
    
    // Productos
    validateProductoCreate,
    validateProductoUpdate,
    validateProductoId,
    validateStockTransfer,
    validateProductoLocal,
    
    // Proveedores
    validateProveedorCreate,
    validateProveedorUpdate,
    validateProveedorId,
    validateProveedorEstado,
    
    // VentaDetalle
    validateIdCabecera,
    validateReporteRango,
    
    // Compra
    validateCompraCreate,
    validateCompraId,
    
    // Cliente
    validateClienteCreate,
    validateClienteUpdate,
    validateClienteId,
    validateClienteEstado,
    validateClienteBusqueda,
    validateClienteEstadoQuery,
    
    // Categoria
    validateCategoriaCreate,
    validateCategoriaUpdate,
    validateCategoriaId,
    validateCategoriaEstado,
    
    // Reportes
    validateReporteFechas,
    validateReporteFechasOpcional,
    validateReporteIdLocal,
    validateReporteLimit,
    validateReporteLimite,
    
    // Usuario
    validateLogin,
    validateUsuarioCreate,
    validateUsuarioUpdate,
    validateUsuarioId,
    validateUsuarioEstado,
    validateCambioPassword,
    
    // Bitácora
    validateBitacoraRegister,
    validateBitacoraFiltros,
    validateBitacoraUsuario,
    validateBitacoraEntidad,
    
    // Dashboard
    validateDashboardIdLocal,
    validateDashboardPeriodo,
    validateDashboardLimit,
    
    // Middleware
    handleValidationErrors
};