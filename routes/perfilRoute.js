const express = require('express');
const router = express.Router();
const conection = require('../conection');

router.get('/lista', (req, res) => {
  const query = 'SELECT id_perfil, descripcion FROM perfil';
  
  conection.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener perfiles:', error);
      return res.status(500).json({ mensaje: 'Error al obtener perfiles' });
    }
    res.json(results);
  });
});

module.exports = router;