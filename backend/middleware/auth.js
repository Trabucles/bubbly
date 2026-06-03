const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const proteger = async (req, res, next) => {
  let token;

  // Buscar token en headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ ok: false, mensaje: 'No autorizado, token requerido' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    req.usuario = await Usuario.findById(decoded.id);
    if (!req.usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario no encontrado' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ ok: false, mensaje: 'Token inválido o expirado' });
  }
};

module.exports = { proteger };
