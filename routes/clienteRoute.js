const express = require("express");
const conection = require("../conection");
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { verificarToken } = require('../middlewares/auth'); 


router.get("/listar", verificarToken, [
  query('estado').optional().isIn(['activos', 'inactivos']).withMessage('Estado inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { estado } = req.query; 
  
  let query = `
    SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
    FROM cliente c
    LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
  `;
  
  if (estado === 'activos') {
    query += " WHERE c.activo = 'SI'";
  } else if (estado === 'inactivos') {
    query += " WHERE c.activo = 'NO'";
  }
  
  query += " ORDER BY c.id_cliente DESC";
  
  conection.query(query, function (error, results, fields) {
    if (error) {
      console.error("Error al obtener los clientes:", error);
      res.status(500).send("Error interno del servidor");
      return;
    }
    res.json(results);
  });
});

router.get("/buscar", verificarToken, [
  query('search').optional().trim().escape().isLength({ max: 100 }).withMessage('Búsqueda demasiado larga')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { search } = req.query;
  
  const query = `
    SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
    FROM cliente c
    LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
    WHERE c.nombre_razon_social LIKE ? 
       OR c.dni_cuit LIKE ?
       OR c.correo_electronico LIKE ?
    ORDER BY c.id_cliente DESC
  `;
  
  const searchTerm = `%${search}%`;
  
  conection.query(query, [searchTerm, searchTerm, searchTerm], (error, results) => {
    if (error) {
      console.error("Error al buscar clientes:", error);
      res.status(500).json({ mensaje: "Error al buscar clientes" });
      return;
    }
    res.json(results);
  });
});

router.get("/obtener/:id_cliente", verificarToken, [
  param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const clienteId = req.params.id_cliente;
  
  const query = `
    SELECT c.*, tc.descripcion as tipo_cliente_descripcion 
    FROM cliente c
    LEFT JOIN tipo_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
    WHERE c.id_cliente = ?
  `;
  
  conection.query(query, [clienteId], (error, results) => {
    if (error) {
      console.error("Error al obtener cliente:", error);
      res.status(500).json({ mensaje: "Error al obtener cliente" });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ mensaje: "Cliente no encontrado" });
      return;
    }
    
    res.json(results[0]);
  });
});

router.post("/register", verificarToken, [
  body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
  body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/).withMessage('DNI/CUIT inválido (formato: 20-12345678-9 o 12345678)'),
  body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/).withMessage('Teléfono inválido (solo números, 6-15 dígitos)'),
  body('correo_electronico').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
  body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { 
    nombre_razon_social, 
    dni_cuit, 
    telefono_whatsapp, 
    correo_electronico, 
    id_tipo_cliente,
    activo 
  } = req.body;
  
  const checkQuery = "SELECT * FROM cliente WHERE dni_cuit = ?";
  conection.query(checkQuery, [dni_cuit], (error, results) => {
    if (error) {
      console.error("Error al verificar cliente:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
      return;
    }
    
    if (results.length > 0) {
      res.status(400).json({ mensaje: "Ya existe un cliente con ese DNI/CUIT" });
      return;
    }
    
    const query = `
      INSERT INTO cliente (
        nombre_razon_social, 
        dni_cuit, 
        telefono_whatsapp, 
        correo_electronico, 
        id_tipo_cliente, 
        activo
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const valores = [
      nombre_razon_social, 
      dni_cuit, 
      telefono_whatsapp || null, 
      correo_electronico || null, 
      id_tipo_cliente, 
      activo || 'SI'
    ];
    
    conection.query(query, valores, (error, results) => {
      if (error) {
        console.error("Error al crear cliente:", error);
        res.status(500).json({ mensaje: "Error al crear cliente" });
        return;
      }
      
      console.log("Cliente creado correctamente, ID:", results.insertId);
      res.status(201).json({ 
        mensaje: "Cliente creado correctamente",
        id_cliente: results.insertId 
      });
    });
  });
});

router.put("/update/:id_cliente", verificarToken, [
  param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
  body('nombre_razon_social').trim().escape().isLength({ min: 3, max: 100 }).withMessage('Nombre/Razón Social debe tener entre 3 y 100 caracteres'),
  body('dni_cuit').trim().escape().matches(/^\d{2}-\d{8}-\d$|^\d{8,11}$/).withMessage('DNI/CUIT inválido (formato: 20-12345678-9 o 12345678)'),
  body('telefono_whatsapp').optional().trim().escape().matches(/^\d{6,15}$/).withMessage('Teléfono inválido (solo números, 6-15 dígitos)'),
  body('correo_electronico').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('id_tipo_cliente').isInt({ min: 1, max: 4 }).withMessage('Tipo de cliente inválido'),
  body('activo').optional().isIn(['SI', 'NO']).withMessage('Estado inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const clienteId = req.params.id_cliente;
  const { 
    nombre_razon_social, 
    dni_cuit, 
    telefono_whatsapp, 
    correo_electronico, 
    id_tipo_cliente, 
    activo 
  } = req.body;
  
  const checkQuery = "SELECT * FROM cliente WHERE dni_cuit = ? AND id_cliente != ?";
  conection.query(checkQuery, [dni_cuit, clienteId], (error, results) => {
    if (error) {
      console.error("Error al verificar cliente:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
      return;
    }
    
    if (results.length > 0) {
      res.status(400).json({ mensaje: "Ya existe otro cliente con ese DNI/CUIT" });
      return;
    }
    
    const query = `
      UPDATE cliente 
      SET nombre_razon_social = ?, 
          dni_cuit = ?, 
          telefono_whatsapp = ?, 
          correo_electronico = ?, 
          id_tipo_cliente = ?, 
          activo = ?
      WHERE id_cliente = ?
    `;
    
    const valores = [
      nombre_razon_social, 
      dni_cuit, 
      telefono_whatsapp || null, 
      correo_electronico || null, 
      id_tipo_cliente, 
      activo,
      clienteId
    ];
    
    conection.query(query, valores, (error, results) => {
      if (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(500).json({ mensaje: "Error al actualizar cliente" });
        return;
      }
      
      if (results.affectedRows === 0) {
        res.status(404).json({ mensaje: "Cliente no encontrado" });
        return;
      }
      
      console.log("Cliente actualizado correctamente");
      res.json({ mensaje: "Cliente actualizado correctamente" });
    });
  });
});

router.delete("/desactivar/:id_cliente", verificarToken, [
  param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const clienteId = req.params.id_cliente;
  
  const sql = "UPDATE cliente SET activo = 'NO' WHERE id_cliente = ?";
  
  conection.query(sql, [clienteId], (err, result) => {
    if (err) {
      console.error("Error al desactivar cliente:", err);
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    
    res.status(200).json({ message: "Cliente desactivado exitosamente" });
  });
});

router.delete("/activar/:id_cliente", verificarToken, [
  param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const clienteId = req.params.id_cliente;
  
  const sql = "UPDATE cliente SET activo = 'SI' WHERE id_cliente = ?";
  
  conection.query(sql, [clienteId], (err, result) => {
    if (err) {
      console.error("Error al activar cliente:", err);
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    
    res.status(200).json({ message: "Cliente activado exitosamente" });
  });
});

router.patch("/cambiar-estado/:id_cliente", verificarToken, [
  param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido'),
  body('activo').isIn(['SI', 'NO']).withMessage('Estado inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const clienteId = req.params.id_cliente;
  const { activo } = req.body; 
  
  const sql = "UPDATE cliente SET activo = ? WHERE id_cliente = ?";
  
  conection.query(sql, [activo, clienteId], (err, result) => {
    if (err) {
      console.error("Error al cambiar estado del cliente:", err);
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Cliente no encontrado" });
      return;
    }
    
    res.status(200).json({ 
      message: `Cliente ${activo === 'SI' ? 'activado' : 'desactivado'} exitosamente` 
    });
  });
});

router.delete("/eliminar/:id_cliente", verificarToken, [
  param('id_cliente').isInt({ min: 1 }).withMessage('ID cliente inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const clienteId = req.params.id_cliente;
  
  const checkVentas = "SELECT * FROM venta_cabecera WHERE id_cliente = ?";
  conection.query(checkVentas, [clienteId], (error, results) => {
    if (error) {
      console.error("Error al verificar ventas del cliente:", error);
      res.status(500).json({ error: "Error interno del servidor" });
      return;
    }
    
    if (results.length > 0) {
      res.status(400).json({ 
        error: "No se puede eliminar el cliente porque tiene ventas asociadas" 
      });
      return;
    }
    
    const sql = "DELETE FROM cliente WHERE id_cliente = ?";
    conection.query(sql, [clienteId], (err, result) => {
      if (err) {
        console.error("Error al eliminar cliente:", err);
        res.status(500).json({ error: "Error interno del servidor" });
        return;
      }
      
      if (result.affectedRows === 0) {
        res.status(404).json({ error: "Cliente no encontrado" });
        return;
      }
      
      res.status(200).json({ message: "Cliente eliminado exitosamente" });
    });
  });
});

router.get("/tipos", verificarToken, (req, res) => {
  conection.query("SELECT * FROM tipo_cliente WHERE activo = 'SI'", function (error, results) {
    if (error) {
      console.error("Error al obtener tipos de cliente:", error);
      res.status(500).send("Error interno del servidor");
      return;
    }
    res.json(results);
  });
});

module.exports = router;