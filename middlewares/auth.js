// Importa la librería jsonwebtoken para manejar tokens JWT
// JWT (JSON Web Token) es un estándar para autenticación segura
const jwt = require('jsonwebtoken');

// ========== CONFIGURACIÓN DE LA CLAVE SECRETA ==========
// Obtiene la clave secreta de las variables de entorno o usa un valor por defecto
// En producción, DEBE estar definida en el archivo .env
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

/**
 * Middleware de autenticación - Verifica el token JWT
 * 
 * Este middleware se ejecuta antes de las rutas protegidas.
 * Su función es validar que el usuario esté autenticado.
 * 
 * Patrones de diseño utilizados:
 * - Middleware: Cadena de responsabilidad, procesa la petición antes de llegar al controlador
 * - Chain of Responsibility: Si el token es válido, pasa al siguiente middleware/controlador
 * 
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} res - Objeto de respuesta HTTP
 * @param {Function} next - Función para pasar al siguiente middleware/controlador
 * @returns {Object} Respuesta de error si el token es inválido o no existe
 * 
 * @example
 * // Uso en una ruta protegida
 * router.get('/ventas', verificarToken, ventaController.listarVentas);
 * 
 * @example
 * // Token en el header
 * fetch('/api/ventas', {
 *     headers: {
 *         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...'
 *     }
 * })
 * 
 * @example
 * // Token en la cookie
 * // Automáticamente enviado por el navegador si la cookie es HttpOnly
 */
const verificarToken = (req, res, next) => {
    // ========== EXTRACCIÓN DEL TOKEN ==========
    // Busca el token en dos lugares posibles:
    // 1. En las cookies (req.cookies.token)
    // 2. En el header Authorization (Bearer token)
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    //                                                   ↑
    //                                                   El split separa "Bearer" del token
    //                                                   Ejemplo: "Bearer abc123" → ["Bearer", "abc123"][1]
    
    // ========== VALIDACIÓN 1: TOKEN NO PROPORCIONADO ==========
    // Si no hay token, el usuario no está autenticado
    if (!token) {
        // Responde con código 401 (Unauthorized - No autorizado)
        return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
    
    // ========== VALIDACIÓN 2: VERIFICACIÓN DEL TOKEN ==========
    try {
        // Verifica y decodifica el token usando la clave secreta
        // Si el token es válido, devuelve el payload (datos del usuario)
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // ========== AGREGAR DATOS DEL USUARIO AL REQUEST ==========
        // Almacena los datos del usuario decodificados en req.usuario
        // Estos datos estarán disponibles para los controladores posteriores
        req.usuario = decoded;
        
        // Normaliza el ID del usuario (puede venir como id_usuario o userId)
        req.usuario.id_usuario = decoded.id_usuario || decoded.userId;
        
        // ========== PASAR AL SIGUIENTE MIDDLEWARE ==========
        // Si todo está bien, continúa con la ejecución normal
        next();
    } catch (error) {
        // ========== TOKEN INVÁLIDO O EXPIRADO ==========
        // El token puede ser inválido por varias razones:
        // - Token mal formado
        // - Firma incorrecta
        // - Token expirado
        // - Token manipulado
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
};

// Exporta la función para que pueda ser utilizada en las rutas
module.exports = { verificarToken };