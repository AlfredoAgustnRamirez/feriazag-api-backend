class PagoStrategy {
    async procesar(monto, datosAdicionales) {
        throw new Error('Método procesar debe ser implementado por cada estrategia');
    }
}

module.exports = PagoStrategy;