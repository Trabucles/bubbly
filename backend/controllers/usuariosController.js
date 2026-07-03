const Usuario = require('../models/Usuario');

// GET /api/usuarios — obtener todos los usuarios para el mapa
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find({ activo: true })
      .select('apodo carrera descripcion tipoAura auraScore fotos colorAnonimo')
      .sort({ auraScore: -1 });

    res.json({ ok: true, usuarios });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener usuarios' });
  }
};

module.exports = { obtenerUsuarios };