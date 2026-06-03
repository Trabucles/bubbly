const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Generar token JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/registro
const registro = async (req, res) => {
  try {
    const { email, password, apodo, carrera, descripcion, avatarAnonimo, colorAnonimo } = req.body;

    // Validar campos requeridos
    if (!email || !password || !apodo || !carrera || !avatarAnonimo || !colorAnonimo) {
      return res.status(400).json({ ok: false, mensaje: 'Todos los campos son obligatorios' });
    }

    // Verificar si el email ya existe
    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(400).json({ ok: false, mensaje: 'Este correo ya está registrado' });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      email,
      password,
      apodo,
      carrera,
      descripcion: descripcion || '',
      avatarAnonimo,
      colorAnonimo
    });

    const token = generarToken(usuario._id);

    res.status(201).json({
      ok: true,
      mensaje: '¡Bienvenido a Bubbly!',
      token,
      usuario: {
        id: usuario._id,
        apodo: usuario.apodo,
        carrera: usuario.carrera,
        tipoAura: usuario.tipoAura,
        avatarAnonimo: usuario.avatarAnonimo,
        colorAnonimo: usuario.colorAnonimo
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario (incluir password que está oculto por select:false)
    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos' });
    }

    // Verificar contraseña
    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos' });
    }

    const token = generarToken(usuario._id);

    res.json({
      ok: true,
      mensaje: '¡Hola de nuevo!',
      token,
      usuario: {
        id: usuario._id,
        apodo: usuario.apodo,
        carrera: usuario.carrera,
        tipoAura: usuario.tipoAura,
        auraScore: usuario.auraScore,
        avatarAnonimo: usuario.avatarAnonimo,
        colorAnonimo: usuario.colorAnonimo,
        foto: usuario.foto
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

// GET /api/auth/yo  (ruta protegida - obtener usuario actual)
const obtenerYo = async (req, res) => {
  res.json({
    ok: true,
    usuario: {
      id: req.usuario._id,
      apodo: req.usuario.apodo,
      carrera: req.usuario.carrera,
      descripcion: req.usuario.descripcion,
      foto: req.usuario.foto,
      tipoAura: req.usuario.tipoAura,
      auraScore: req.usuario.auraScore,
      avatarAnonimo: req.usuario.avatarAnonimo,
      colorAnonimo: req.usuario.colorAnonimo
    }
  });
};

module.exports = { registro, login, obtenerYo };
