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
        return await VentaModel.listarProductos();
    }

    /**
     * ============================================================
     * NUEVO: Consulta el stock disponible usando sp_consultar_stock_disponible
     * ============================================================
     * @param {number} id_producto - ID del producto
     * @param {number} id_local - ID del local
     * @returns {Promise<Object>} { stock_disponible, nombre_producto, precio }
     */
    async consultarStockDisponible(id_producto, id_local) {
        // Validaciones
        if (!id_producto || !id_local) {
            throw new Error('id_producto e id_local son requeridos');
        }

        // Llama al modelo que ejecuta el procedimiento almacenado
        const resultado = await VentaModel.consultarStockDisponible(id_producto, id_local);
        
        // Si no hay stock registrado, retorna 0
        return {
            stock_disponible: resultado.stock_disponible || 0,
            nombre_producto: resultado.nombre_producto || 'Producto no encontrado',
            precio: resultado.precio || 0
        };
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
        const cajaAbierta = await this.verificarCajaAbierta(iduser, id_local);
        if (!cajaAbierta) {
            throw new Error('Debe abrir la caja antes de realizar una venta');
        }

        // ========== VALIDACIÓN DEL CARRITO ==========
        if (!detalles || detalles.length === 0) {
            throw new Error('Debe incluir al menos un producto');
        }

        // ============================================================
        // 🔹 NUEVO: VERIFICACIÓN DE STOCK CON sp_consultar_stock_disponible
        // ============================================================
        for (const detalle of detalles) {
            const stockInfo = await this.consultarStockDisponible(
                detalle.id_producto,
                id_local
            );

            // Si el stock disponible es menor al solicitado, rechazar
            if (stockInfo.stock_disponible < detalle.cantidad) {
                throw new Error(
                    `Stock insuficiente para "${stockInfo.nombre_producto}". ` +
                    `Disponible: ${stockInfo.stock_disponible}, ` +
                    `Solicitado: ${detalle.cantidad}`
                );
            }
        }

        // ========== CÁLCULO DEL SUBTOTAL ==========
        let subtotal = 0;
        for (const detalle of detalles) {
            const descuento = (detalle.descuento || 0) / 100;
            const precioUnitario = detalle.precio * (1 - descuento);
            subtotal += precioUnitario * detalle.cantidad;
        }

        // ========== CÁLCULO DEL RECARGO POR MEDIO DE PAGO ==========
        const medioPrincipal = medios_pago[0];
        let totalConRecargo = Number(total_venta);
        let recargoMonto = 0;
        let recargoPorcentaje = 0;

        if (medioPrincipal && medioPrincipal.id_medio_pago !== 1) {
            const resultado = await this.calcularTotalConRecargo(subtotal, medioPrincipal.id_medio_pago);
            totalConRecargo = resultado.total;
            recargoMonto = totalConRecargo - subtotal;
            recargoPorcentaje = Number(((recargoMonto / subtotal) * 100).toFixed(2));
        }

        // ========== VALIDACIÓN DE MONTO DE MEDIOS DE PAGO ==========
        const efectivo = medios_pago.find(m => m.id_medio_pago === 1)?.monto || 0;
        const sumaOtrosMedios = medios_pago
            .filter(m => m.id_medio_pago !== 1)
            .reduce((sum, m) => sum + Number(m.monto), 0);

        if (medios_pago.some(m => m.monto < 0)) {
            throw new Error('El monto del medio de pago no puede ser negativo');
        }

        if (sumaOtrosMedios > totalConRecargo) {
            throw new Error(`La suma de otros medios de pago ($${sumaOtrosMedios}) supera el total ($${totalConRecargo})`);
        }

        // ========== CÁLCULO DEL VUELTO ==========
        let vuelto = 0;
        const totalPagado = efectivo + sumaOtrosMedios;

        if (totalPagado < totalConRecargo) {
            const falta = totalConRecargo - totalPagado;
            throw new Error(`Faltan asignar $${falta.toFixed(2)} para completar el total`);
        }

        if (totalPagado > totalConRecargo) {
            vuelto = totalPagado - totalConRecargo;
        }

        // ========== REGISTRO EN BASE DE DATOS ==========
        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // 🔹 Usa sp_registrar_venta (procedimiento de actualización)
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

        if (!idcabecera) {
            throw new Error('No se pudo obtener el ID de la venta');
        }

        // Inserta los medios de pago y detalles
        await VentaModel.insertarMediosPago(idcabecera, medios_pago);
        await VentaModel.insertarDetallesVenta(idcabecera, detalles);

        // ========== RESPUESTA ==========
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
        if (!fecha || !idLocal) {
            throw new Error('Faltan parámetros: fecha y idLocal son requeridos');
        }
        return await VentaModel.obtenerVentasPorFecha(fecha, idLocal);
    }

    /**
     * Obtiene todos los medios de pago disponibles con sus recargos
     * @returns {Promise<Array>} Lista de medios de pago con información de recargo
     */
    async obtenerMediosPago() {
        const medios = await VentaModel.obtenerMediosPago();

        const recargos = {
            1: 0,   // Efectivo: 0%
            2: 0,   // Débito: 0%
            3: 10,  // Crédito: 10%
            4: 0,   // Transferencia: 0%
            5: 5    // Mercado Pago: 5%
        };

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
        const estrategia = PagoFactory.getStrategy(medioPagoId);
        return await estrategia.procesar(subtotal, {});
    }

    /**
     * Obtiene el mensaje descriptivo del recargo según el medio de pago
     * @param {number} id - ID del medio de pago
     * @returns {string} Mensaje del recargo
     */
    getMensajeRecargo(id) {
        switch (id) {
            case 3: return 'Recargo del 10%';
            case 5: return 'Recargo del 5%';
            default: return 'Sin recargo';
        }
    }

    /**
     * Obtiene estadísticas para el dashboard
     * @param {number} idLocal - ID de la sucursal
     * @returns {Promise<Object>} Estadísticas
     */
    async obtenerDashboardStats(idLocal) {
        return await VentaModel.obtenerDashboardStats(idLocal || 1);
    }

    /**
     * Guarda un cierre de caja
     * @param {Object} data - Datos del cierre de caja
     * @returns {Promise<number>} ID del cierre registrado
     */
    async guardarCierreCaja(data) {
        const { esperado, real, otros } = data;
        if (esperado < 0 || real < 0 || otros < 0) {
            throw new Error('Los montos no pueden ser negativos');
        }
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
     * @returns {Promise<boolean>} true si hay caja abierta
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

        const subtotalBase = productosConDescuento.reduce((sum, p) => sum + p.subtotal, 0);
        let ajusteGlobal = 0;
        let totalFinal = subtotalBase;

        if (modoAjuste === 'descuento') {
            if (tipoDescuento === 'porcentaje') {
                ajusteGlobal = subtotalBase * (valorDescuento / 100);
            } else {
                ajusteGlobal = valorDescuento;
            }
            totalFinal = subtotalBase - ajusteGlobal;
        } else if (modoAjuste === 'recargo') {
            if (tipoDescuento === 'porcentaje') {
                ajusteGlobal = subtotalBase * (valorDescuento / 100);
            } else {
                ajusteGlobal = valorDescuento;
            }
            totalFinal = subtotalBase + ajusteGlobal;
        }

        return {
            productos: productosConDescuento,
            subtotal: parseFloat(subtotalBase.toFixed(2)),
            total: parseFloat(totalFinal.toFixed(2)),
            descuentoAplicado: parseFloat(ajusteGlobal.toFixed(2))
        };
    }

    /**
     * Obtiene todas las ventas del sistema
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
     */
    async desactivarProducto(id_producto) {
        const affectedRows = await VentaModel.desactivarProducto(id_producto);
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
        const strategy = PagoFactory.getStrategy(medioPagoId);
        return await strategy.procesar(monto, datosAdicionales);
    }
}

// Exporta una única instancia del servicio (Patrón Singleton)
module.exports = new VentaService();