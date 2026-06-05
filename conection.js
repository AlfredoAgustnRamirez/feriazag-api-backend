const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
    connectionLimit: 10, 
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
    timezone: '-03:00' 
});

module.exports = pool;