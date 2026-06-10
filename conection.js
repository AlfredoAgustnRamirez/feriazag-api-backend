// ============================================================================
// IMPORTACIONES
// ============================================================================

// Importa el driver de MySQL para Node.js
// Este módulo permite conectar y ejecutar consultas en MySQL
const mysql = require('mysql');

// Carga las variables de entorno desde el archivo .env
// Protege información sensible como contraseñas, puertos, etc.
require('dotenv').config();

// ============================================================================
// CONFIGURACIÓN DEL POOL DE CONEXIONES
// ============================================================================

/**
 * Crea un pool de conexiones a la base de datos MySQL
 * 
 * ¿Qué es un Pool de conexiones?
 * Es un conjunto de conexiones que se mantienen abiertas y listas para usar.
 * En lugar de abrir/cerrar conexiones constantemente, se reutilizan.
 * 
 * Ventajas del Pool:
 * - Mayor rendimiento (no crea/destruye conexiones constantemente)
 * - Controla el límite de conexiones simultáneas
 * - Maneja automáticamente la reconexión
 * - Previene sobrecarga del servidor de BD
 * 
 * Analogía:
 * Sin pool = Llamar un taxi nuevo cada vez que necesitas uno
 * Con pool = Taxis esperando en una parada, los reutilizas
 */
const pool = mysql.createPool({
    
    // ========== CONFIGURACIÓN BÁSICA ==========
    
    /**
     * Límite máximo de conexiones simultáneas
     * @type {number} 10
     * 
     * Si 10 usuarios hacen peticiones al mismo tiempo, la 11° espera
     * a que alguna conexión se libere.
     * 
     * Valor recomendado: 10-20 para aplicaciones pequeñas/medianas
     */
    connectionLimit: 10,
    
    /**
     * Puerto de conexión a MySQL
     * @type {string} Tomado de .env
     * 
     * Puerto por defecto de MySQL: 3306
     */
    port: process.env.DB_PORT,
    
    /**
     * Host/dominio del servidor MySQL
     * @type {string} Tomado de .env
     * 
     * Valores comunes:
     * - localhost (para desarrollo local)
     * - IP del servidor (para producción)
     */
    host: process.env.DB_HOST,
    
    /**
     * Usuario de la base de datos
     * @type {string} Tomado de .env
     */
    user: process.env.DB_USERNAME,
    
    /**
     * Contraseña del usuario de BD
     * @type {string} Tomado de .env
     * 
     * ⚠️ NUNCA hardcodear contraseñas en el código
     * Siempre usar variables de entorno
     */
    password: process.env.DB_PASSWORD,
    
    /**
     * Nombre de la base de datos
     * @type {string} Tomado de .env
     */
    database: process.env.DB_NAME,
    
    // ========== CONFIGURACIÓN AVANZADA ==========
    
    /**
     * Permite ejecutar múltiples consultas SQL en una sola llamada
     * @type {boolean} true
     * 
     * ⚠️ Cuidado: Puede ser vulnerable a SQL Injection
     * Solo habilitar si es necesario
     * 
     * Ejemplo:
     * "SELECT * FROM productos; SELECT * FROM categorias;"
     */
    multipleStatements: true,
    
    /**
     * Configura la zona horaria de la conexión
     * @type {string} '-03:00' (Hora de Argentina)
     * 
     * Soluciona problemas de fechas/horas entre servidor y BD
     * 
     * -03:00 = Argentina, Uruguay, Chile (horario invierno)
     * -04:00 = Bolivia, Venezuela
     * -05:00 = Colombia, Perú, Ecuador
     */
    timezone: '-03:00'
});

// ============================================================================
// EXPORTACIÓN
// ============================================================================

/**
 * Exporta el pool para ser usado en los modelos/controladores
 * 
 * Forma de uso en otros archivos:
 * 
 * const pool = require('../config/database');
 * 
 * // Obtener una conexión del pool
 * pool.getConnection((err, connection) => {
 *     connection.query('SELECT * FROM productos', (err, results) => {
 *         connection.release(); // Libera la conexión al pool
 *     });
 * });
 * 
 * // O usando promesas/async-await
 * const query = (sql, params) => {
 *     return new Promise((resolve, reject) => {
 *         pool.query(sql, params, (error, results) => {
 *             if (error) reject(error);
 *             else resolve(results);
 *         });
 *     });
 * };
 */
module.exports = pool;