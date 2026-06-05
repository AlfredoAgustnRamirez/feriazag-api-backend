const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro';

const verificarToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    req.usuario.id_usuario = decoded.id_usuario || decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
};

module.exports = { verificarToken };