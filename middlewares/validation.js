const { body, param, query, validationResult } = require('express-validator');

// ============ VALIDACIONES DE VENTAS ============

const validateRegistroVenta = [
    body('total_venta').isFloat({ min: 0 }).withMessage('Total de venta inválido'),
    body('iduser').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('detalles.*.id_producto').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('detalles.*.precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
    body('detalles.*.cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad inválida'),
    body('medios_pago').isArray({ min: 1 }).withMessage('Debe especificar al menos un medio de pago'),
    body('medios_pago.*.id_medio_pago').isInt({ min: 1, max: 4 }).withMessage('ID de medio pago inválido'),
    body('medios_pago.*.monto').isFloat({ min: 0 }).withMessage('Monto inválido'),
    body('id_local').isInt({ min: 1 }).withMessage('ID de local inválido'),
    body('id_cliente').optional().isInt({ min: 1 }).withMessage('ID de cliente inválido')
];

const validateReporteRango = [
    query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

// ============ VALIDACIONES DE PRODUCTO ============

const validateProductoCreate = [
    body('cod_producto').trim().escape().isLength({ min: 1, max: 6 }).withMessage('Código inválido'),
    body('id_categoria').isInt({ min: 1 }).withMessage('Categoría inválida'),
    body('descripcion').trim().escape().isLength({ min: 1, max: 100 }).withMessage('Descripción requerida'),
    body('talle').trim().escape().isLength({ min: 1, max: 10 }).withMessage('Talle requerido'),
    body('precio').isNumeric().withMessage('Precio inválido'),
    body('cantidad').optional().isInt({ min: 0 }).withMessage('Cantidad inválida'),
    body('id_local').optional().isInt({ min: 1 }).withMessage('Local inválido')
];

const validateProductoUpdate = [
    param('id_producto').isInt().withMessage('ID producto inválido'),
    body('cod_producto').optional().trim().escape().isLength({ max: 6 }),
    body('id_categoria').optional().isInt({ min: 1 }),
    body('descripcion').optional().trim().escape().isLength({ max: 100 }),
    body('talle').optional().trim().escape().isLength({ max: 10 }),
    body('precio').optional().isNumeric(),
    body('activo').optional().isIn(['Si', 'No'])
];

const validateProductoId = [
    param('id_producto').isInt().withMessage('ID producto inválido')
];

const validateStockTransfer = [
    body('id_producto').isInt({ min: 1 }).withMessage('ID producto inválido'),
    body('id_local_origen').isInt({ min: 1 }).withMessage('Local origen inválido'),
    body('id_local_destino').isInt({ min: 1 }).withMessage('Local destino inválido'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad inválida')
];

const validateProductoLocal = [
    param('idLocal').isInt({ min: 1 }).withMessage('ID local inválido')
];

// ============ VALIDACIONES DE PROVEEDOR ============

const validateProveedorCreate = [
    body('nombre').trim().escape().isLength({ min: 1, max: 100 }).withMessage('El nombre del proveedor es requerido'),
    body('cuit').optional().trim().escape().isLength({ max: 20 }).withMessage('CUIT inválido'),
    body('telefono').optional().trim().escape().isLength({ max: 20 }).withMessage('Teléfono inválido'),
    body('email').optional().trim().isEmail().withMessage('Email inválido'),
    body('direccion').optional().trim().escape().isLength({ max: 200 }).withMessage('Dirección inválida'),
    body('contacto').optional().trim().escape().isLength({ max: 100 }).withMessage('Contacto inválido')
];

const validateProveedorUpdate = [
    param('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
    body('nombre').optional().trim().escape().isLength({ min: 1, max: 100 }).withMessage('El nombre no puede estar vacío'),
    body('cuit').optional().trim().escape().isLength({ max: 20 }),
    body('telefono').optional().trim().escape().isLength({ max: 20 }),
    body('email').optional().trim().isEmail(),
    body('direccion').optional().trim().escape().isLength({ max: 200 }),
    body('contacto').optional().trim().escape().isLength({ max: 100 }),
    body('activo').optional().isIn(['Si', 'No']).withMessage('Activo debe ser "Si" o "No"')
];

const validateProveedorId = [
    param('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido')
];

const validateProveedorEstado = [
    param('id_proveedor').isInt({ min: 1 }).withMessage('ID de proveedor inválido'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado debe ser "Si" o "No"')
];

// ============ VENTADETALLE ============
const validateIdCabecera = [
    param('idCabecera').isInt({ min: 1 }).withMessage('ID de cabecera inválido')
];

// ============ VALIDACIONES DE COMPRA ============

const validateCompraCreate = [
    body('id_proveedor').isInt({ min: 1 }).withMessage('El proveedor es requerido'),
    body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('detalles.*.id_producto').isInt({ min: 1 }).withMessage('ID de producto inválido'),
    body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad inválida'),
    body('detalles.*.precio_compra').isFloat({ min: 0 }).withMessage('Precio de compra inválido'),
    body('detalles.*.subtotal').isFloat({ min: 0 }).withMessage('Subtotal inválido'),
    body('subtotal').optional().isFloat({ min: 0 }),
    body('iva').optional().isFloat({ min: 0 }),
    body('total').optional().isFloat({ min: 0 }),
    body('numero_factura').optional().isString().isLength({ max: 50 }),
    body('fecha').optional().isDate().withMessage('Fecha inválida')
];

const validateCompraId = [
    param('id').isInt({ min: 1 }).withMessage('ID de compra inválido')
];

// ============ VALIDACIONES DE CLIENTE ============

const validateClienteCreate = [
    body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
    body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/).withMessage('DNI/CUIT inválido (formato: 20-12345678-9 o 12345678)'),
    body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/).withMessage('Teléfono inválido (solo números, 6-15 dígitos)'),
    body('correo_electronico').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
    body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
];

const validateClienteUpdate = [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
    body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
    body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/).withMessage('DNI/CUIT inválido (formato: 20-12345678-9 o 12345678)'),
    body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/).withMessage('Teléfono inválido (solo números, 6-15 dígitos)'),
    body('correo_electronico').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
    body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
];

const validateClienteId = [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
];

const validateClienteEstado = [
    param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
    body('activo').isIn(['SI', 'NO']).withMessage('Estado inválido')
];

const validateClienteBusqueda = [
    query('search').optional().trim().escape().isLength({ max: 100 }).withMessage('Búsqueda demasiado larga')
];

const validateClienteEstadoQuery = [
    query('estado').optional().isIn(['activos', 'inactivos']).withMessage('Estado inválido')
];

// ============ VALIDACIONES DE CATEGORIA ============

const validateCategoriaCreate = [
    body('descripcion').trim().escape().isLength({ min: 3, max: 50 }).withMessage('La descripción debe tener entre 3 y 50 caracteres'),
    body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

const validateCategoriaUpdate = [
    param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido'),
    body('descripcion').trim().escape().isLength({ min: 3, max: 50 }).withMessage('La descripción debe tener entre 3 y 50 caracteres'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado inválido')
];

const validateCategoriaId = [
    param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido')
];

const validateCategoriaEstado = [
    param('id_categoria').isInt({ min: 1 }).withMessage('ID categoría inválido'),
    body('activo').isIn(['Si', 'No']).withMessage('Estado inválido')
];

// ============ MIDDLEWARE ============

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }
    next();
};

// ============ VALIDACIONES DE REPORTES ============

const validateReporteFechas = [
  query('inicio').isISO8601().withMessage('Fecha inicio inválida'),
  query('fin').isISO8601().withMessage('Fecha fin inválida')
];

const validateReporteFechasOpcional = [
  query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
  query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

const validateReporteIdLocal = [
  query('idLocal').optional().isInt({ min: 1 }).withMessage('ID local inválido')
];

const validateReporteLimit = [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
];

const validateReporteLimite = [
  query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
];

// ============ VALIDACIONES DE USUARIO ============

const validateLogin = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida')
];

const validateUsuarioCreate = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('nombre').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener 2-50 caracteres'),
  body('apellido').trim().escape().isLength({ min: 2, max: 50 }).withMessage('Apellido debe tener 2-50 caracteres'),
  body('usuario').trim().escape().isLength({ min: 3, max: 20 }).withMessage('Usuario debe tener 3-20 caracteres'),
  body('password').isLength({ min: 4 }).withMessage('Contraseña debe tener al menos 4 caracteres'),
  body('id_perfil').isInt({ min: 1 }).withMessage('Perfil inválido'),
  body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

const validateUsuarioUpdate = [
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('nombre').optional().trim().escape().isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener 2-50 caracteres'),
  body('apellido').optional().trim().escape().isLength({ min: 2, max: 50 }).withMessage('Apellido debe tener 2-50 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('usuario').optional().trim().escape().isLength({ min: 3, max: 20 }).withMessage('Usuario debe tener 3-20 caracteres'),
  body('id_perfil').optional().isInt({ min: 1 }).withMessage('Perfil inválido'),
  body('activo').optional().isIn(['Si', 'No']).withMessage('Estado inválido')
];

const validateUsuarioId = [
  param('id').isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

const validateUsuarioEstado = [
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('activo').isIn(['Si', 'No']).withMessage('Estado debe ser "Si" o "No"')
];

const validateCambioPassword = [
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('passwordActual').notEmpty().withMessage('Contraseña actual requerida'),
  body('passwordNueva').isLength({ min: 4 }).withMessage('Nueva contraseña debe tener al menos 4 caracteres')
];

// ============ VALIDACIONES DE BITÁCORA ============

const validateBitacoraRegister = [
  body('accion').notEmpty().withMessage('La acción es requerida'),
  body('entidad').notEmpty().withMessage('La entidad es requerida'),
  body('id_usuario').optional().isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('nombre_usuario').optional().isString().isLength({ max: 100 }),
  body('id_registro').optional().isInt({ min: 1 }).withMessage('ID de registro inválido'),
  body('ip_address').optional().isString(),
  body('user_agent').optional().isString()
];

const validateBitacoraFiltros = [
  query('accion').optional().isString().isLength({ max: 50 }),
  query('entidad').optional().isString().isLength({ max: 50 }),
  query('usuario').optional().isString().isLength({ max: 100 }),
  query('inicio').optional().isISO8601().withMessage('Fecha inicio inválida'),
  query('fin').optional().isISO8601().withMessage('Fecha fin inválida')
];

const validateBitacoraUsuario = [
  param('id_usuario').isInt({ min: 1 }).withMessage('ID de usuario inválido')
];

const validateBitacoraEntidad = [
  param('entidad').isString().notEmpty().withMessage('Entidad requerida'),
  param('id_registro').isInt({ min: 1 }).withMessage('ID de registro inválido')
];

// ============ VALIDACIONES DE DASHBOARD ============

const validateDashboardIdLocal = [
  query('idLocal').optional().isInt({ min: 1 }).withMessage('ID local inválido')
];

const validateDashboardPeriodo = [
  query('periodo').optional().isIn(['semana', 'mes', 'anio']).withMessage('Período inválido'),
  query('idLocal').optional().isInt({ min: 1 })
];

const validateDashboardLimit = [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite inválido')
];

// ============ EXPORTAR ============

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