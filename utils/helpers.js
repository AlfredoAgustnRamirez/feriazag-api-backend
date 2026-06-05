class Helpers {
    static formatFecha(fecha = new Date()) {
        return fecha.toISOString().slice(0, 19).replace('T', ' ');
    }

    static calcularTotal(detalles) {
        return detalles.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    }

    static validarSumaMediosPago(medios_pago, total_venta) {
        const suma = medios_pago.reduce((sum, m) => sum + Number(m.monto), 0);
        return {
            isValid: suma === Number(total_venta),
            suma,
            diferencia: suma - Number(total_venta)
        };
    }
}

module.exports = Helpers;