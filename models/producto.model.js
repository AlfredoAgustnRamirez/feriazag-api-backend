const connection = require('../conection');

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });
};

class ProductoModel {

  // ============ PRODUCTOS ============

  async crearProducto(data) {
    const { cod_producto, id_categoria, descripcion, talle, precio, activo, imagen } = data;
    const sql = `
      INSERT INTO producto (cod_producto, id_categoria, descripcion, talle, precio, activo, imagen) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [cod_producto, id_categoria, descripcion, talle, precio, activo || 'Si', imagen]);
    return result.insertId;
  }

  // producto.model.js - Método actualizarProducto corregido

async actualizarProducto(id_producto, data, id_local, cantidad) {
    const { cod_producto, id_categoria, descripcion, talle, precio, activo, imagen } = data;
    // 1. Actualizar tabla producto
    const sqlProducto = `
        UPDATE producto 
        SET cod_producto = ?, 
            id_categoria = ?, 
            descripcion = ?, 
            talle = ?, 
            precio = ?, 
            activo = ?,
            imagen = ?  
        WHERE id_producto = ?
    `;

    await query(sqlProducto, [
        cod_producto,
        id_categoria,
        descripcion,
        talle,
        precio,
        activo || 'Si',
        imagen || null,
        id_producto
    ]);

    // 2. ACTUALIZAR STOCK en tabla producto_sucursal_stock
    if (id_local !== undefined && id_local !== null && cantidad !== undefined && cantidad !== null) {
        
        // Verificar si existe el registro
        const exists = await query(
            'SELECT * FROM producto_sucursal_stock WHERE id_producto = ? AND id_local = ?',
            [id_producto, id_local]
        );
        
        if (exists.length > 0) {
            // Actualizar stock existente
            const result = await query(
                'UPDATE producto_sucursal_stock SET cantidad = ?, updated_at = NOW() WHERE id_producto = ? AND id_local = ?',
                [cantidad, id_producto, id_local]
            );
        } else {
            // Crear nuevo registro de stock
            const result = await query(
                'INSERT INTO producto_sucursal_stock (id_producto, id_local, cantidad, activo, created_at, updated_at) VALUES (?, ?, ?, "Si", NOW(), NOW())',
                [id_producto, id_local, cantidad]
            );
        }
    } 
    
    return true;
}

  /**
       * Encuentra un producto por su ID
       * @param {number} id - ID del producto
       * @returns {Promise<Object|null>} Producto encontrado o null
       */
  async findById(id_producto) {
    const sql = `
        SELECT p.*, c.descripcion as categoria_nombre
        FROM producto p
        LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
        WHERE p.id_producto = ?
    `;
    const rows = await query(sql, [id_producto]);
    return rows[0] || null;
  }

  /**
   * Encuentra un producto por código excluyendo un ID específico
   * @param {string} codigo - Código del producto
   * @param {number} excludeId - ID a excluir
   * @returns {Promise<Object|null>}
   */
  async findByCodigoExcludingId(cod_producto, id_producto) {
    const rows = await query(
        'SELECT id_producto FROM producto WHERE cod_producto = ? AND id_producto != ?',
        [cod_producto, id_producto]
    );
    return rows[0] || null;
}

  async obtenerProductos(idLocal) {
    const sql = `
      SELECT 
        p.id_producto, p.cod_producto, p.id_categoria, c.descripcion AS categoria,
        p.descripcion, p.talle, p.precio, p.activo, p.imagen,
        COALESCE(pss.cantidad, 0) as cantidad
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
    `;
    return await query(sql, [idLocal]);
  }

  async obtenerProductosConStock(idLocal) {
    const sql = `
      SELECT 
        p.id_producto, p.cod_producto, p.id_categoria, c.descripcion AS categoria,
        p.descripcion, p.talle, p.precio, p.activo, p.imagen,
        COALESCE(pss.cantidad, 0) as cantidad
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
      WHERE p.activo = 'Si'
    `;
    return await query(sql, [idLocal]);
  }

  async obtenerTodosLosProductosConStockTotal() {
    const sql = `
    SELECT 
      p.id_producto,
      p.cod_producto,
      p.id_categoria,
      c.descripcion AS categoria,
      p.descripcion,
      p.talle,
      p.precio,
      p.imagen,
      p.activo,
      COALESCE(SUM(pss.cantidad), 0) as cantidad
    FROM producto p
    INNER JOIN categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto
    GROUP BY p.id_producto, p.cod_producto, p.id_categoria, c.descripcion,
             p.descripcion, p.talle, p.precio, p.imagen, p.activo
    ORDER BY p.id_producto DESC
  `;
    return await query(sql);
  }

  async obtenerProductosPorLocal(idLocal) {
    const sql = `
        SELECT 
            p.id_producto, 
            p.cod_producto, 
            p.id_categoria, 
            c.descripcion AS categoria,
            p.descripcion, 
            p.talle, 
            p.precio, 
            p.imagen, 
            p.activo,
            COALESCE(pss.cantidad, 0) as cantidad
        FROM producto p
        INNER JOIN categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
        WHERE p.activo = 'Si'  -- ← Agregar esta condición para traer solo activos
        ORDER BY p.descripcion
    `;
    return await query(sql, [idLocal]);
  }

  async obtenerProductosActivosPorLocal(idLocal) {
    const sql = `
    SELECT 
      p.id_producto, p.cod_producto, p.id_categoria, c.descripcion AS categoria,
      p.descripcion, p.talle, p.precio, p.imagen, p.activo,
      COALESCE(pss.cantidad, 0) as cantidad
    FROM producto p
    INNER JOIN categoria c ON p.id_categoria = c.id_categoria
    LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
    WHERE p.activo = 'Si'
    ORDER BY p.descripcion
  `;
    return await query(sql, [idLocal]);
  }

  async obtenerProductosActivos() {
    const sql = `
      SELECT p.id_producto, p.cod_producto, p.id_categoria, c.descripcion as categoria,
        p.descripcion, p.talle, p.precio, p.activo, p.imagen,
        COALESCE(SUM(pss.cantidad), 0) as stock_total
      FROM producto p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto
      WHERE p.activo = 'Si'
      GROUP BY p.id_producto
      ORDER BY p.id_producto DESC
    `;
    return await query(sql);
  }

  async obtenerProductosBajoStock(idLocal) {
    const sql = `
      SELECT p.id_producto, p.cod_producto, p.id_categoria, c.descripcion as categoria,
        p.descripcion, p.talle, p.precio, p.activo, p.imagen,
        COALESCE(pss.cantidad, 0) as cantidad
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
      WHERE p.activo = 'Si' AND COALESCE(pss.cantidad, 0) <= 5
      ORDER BY COALESCE(pss.cantidad, 0) ASC
    `;
    return await query(sql, [idLocal]);
  }

  async obtenerProductosVendidos(idLocal) {
    const sql = `
      SELECT DISTINCT
        p.id_producto, p.cod_producto, p.id_categoria, c.descripcion AS categoria,
        p.descripcion, p.talle, p.precio, p.activo, p.imagen,
        COALESCE(pss.cantidad, 0) as cantidad
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
      INNER JOIN venta_detalle vd ON p.id_producto = vd.id_producto
      WHERE p.activo = 'Si'
      GROUP BY p.id_producto
      ORDER BY p.descripcion
    `;
    return await query(sql, [idLocal]);
  }

  async obtenerProductosNoVendidos(idLocal) {
    const sql = `
      SELECT 
        p.id_producto, p.cod_producto, p.id_categoria, c.descripcion AS categoria,
        p.descripcion, p.talle, p.precio, p.activo, p.imagen,
        COALESCE(pss.cantidad, 0) as cantidad
      FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND pss.id_local = ?
      WHERE p.id_producto NOT IN (SELECT DISTINCT id_producto FROM venta_detalle)
      ORDER BY p.descripcion
    `;
    return await query(sql, [idLocal]);
  }

  async obtenerProductosNoAsignados(idLocal) {
    const sql = `
      SELECT p.id_producto, p.cod_producto, p.descripcion, p.precio
      FROM producto p
      WHERE p.activo = 'Si'
      AND p.id_producto NOT IN (SELECT id_producto FROM producto_sucursal_stock WHERE id_local = ?)
    `;
    return await query(sql, [idLocal]);
  }

  // ============ STOCK ============

  async crearStock(data) {
    const { id_producto, id_local, cantidad, activo } = data;
    const sql = `
      INSERT INTO producto_sucursal_stock (id_producto, id_local, cantidad, activo)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), activo = VALUES(activo)
    `;
    await query(sql, [id_producto, id_local, cantidad || 0, activo || 'Si']);
  }

  async actualizarStock(id_producto, id_local, cantidad) {
    await this.crearStock({ id_producto, id_local, cantidad: 0 });
    const sql = `UPDATE producto_sucursal_stock SET cantidad = ? WHERE id_producto = ? AND id_local = ?`;
    await query(sql, [cantidad, id_producto, id_local]);
  }

  async transferirStock(id_producto, id_local_origen, id_local_destino, cantidad) {

    const stockOrigen = await this.obtenerStock(id_producto, id_local_origen);

    if (stockOrigen < cantidad) {
      throw new Error(`Stock insuficiente. Disponible: ${stockOrigen}`);
    }

    await query(
      'UPDATE producto_sucursal_stock SET cantidad = cantidad - ? WHERE id_producto = ? AND id_local = ?',
      [cantidad, id_producto, id_local_origen]
    );
    await query(
      'UPDATE producto_sucursal_stock SET cantidad = cantidad + ? WHERE id_producto = ? AND id_local = ?',
      [cantidad, id_producto, id_local_destino]
    );

    return { success: true, message: 'Transferencia exitosa' };
  }

  async obtenerStock(id_producto, id_local) {
    const rows = await query(
      'SELECT cantidad FROM producto_sucursal_stock WHERE id_producto = ? AND id_local = ?',
      [id_producto, id_local]
    );
    return rows[0]?.cantidad || 0;
  }

  async obtenerStock(id_producto, id_local) {
    const rows = await query(
      'SELECT cantidad FROM producto_sucursal_stock WHERE id_producto = ? AND id_local = ?',
      [id_producto, id_local]
    );
    return rows[0]?.cantidad || 0;
  }

  async obtenerStockPorSucursales(id_producto, userId) {
    const sql = `
      SELECT 
        l.id_local, l.nombre_local, l.direccion, l.telefono,
        COALESCE(pss.cantidad, 0) as stock, ul.es_activo
      FROM usuario_local ul
      INNER JOIN local l ON ul.id_local = l.id_local
      LEFT JOIN producto_sucursal_stock pss ON l.id_local = pss.id_local AND pss.id_producto = ?
      WHERE ul.id_usuario = ? AND l.activo = 'Si'
      ORDER BY l.id_local
    `;
    return await query(sql, [id_producto, userId]);
  }

  async obtenerStockTodasSucursales(id_producto) {
    const sql = `
      SELECT 
        l.id_local, l.nombre_local, l.direccion,
        COALESCE(pss.cantidad, 0) as stock, pss.activo
      FROM local l
      LEFT JOIN producto_sucursal_stock pss ON pss.id_local = l.id_local AND pss.id_producto = ?
      WHERE l.activo = 'Si'
      ORDER BY l.nombre_local
    `;
    return await query(sql, [id_producto]);
  }

  async desactivarEnLocal(id_producto, id_local) {
    const sql = `UPDATE producto_sucursal_stock SET activo = 'No', cantidad = 0 WHERE id_producto = ? AND id_local = ?`;
    await query(sql, [id_producto, id_local]);
  }

  // ============ ESTADO DEL PRODUCTO ============

  async activarProducto(id_producto) {
    const result = await query('UPDATE producto SET activo = "Si" WHERE id_producto = ?', [id_producto]);
    return result.affectedRows;
  }

  async desactivarProducto(id_producto) {
    const result = await query('UPDATE producto SET activo = "No" WHERE id_producto = ?', [id_producto]);
    return result.affectedRows;
  }

  // ============ BÚSQUEDA ============

  async buscarProductosEnSucursales(busqueda) {
    const searchPattern = `%${busqueda}%`;
    const sql = `
      SELECT p.id_producto, p.cod_producto, p.descripcion, p.precio, p.imagen,
        JSON_ARRAYAGG(JSON_OBJECT(
          'id_local', l.id_local, 'nombre_local', l.nombre_local, 
          'stock', COALESCE(pss.cantidad, 0), 'direccion', l.direccion
        )) as sucursales
      FROM producto p
      CROSS JOIN local l
      LEFT JOIN producto_sucursal_stock pss ON p.id_producto = pss.id_producto AND l.id_local = pss.id_local
      WHERE p.activo = 'Si' AND l.activo = 'Si'
        AND (p.cod_producto LIKE ? OR p.descripcion LIKE ?)
      GROUP BY p.id_producto, p.cod_producto, p.descripcion, p.precio, p.imagen
      LIMIT 20
    `;
    const results = await query(sql, [searchPattern, searchPattern]);
    return results.map(r => ({ ...r, sucursales: JSON.parse(r.sucursales) }));
  }

  // ============ SUCURSALES DEL USUARIO ============

  async obtenerSucursalesUsuario(userId) {
    const sql = `
      SELECT DISTINCT
        l.id_local, l.nombre_local, l.direccion, l.telefono, l.ciudad, l.activo
      FROM local l
      LEFT JOIN usuario_local ul ON ul.id_local = l.id_local
      WHERE l.activo = 'Si' AND (ul.id_usuario = ? OR ? IS NULL)
      ORDER BY l.nombre_local
    `;
    return await query(sql, [userId, userId]);
  }

  async findByCodigo(cod_producto) {
    const rows = await query('SELECT id_producto FROM producto WHERE cod_producto = ?', [cod_producto]);
    return rows[0] || null;
  }

  async findByCodigoExcludingId(cod_producto, id_producto) {
    const rows = await query(
      'SELECT id_producto FROM producto WHERE cod_producto = ? AND id_producto != ?',
      [cod_producto, id_producto]
    );
    return rows[0] || null;
  }
}



module.exports = new ProductoModel();