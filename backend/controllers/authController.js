const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const sanitizar = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>"'`]/g, '').substring(0, 500);
};

const esEmailValido = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 100;
};

const esValorPermitido = (valor, lista) => lista.includes(valor);
const COLORES_VALIDOS = ['violeta', 'azul', 'rosa', 'naranja'];

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const registro = async (req, res) => {
  try {
    const email = sanitizar(req.body.email || '').toLowerCase();
    const password = (req.body.password || '').trim();
    const apodo = sanitizar(req.body.apodo || '');
    const carrera = sanitizar(req.body.carrera || '');
    const descripcion = sanitizar(req.body.descripcion || '');
    const colorAnonimo = sanitizar(req.body.colorAnonimo || '');

    if (!email || !password || !apodo || !carrera || !colorAnonimo) {
      return res.status(400).json({ ok: false, mensaje: 'Todos los campos son obligatorios' });
    }
    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, mensaje: 'Formato de correo inválido' });
    }
    if (password.length < 6 || password.length > 100) {
      return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener entre 6 y 100 caracteres' });
    }
    if (apodo.length < 2 || apodo.length > 30) {
      return res.status(400).json({ ok: false, mensaje: 'El apodo debe tener entre 2 y 30 caracteres' });
    }
    if (!esValorPermitido(colorAnonimo, COLORES_VALIDOS)) {
      return res.status(400).json({ ok: false, mensaje: 'Color anónimo inválido' });
    }

    const existente = await Usuario.findOne({ email });
    if (existente) {
      return res.status(400).json({ ok: false, mensaje: 'Este correo ya está registrado' });
    }

    const usuario = await Usuario.create({
      email, password, apodo, carrera,
      descripcion: descripcion.substring(0, 150),
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
        descripcion: usuario.descripcion,
        tipoAura: usuario.tipoAura,
        auraScore: usuario.auraScore,
        colorAnonimo: usuario.colorAnonimo,
        fotos: usuario.fotos || []
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const email = sanitizar(req.body.email || '').toLowerCase();
    const password = (req.body.password || '').trim();

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Correo y contraseña son requeridos' });
    }
    if (!esEmailValido(email)) {
      return res.status(400).json({ ok: false, mensaje: 'Formato de correo inválido' });
    }

    const usuario = await Usuario.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos' });
    }

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
        descripcion: usuario.descripcion,
        tipoAura: usuario.tipoAura,
        auraScore: usuario.auraScore,
        colorAnonimo: usuario.colorAnonimo,
        fotos: usuario.fotos || []
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

// GET /api/auth/yo — ahora SÍ incluye fotos
const obtenerYo = async (req, res) => {
  res.json({
    ok: true,
    usuario: {
      id: req.usuario._id,
      apodo: req.usuario.apodo,
      carrera: req.usuario.carrera,
      descripcion: req.usuario.descripcion,
      tipoAura: req.usuario.tipoAura,
      auraScore: req.usuario.auraScore,
      colorAnonimo: req.usuario.colorAnonimo,
      fotos: req.usuario.fotos || []
    }
  });
};

module.exports = { registro, login, obtenerYo };