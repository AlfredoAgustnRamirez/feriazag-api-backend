const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err);
    
    // Errores de negocio (lanzados desde servicios)
    if (err.message) {
        return res.status(400).json({ 
            mensaje: err.message,
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
    
    // Error genérico
    res.status(500).json({ 
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

module.exports = errorHandler;