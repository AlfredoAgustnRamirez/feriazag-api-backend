const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mysqldump = require('mysqldump');


const backupDir = path.join(__dirname, '../backups');


if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'feriazag-api'
};

router.post('/crear', async (req, res) => {
    const fecha = new Date();
    const nombreBackup = `backup_${fecha.getFullYear()}_${(fecha.getMonth() + 1).toString().padStart(2, '0')}_${fecha.getDate().toString().padStart(2, '0')}_${fecha.getHours().toString().padStart(2, '0')}${fecha.getMinutes().toString().padStart(2, '0')}`;

    const backupPath = path.join(backupDir, `${nombreBackup}.sql`);

    try {
        await mysqldump({
            connection: dbConfig,
            dumpToFile: backupPath,
        });

        res.json({
            mensaje: 'Backup creado exitosamente',
            archivo: `${nombreBackup}.sql`,
            fecha: fecha
        });
    } catch (error) {
        console.error('Error al crear backup:', error);
        res.status(500).json({ mensaje: 'Error al crear backup', error: error.message });
    }
});

router.get('/listar', (req, res) => {
    if (!fs.existsSync(backupDir)) {
        return res.json([]);
    }

    fs.readdir(backupDir, (err, archivos) => {
        if (err) return res.status(500).json({ error: err.message });

        const backups = archivos
            .filter(f => f.endsWith('.sql'))
            .map(f => {
                const stats = fs.statSync(path.join(backupDir, f));
                return {
                    nombre: f,
                    tamano: stats.size,
                    fecha: stats.mtime,
                    tamano_formateado: formatearTamaño(stats.size)
                };
            })
            .sort((a, b) => b.fecha - a.fecha);

        res.json(backups);
    });
});

router.get('/descargar/:nombre', (req, res) => {
    const { nombre } = req.params;
    const backupPath = path.join(backupDir, nombre);

    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ mensaje: 'Backup no encontrado' });
    }

    res.download(backupPath, nombre);
});

router.post('/restaurar', async (req, res) => {
    const { nombre } = req.body;
    const backupPath = path.join(backupDir, nombre);

    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ mensaje: 'Backup no encontrado' });
    }

    try {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            multipleStatements: true
        });

        const sql = fs.readFileSync(backupPath, 'utf8');
        await connection.query(sql);
        await connection.end();

        res.json({ mensaje: 'Backup restaurado exitosamente' });
    } catch (error) {
        console.error('Error al restaurar backup:', error);
        res.status(500).json({ mensaje: 'Error al restaurar backup', error: error.message });
    }
});

router.delete('/eliminar/:nombre', (req, res) => {
    const { nombre } = req.params;
    const backupPath = path.join(backupDir, nombre);

    if (!fs.existsSync(backupPath)) {
        return res.status(404).json({ mensaje: 'Backup no encontrado' });
    }

    fs.unlink(backupPath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Backup eliminado' });
    });
});

let intervaloBackup = null;
const configPath = path.join(backupDir, 'config.json');

function cargarConfiguracion() {
    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (config.habilitado) {
                iniciarBackupAutomatico(config.frecuencia);
            }
        } catch (err) {
            console.error('Error al cargar configuración:', err);
        }
    }
}

function iniciarBackupAutomatico(frecuencia) {
    if (intervaloBackup) {
        clearInterval(intervaloBackup);
    }

    const horas = frecuencia === 'diario' ? 24 : 168;
    const milisegundos = horas * 60 * 60 * 1000;

    intervaloBackup = setInterval(() => {
        ejecutarBackupAutomatico();
    }, milisegundos);
}

router.post('/configurar-automatico', (req, res) => {
    const { habilitado, frecuencia } = req.body;

    if (intervaloBackup) {
        clearInterval(intervaloBackup);
        intervaloBackup = null;
    }

    if (habilitado) {
        iniciarBackupAutomatico(frecuencia);

        const config = { habilitado: true, frecuencia, ultimo_backup: new Date() };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        res.json({ mensaje: `Backup automático configurado (${frecuencia})` });
    } else {
        if (fs.existsSync(configPath)) {
            fs.unlinkSync(configPath);
        }
        res.json({ mensaje: 'Backup automático desactivado' });
    }
});

async function ejecutarBackupAutomatico() {
    const fecha = new Date();
    const nombreBackup = `auto_backup_${fecha.getFullYear()}_${(fecha.getMonth() + 1).toString().padStart(2, '0')}_${fecha.getDate().toString().padStart(2, '0')}_${fecha.getHours().toString().padStart(2, '0')}${fecha.getMinutes().toString().padStart(2, '0')}`;

    const backupPath = path.join(backupDir, `${nombreBackup}.sql`);

    try {
        await mysqldump({
            connection: dbConfig,
            dumpToFile: backupPath,
        });

        fs.readdir(backupDir, (err, archivos) => {
            if (!err) {
                const backups = archivos.filter(f => f.startsWith('auto_backup_') && f.endsWith('.sql')).sort();
                while (backups.length > 30) {
                    const viejo = backups.shift();
                    fs.unlink(path.join(backupDir, viejo), () => { });
                }
            }
        });
    } catch (error) {
        console.error('❌ Error en backup automático:', error);
    }
}

function formatearTamaño(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

cargarConfiguracion();

module.exports = router;