// Importa el modelo de ventas para operaciones de base de datos
const VentaModel = require('../models/venta.model');

// Importa utilidades auxiliares (formateo, validaciones, etc.)
const Helpers = require('../utils/helpers');

// Importa el manager de pagos (para obtener estrategias de pago)
const paymentManager = require('../managers/paymentManager');

// Importa la fábrica de estrategias de pago (Patrón Strategy)
const PagoFactory = require('../strategies/pagoFactory');

/**
 * Servicio de Ventas
 * Contiene toda la lógica de negocio relacionada con ventas, productos, pagos y caja.
 * Es la capa intermedia entre el controlador y el modelo.
 * Implementa el patrón Service Layer.
 */
class VentaService {

    /**
     * Obtiene todos los productos disponibles para la venta
     * @returns {Promise<Array>} Lista de productos
     */
    async listarProductos() {
        // Llama al modelo para obtener los productos
        return await VentaModel.listarProductos();
    }

    /**
     * Registra una nueva venta en el sistema
     * Esta es la función principal del servicio de ventas
     * 
     * @param {Object} data - Datos de la venta
     * @param {number} data.iduser - ID del usuario vendedor
     * @param {number} data.id_local - ID de la sucursal
     * @param {number} data.id_cliente - ID del cliente (opcional)
     * @param {number} data.total_venta - Total de la venta (con recargo)
     * @param {Array} data.detalles - Productos vendidos
     * @param {Array} data.medios_pago - Medios de pago utilizados
     * @returns {Promise<Object>} Resultado de la operación
     */
    async registrarVenta(data) {
        // Desestructuración de los datos recibidos
        const { total_venta, iduser, detalles, medios_pago, id_local, id_cliente } = data;

        // ========== VALIDACIÓN DE CAJA ABIERTA ==========
        // Verifica que haya una caja abierta para el usuario y local
        const cajaAbierta = await this.verificarCajaAbierta(iduser, id_local);
        if (!cajaAbierta) {
            throw new Error('Debe abrir la caja antes de realizar una venta');
        }

        // ========== VALIDACIÓN DEL CARRITO ==========
        // Verifica que haya al menos un producto en la venta
        if (!detalles || detalles.length === 0) {
            throw new Error('Debe incluir al menos un producto');
        }

        // ========== CÁLCULO DEL SUBTOTAL ==========
        // Calcula el subtotal sumando (precio × cantidad) de cada producto
        // Aplica descuentos individuales si existen
        let subtotal = 0;
        for (const detalle of detalles) {
            // Convierte el descuento de porcentaje a decimal (ej: 10% → 0.10)
            const descuento = (detalle.descuento || 0) / 100;
            // Aplica el descuento al precio unitario
            const precioUnitario = detalle.precio * (1 - descuento);
            // Acumula el subtotal
            subtotal += precioUnitario * detalle.cantidad;
        }

        // ========== CÁLCULO DEL RECARGO POR MEDIO DE PAGO ==========
        // Obtiene el primer medio de pago como principal
        const medioPrincipal = medios_pago[0];
        let totalConRecargo = Number(total_venta);
        let recargoMonto = 0;
        let recargoPorcentaje = 0;

        // Si el medio de pago NO es efectivo (id !== 1), aplica recargo
        if (medioPrincipal && medioPrincipal.id_medio_pago !== 1) {
            // Usa el patrón Strategy para calcular el recargo
            const resultado = await this.calcularTotalConRecargo(subtotal, medioPrincipal.id_medio_pago);
            totalConRecargo = resultado.total;
            recargoMonto = totalConRecargo - subtotal;
            // Calcula el porcentaje de recargo (con 2 decimales)
            recargoPorcentaje = Number(((recargoMonto / subtotal) * 100).toFixed(2));
        }

        // ========== VALIDACIÓN DE MONTO DE MEDIOS DE PAGO ==========
        // Calcula el monto en efectivo
        const efectivo = medios_pago.find(m => m.id_medio_pago === 1)?.monto || 0;
        
        // Calcula la suma de otros medios (débito, crédito, transferencia, etc.)
        const sumaOtrosMedios = medios_pago
            .filter(m => m.id_medio_pago !== 1)
            .reduce((sum, m) => sum + Number(m.monto), 0);

        // Valida que ningún monto sea negativo
        if (medios_pago.some(m => m.monto < 0)) {
            throw new Error('El monto del medio de pago no puede ser negativo');
        }

        // Valida que otros medios no superen el total (solo efectivo puede dar vuelto)
        if (sumaOtrosMedios > totalConRecargo) {
            throw new Error(`La suma de otros medios de pago ($${sumaOtrosMedios}) supera el total ($${totalConRecargo})`);
        }

        // ========== CÁLCULO DEL VUELTO ==========
        let vuelto = 0;
        const totalPagado = efectivo + sumaOtrosMedios;

        // Si el total pagado es menor al total de la venta, falta dinero
        if (totalPagado < totalConRecargo) {
            const falta = totalConRecargo - totalPagado;
            throw new Error(`Faltan asignar $${falta.toFixed(2)} para completar el total`);
        }

        // Si el total pagado es mayor (solo posible con efectivo), calcula el vuelto
        if (totalPagado > totalConRecargo) {
            vuelto = totalPagado - totalConRecargo;
        }

        // ========== REGISTRO EN BASE DE DATOS ==========
        // Formatea la fecha actual en formato YYYY-MM-DD HH:MM:SS
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Llama al stored procedure para registrar la venta
        const idcabecera = await VentaModel.registrarVentaConSP(
            iduser,
            id_local,
            subtotal,
            totalConRecargo,
            recargoMonto,
            recargoPorcentaje,
            id_cliente || null,
            fecha
        );

        // Verifica que se haya obtenido un ID válido
        if (!idcabecera) {
            throw new Error('No se pudo obtener el ID de la venta');
        }

        // Inserta los medios de pago asociados a la venta
        await VentaModel.insertarMediosPago(idcabecera, medios_pago);
        
        // Inserta los detalles de los productos vendidos
        await VentaModel.insertarDetallesVenta(idcabecera, detalles);

        // ========== RESPUESTA ==========
        // Retorna el resultado de la operación
        return {
            id_venta: idcabecera,
            vuelto: vuelto,
            subtotal: subtotal,
            recargo_monto: recargoMonto,
            recargo_porcentaje: recargoPorcentaje,
            total: totalConRecargo,
            mensaje: vuelto > 0 
                ? `Venta creada correctamente. Vuelto: $${vuelto.toFixed(2)}` 
                : 'Venta creada correctamente'
        };
    }

    /**
     * Obtiene las ventas realizadas en una fecha específica para una sucursal
     * @param {string} fecha - Fecha en formato YYYY-MM-DD
     * @param {number} idLocal - ID de la sucursal
     * @returns {Promise<Array>} Lista de ventas
     */
    async obtenerVentasPorFecha(fecha, idLocal) {
        // Validación de parámetros obligatorios
        if (!fecha || !idLocal) {
            throw new Error('Faltan parámetros: fecha y idLocal son requeridos');
        }
        
        // Llama al modelo para obtener las ventas filtradas
        return await VentaModel.obtenerVentasPorFecha(fecha, idLocal);
    }

    /**
     * Obtiene todos los medios de pago disponibles con sus recargos
     * @returns {Promise<Array>} Lista de medios de pago con información de recargo
     */
    async obtenerMediosPago() {
        // Obtiene los medios de pago base del modelo
        const medios = await VentaModel.obtenerMediosPago();

        // Define los recargos por cada tipo de medio de pago
        const recargos = {
            1: 0,   // Efectivo: 0%
            2: 0,   // Débito: 0%
            3: 10,  // Crédito: 10%
            4: 0,   // Transferencia: 0%
            5: 5    // Mercado Pago: 5%
        };

        // Enriquecer cada medio con su recargo y mensaje
        return medios.map(medio => ({
            ...medio,
            recargo: recargos[medio.id_medio_pago] || 0,
            mensaje: this.getMensajeRecargo(medio.id_medio_pago)
        }));
    }

    /**
     * Calcula el total con recargo aplicando el patrón Strategy
     * @param {number} subtotal - Subtotal de la venta
     * @param {number} medioPagoId - ID del medio de pago
     * @returns {Promise<Object>} Resultado con recargo y total
     */
    async calcularTotalConRecargo(subtotal, medioPagoId) {
        // Obtiene la estrategia correspondiente al medio de pago (Patrón Strategy)
        const estrategia = PagoFactory.getStrategy(medioPagoId);
        
        // Procesa el subtotal con la estrategia obtenida
        const resultado = await estrategia.procesar(subtotal, {});
        
        // Retorna el resultado (contiene recargo, total, porcentaje, etc.)
        return resultado;
    }

    /**
     * Obtiene el mensaje descriptivo del recargo según el medio de pago
     * @param {number} id - ID del medio de pago
     * @returns {string} Mensaje del recargo
     */
    getMensajeRecargo(id) {
        switch (id) {
            case 3: 
                return 'Recargo del 10%';    // Tarjeta de Crédito
            case 5: 
                return 'Recargo del 5%';     // Mercado Pago
            default: 
                return 'Sin recargo';        // Efectivo, Débito, Transferencia
        }
    }

    /**
     * Obtiene estadísticas para el dashboard
     * @param {number} idLocal - ID de la sucursal
     * @returns {Promise<Object>} Estadísticas (ventas del día, productos más vendidos, etc.)
     */
    async obtenerDashboardStats(idLocal) {
        // Si no se provee idLocal, usa 1 como valor por defecto
        return await VentaModel.obtenerDashboardStats(idLocal || 1);
    }

    /**
     * Guarda un cierre de caja
     * @param {Object} data - Datos del cierre de caja
     * @returns {Promise<number>} ID del cierre registrado
     */
    async guardarCierreCaja(data) {
        const { id_usuario, esperado, real, otros, diferencia, observaciones } = data;

        // Valida que los montos no sean negativos
        if (esperado < 0 || real < 0 || otros < 0) {
            throw new Error('Los montos no pueden ser negativos');
        }

        // Llama al modelo para guardar el cierre
        return await VentaModel.guardarCierreCaja(data);
    }

    /**
     * Obtiene el historial completo de cierres de caja
     * @returns {Promise<Array>} Lista de cierres
     */
    async obtenerHistorialCaja() {
        return await VentaModel.obtenerHistorialCaja();
    }

    /**
     * Verifica si hay una caja abierta para un usuario y local
     * @param {number} id_usuario - ID del usuario
     * @param {number} id_local - ID del local
     * @returns {Promise<boolean>} true si hay caja abierta, false en caso contrario
     */
    async verificarCajaAbierta(id_usuario, id_local) {
        return await VentaModel.verificarCajaAbierta(id_usuario, id_local);
    }

    /**
     * Calcula totales aplicando descuentos o recargos globales
     * @param {Array} detalles - Lista de productos
     * @param {string} modoAjuste - 'descuento', 'recargo' o 'ninguno'
     * @param {string} tipoDescuento - 'porcentaje' o 'monto'
     * @param {number} valorDescuento - Valor del descuento/recargo
     * @returns {Promise<Object>} Totales calculados
     */
    async calcularTotales(detalles, modoAjuste, tipoDescuento, valorDescuento) {
        // Aplica descuentos individuales a cada producto
        const productosConDescuento = detalles.map(p => {
            const descuentoIndividual = (p.descuento || 0) / 100;
            const subtotal = p.precio * p.cantidad * (1 - descuentoIndividual);
            return {
                id_producto: p.id_producto,
                cod_producto: p.cod_producto,
                descripcion: p.descripcion,
                precio: p.precio,
                cantidad: p.cantidad,
                descuento: p.descuento || 0,
                subtotal: subtotal
            };
        });

        // Calcula el subtotal base sumando todos los productos
        const subtotalBase = productosConDescuento.reduce((sum, p) => sum + p.subtotal, 0);

        // Variables para el ajuste global
        let ajusteGlobal = 0;
        let totalFinal = subtotalBase;

        // Aplica descuento global
        if (modoAjuste === 'descuento') {
            if (tipoDescuento === 'porcentaje') {
                ajusteGlobal = subtotalBase * (valorDescuento / 100);
            } else {
                ajusteGlobal = valorDescuento;
            }
            totalFinal = subtotalBase - ajusteGlobal;
        } 
        // Aplica recargo global
        else if (modoAjuste === 'recargo') {
            if (tipoDescuento === 'porcentaje') {
                ajusteGlobal = subtotalBase * (valorDescuento / 100);
            } else {
                ajusteGlobal = valorDescuento;
            }
            totalFinal = subtotalBase + ajusteGlobal;
        }

        // Retorna los totales con 2 decimales
        return {
            productos: productosConDescuento,
            subtotal: parseFloat(subtotalBase.toFixed(2)),
            total: parseFloat(totalFinal.toFixed(2)),
            descuentoAplicado: parseFloat(ajusteGlobal.toFixed(2))
        };
    }

    /**
     * Obtiene todas las ventas del sistema (sin filtros)
     * @returns {Promise<Array>} Lista completa de ventas
     */
    async obtenerTodasLasVentas() {
        return await VentaModel.obtenerTodasLasVentas();
    }

    /**
     * Obtiene un reporte de ventas en un rango de fechas
     * @param {string} inicio - Fecha de inicio (YYYY-MM-DD)
     * @param {string} fin - Fecha de fin (YYYY-MM-DD)
     * @returns {Promise<Array>} Reporte de ventas
     */
    async obtenerReporteRango(inicio, fin) {
        return await VentaModel.obtenerReporteRango(inicio, fin);
    }

    /**
     * Desactiva un producto (cambia su estado a inactivo)
     * @param {number} id_producto - ID del producto
     * @returns {Promise<Object>} Mensaje de éxito
     * @throws {Error} Si el producto no existe
     */
    async desactivarProducto(id_producto) {
        // Llama al modelo para desactivar el producto
        const affectedRows = await VentaModel.desactivarProducto(id_producto);
        
        // Si no se afectó ninguna fila, el producto no existe
        if (affectedRows === 0) {
            throw new Error('Producto no encontrado');
        }
        
        return { message: 'Estado del producto cambiado exitosamente' };
    }

    /**
     * Procesa un pago utilizando el patrón Strategy
     * @param {number} medioPagoId - ID del medio de pago
     * @param {number} monto - Monto a procesar
     * @param {Object} datosAdicionales - Datos adicionales para la estrategia
     * @returns {Promise<Object>} Resultado del procesamiento
     */
    async procesarPago(medioPagoId, monto, datosAdicionales) {
        // Obtiene la estrategia correspondiente al medio de pago
        const strategy = PagoFactory.getStrategy(medioPagoId);
        
        // Procesa el pago con la estrategia obtenida
        return await strategy.procesar(monto, datosAdicionales);
    }
}

// Exporta una única instancia del servicio (Patrón Singleton)
module.exports = new VentaService();