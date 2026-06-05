const express = require('express');
const router = express.Router();
const conection = require('../conection');
const { verificarToken } = require('../middlewares/auth'); 

router.get('/usuario', verificarToken, (req, res) => {
  const userId = req.usuario.id_usuario; 
  
  const query = `
    SELECT l.* 
    FROM local l
    INNER JOIN usuario_local ul ON ul.id_local = l.id_local
    WHERE ul.id_usuario = ? AND ul.es_activo = 'Si'
  `;
  
  conection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error al obtener local:', error);
      return res.status(500).json({ mensaje: 'Error al obtener local' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontró un local activo' });
    }
    
    res.json(results[0]);
  });
});

router.get('/usuario/locales', verificarToken, (req, res) => {
  const userId = req.usuario.id_usuario; // ✅ Usar el campo correcto
  
  const query = `
    SELECT l.*, ul.es_activo, ul.id_usuario_local
    FROM local l
    INNER JOIN usuario_local ul ON ul.id_local = l.id_local
    WHERE ul.id_usuario = ?
    ORDER BY ul.es_activo DESC, l.nombre_local
  `;
  
  conection.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error al obtener locales:', error);
      return res.status(500).json({ mensaje: 'Error al obtener locales' });
    }
    
    res.json(results);
  });
});

router.get('/cambiar/:idLocal', verificarToken, (req, res) => {
  const { idLocal } = req.params;
  const userId = req.usuario.id_usuario; 
  
  const desactivarQuery = `UPDATE usuario_local SET es_activo = 'No' WHERE id_usuario = ?`;
  
  conection.query(desactivarQuery, [userId], (error) => {
    if (error) {
      console.error('Error al desactivar locales:', error);
      return res.status(500).json({ mensaje: 'Error al cambiar local', error: error.message });
    }
    
    const activarQuery = `UPDATE usuario_local SET es_activo = 'Si' WHERE id_usuario = ? AND id_local = ?`;
    
    conection.query(activarQuery, [userId, idLocal], (error) => {
      if (error) {
        console.error('Error al activar local:', error);
        return res.status(500).json({ mensaje: 'Error al cambiar local', error: error.message });
      }
      
      const getLocalQuery = `SELECT * FROM local WHERE id_local = ?`;
      conection.query(getLocalQuery, [idLocal], (error, results) => {
        if (error) {
          console.error('Error al obtener local:', error);
          return res.status(500).json({ mensaje: 'Error al obtener local', error: error.message });
        }
        
        if (results.length === 0) {
          return res.status(404).json({ mensaje: 'Local no encontrado' });
        }
        
        res.json(results[0]);
      });
    });
  });
});

router.post('/crear', (req, res) => {
  const { nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado } = req.body;
  const userId = req.usuario.id_usuario; 
  
  if (!nombre_local) {
    return res.status(400).json({ mensaje: 'El nombre del local es requerido' });
  }
  
  const insertQuery = `
    INSERT INTO local (
      nombre_local, direccion, telefono, email, 
      ciudad, provincia, horario, encargado, activo, fecha_registro
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Si', NOW())
  `;
  
  conection.query(insertQuery, [nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado], (error, result) => {
    if (error) {
      console.error('Error al crear local:', error);
      return res.status(500).json({ mensaje: 'Error al crear local', error: error.message });
    }
    
    const nuevoLocalId = result.insertId;
    
    const relationQuery = `
      INSERT INTO usuario_local (id_usuario, id_local, es_activo) 
      VALUES (?, ?, 'Si')
    `;
    
    conection.query(relationQuery, [userId, nuevoLocalId], (error) => {
      if (error) {
        console.error('Error al relacionar:', error);
        return res.status(500).json({ mensaje: 'Error al asignar local', error: error.message });
      }
      
      const desactivarQuery = `
        UPDATE usuario_local SET es_activo = 'No' 
        WHERE id_usuario = ? AND id_local != ?
      `;
      
      conection.query(desactivarQuery, [userId, nuevoLocalId], () => {});
      
      res.json({ 
        success: true, 
        id_local: nuevoLocalId, 
        mensaje: 'Local creado correctamente' 
      });
    });
  });
});

router.put('/configuracion', verificarToken, (req, res) => {
  const { id_local, nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado } = req.body;
  
  if (!id_local) {
    return res.status(400).json({ mensaje: 'ID del local es requerido' });
  }
  
  const query = `
    UPDATE local 
    SET nombre_local = ?, direccion = ?, telefono = ?, email = ?, 
        ciudad = ?, provincia = ?, horario = ?, encargado = ?
    WHERE id_local = ?
  `;
  
  conection.query(query, [nombre_local, direccion, telefono, email, ciudad, provincia, horario, encargado, id_local], (error) => {
    if (error) {
      console.error('Error al actualizar local:', error);
      return res.status(500).json({ mensaje: 'Error al actualizar local' });
    }
    
    res.json({ success: true, mensaje: 'Local actualizado correctamente' });
  });
});

router.delete('/eliminar/:idLocal', verificarToken, (req, res) => {
  const { idLocal } = req.params;
  const userId = req.usuario.id_usuario; 
  
  const countQuery = `SELECT COUNT(*) as total FROM usuario_local WHERE id_usuario = ?`;
  
  conection.query(countQuery, [userId], (error, results) => {
    if (error) {
      console.error('Error al contar locales:', error);
      return res.status(500).json({ mensaje: 'Error al eliminar local' });
    }
    
    const totalLocales = results[0].total;
    
    if (totalLocales <= 1) {
      return res.status(400).json({ mensaje: 'No puedes eliminar el único local. Debes tener al menos un local.' });
    }
    
    const checkActivoQuery = `SELECT es_activo FROM usuario_local WHERE id_usuario = ? AND id_local = ?`;
    
    conection.query(checkActivoQuery, [userId, idLocal], (error, results) => {
      if (error) {
        console.error('Error al verificar local activo:', error);
        return res.status(500).json({ mensaje: 'Error al eliminar local' });
      }
      
      const esActivo = results[0]?.es_activo === 'Si';
      
      const deleteRelationQuery = `DELETE FROM usuario_local WHERE id_usuario = ? AND id_local = ?`;
      
      conection.query(deleteRelationQuery, [userId, idLocal], (error) => {
        if (error) {
          console.error('Error al eliminar relación:', error);
          return res.status(500).json({ mensaje: 'Error al eliminar local' });
        }
        
        if (esActivo) {
          const activarOtroQuery = `
            UPDATE usuario_local SET es_activo = 'Si' 
            WHERE id_usuario = ? LIMIT 1
          `;
          conection.query(activarOtroQuery, [userId], () => {});
        }
        
        const deleteLocalQuery = `DELETE FROM local WHERE id_local = ?`;
        conection.query(deleteLocalQuery, [idLocal], () => {});
        
        res.json({ 
          success: true, 
          mensaje: 'Local eliminado correctamente' 
        });
      });
    });
  });
});

module.exports = router;