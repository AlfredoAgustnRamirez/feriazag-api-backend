const VentaModel = require('../models/venta.model');
const Helpers = require('../utils/helpers');
const paymentManager = require('../managers/paymentManager');

class VentaService {
    async listarProductos() {
        return await VentaModel.listarProductos();
    }

    async registrarVenta(data) {
        const { total_venta, iduser, detalles, medios_pago, id_local, id_cliente } = data;

        // Validaciones
        const sumaMedios = medios_pago.reduce((sum, m) => sum + Number(m.monto), 0);
        if (sumaMedios !== Number(total_venta)) {
            throw new Error(`La suma de medios de pago (${sumaMedios}) no coincide con el total (${total_venta})`);
        }

        if (!detalles || detalles.length === 0) {
            throw new Error('Debe incluir al menos un producto');
        }

        for (const medio of medios_pago) {
            if (medio.monto <= 0) {
                throw new Error(`El monto del medio de pago debe ser mayor a 0`);
            }
        }

        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Registrar venta - OBTENER EL ID DIRECTAMENTE
        const idcabecera = await VentaModel.registrarVentaConSP(
            iduser, id_local, total_venta, id_cliente || null, fecha
        );

        if (!idcabecera) {
            throw new Error('No se pudo obtener el ID de la venta');
        }

        // Insertar medios de pago
        await VentaModel.insertarMediosPago(idcabecera, medios_pago);

        // Insertar detalles
        await VentaModel.insertarDetallesVenta(idcabecera, detalles);

        return {
            id_venta: idcabecera,
            mensaje: 'Venta creada correctamente'
        };
    }

    async obtenerVentasPorFecha(fecha, idLocal) {
        if (!fecha || !idLocal) {
            throw new Error('Faltan parámetros: fecha y idLocal son requeridos');
        }
        return await VentaModel.obtenerVentasPorFecha(fecha, idLocal);
    }

    async obtenerMediosPago() {
        return await VentaModel.obtenerMediosPago();
    }

    async obtenerDashboardStats(idLocal) {
        return await VentaModel.obtenerDashboardStats(idLocal || 1);
    }

    async guardarCierreCaja(data) {
        const { id_usuario, esperado, real, otros, diferencia, observaciones } = data;

        // Validaciones de negocio
        if (esperado < 0 || real < 0 || otros < 0) {
            throw new Error('Los montos no pueden ser negativos');
        }

        return await VentaModel.guardarCierreCaja(data);
    }

    async obtenerHistorialCaja() {
        return await VentaModel.obtenerHistorialCaja();
    }

    async calcularTotales(detalles, modoAjuste, tipoDescuento, valorDescuento) {
        // Paso 1: Descuentos individuales por PRODUCTO
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

        // Paso 2: Subtotal base
        const subtotalBase = productosConDescuento.reduce((sum, p) => sum + p.subtotal, 0);

        // Paso 3: Ajuste global por FORMA DE PAGO
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

    async obtenerTodasLasVentas() {
        return await VentaModel.obtenerTodasLasVentas();
    }

    async obtenerReporteRango(inicio, fin) {
        return await VentaModel.obtenerReporteRango(inicio, fin);
    }

    async desactivarProducto(id_producto) {
        const affectedRows = await VentaModel.desactivarProducto(id_producto);
        if (affectedRows === 0) {
            throw new Error('Producto no encontrado');
        }
        return { message: 'Estado del producto cambiado exitosamente' };
    }

    async procesarPago(medioPagoId, monto, datosAdicionales) {
        const strategy = PagoFactory.getStrategy(medioPagoId);
        return await strategy.procesar(monto, datosAdicionales);
    }

}

module.exports = new VentaService();