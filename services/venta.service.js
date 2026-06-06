const VentaModel = require('../models/venta.model');
const Helpers = require('../utils/helpers');
const paymentManager = require('../managers/paymentManager');
const PagoFactory = require('../strategies/pagoFactory'); // ✅ AGREGADO

class VentaService {
    async listarProductos() {
        return await VentaModel.listarProductos();
    }

    async registrarVenta(data) {
        const { total_venta, iduser, detalles, medios_pago, id_local, id_cliente } = data;

        // Validaciones
        if (!detalles || detalles.length === 0) {
            throw new Error('Debe incluir al menos un producto');
        }

        // Separar efectivo de otros medios de pago
        const efectivo = medios_pago.find(m => m.id_medio_pago === 1)?.monto || 0;
        const sumaOtrosMedios = medios_pago
            .filter(m => m.id_medio_pago !== 1)
            .reduce((sum, m) => sum + Number(m.monto), 0);

        // Validar que ningún medio tenga monto negativo
        for (const medio of medios_pago) {
            if (medio.monto < 0) {
                throw new Error(`El monto del medio de pago no puede ser negativo`);
            }
        }

        if (sumaOtrosMedios > Number(total_venta)) {
            throw new Error(`La suma de otros medios de pago ($${sumaOtrosMedios}) supera el total ($${total_venta})`);
        }

        let vuelto = 0;
        const totalNumerico = Number(total_venta);
        const totalPagado = efectivo + sumaOtrosMedios;

        if (totalPagado < totalNumerico) {
            const falta = totalNumerico - totalPagado;
            throw new Error(`Faltan asignar $${falta.toFixed(2)} para completar el total`);
        }

        if (totalPagado > totalNumerico) {
            vuelto = totalPagado - totalNumerico;
            console.log(`Vuelto a devolver: $${vuelto.toFixed(2)}`);
        }

        const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const idcabecera = await VentaModel.registrarVentaConSP(
            iduser, id_local, total_venta, id_cliente || null, fecha
        );

        if (!idcabecera) {
            throw new Error('No se pudo obtener el ID de la venta');
        }

        await VentaModel.insertarMediosPago(idcabecera, medios_pago);

        await VentaModel.insertarDetallesVenta(idcabecera, detalles);

        return {
            id_venta: idcabecera,
            vuelto: vuelto,
            mensaje: vuelto > 0 ? `Venta creada correctamente. Vuelto: $${vuelto}` : 'Venta creada correctamente'
        };
    }

    async obtenerVentasPorFecha(fecha, idLocal) {
        if (!fecha || !idLocal) {
            throw new Error('Faltan parámetros: fecha y idLocal son requeridos');
        }
        return await VentaModel.obtenerVentasPorFecha(fecha, idLocal);
    }

    async obtenerMediosPago() {
        const medios = await VentaModel.obtenerMediosPago();

        const recargos = {
            1: 0,   // Efectivo
            2: 0,   // Débito
            3: 10,  // Crédito
            4: 0,   // Transferencia
            5: 5    // Mercado Pago
        };

        return medios.map(medio => ({
            ...medio,
            recargo: recargos[medio.id_medio_pago] || 0,
            mensaje: this.getMensajeRecargo(medio.id_medio_pago)
        }));
    }

    // ✅ NUEVO MÉTODO PARA CALCULAR TOTAL CON RECARGO (STRATEGY)
    async calcularTotalConRecargo(subtotal, medioPagoId) {
        const estrategia = PagoFactory.getStrategy(medioPagoId);
        const resultado = await estrategia.procesar(subtotal, {});
        return resultado;
    }

    getMensajeRecargo(id) {
        switch (id) {
            case 3: return 'Recargo del 10%';
            case 5: return 'Recargo del 5%';
            default: return 'Sin recargo';
        }
    }

    async obtenerDashboardStats(idLocal) {
        return await VentaModel.obtenerDashboardStats(idLocal || 1);
    }

    async guardarCierreCaja(data) {
        const { id_usuario, esperado, real, otros, diferencia, observaciones } = data;

        if (esperado < 0 || real < 0 || otros < 0) {
            throw new Error('Los montos no pueden ser negativos');
        }

        return await VentaModel.guardarCierreCaja(data);
    }

    async obtenerHistorialCaja() {
        return await VentaModel.obtenerHistorialCaja();
    }

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