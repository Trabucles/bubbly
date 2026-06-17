const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  // Datos de cuenta
  email: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [100, 'Correo demasiado largo'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de correo inválido']
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'Mínimo 6 caracteres'],
    select: false // nunca se devuelve en queries
  },

  // Perfil público
  apodo: {
    type: String,
    required: [true, 'El apodo es obligatorio'],
    trim: true,
    minlength: [2, 'Mínimo 2 caracteres'],
    maxlength: [30, 'Máximo 30 caracteres']
  },
  carrera: {
    type: String,
    required: [true, 'La carrera es obligatoria'],
    trim: true,
    maxlength: [100, 'Máximo 100 caracteres']
  },
  descripcion: {
    type: String,
    default: '',
    maxlength: [150, 'Máximo 150 caracteres']
  },
  foto: {
    type: String,
    default: ''
  },

  // Identidad anónima — SOLO COLOR (sin avatar)
  colorAnonimo: {
    type: String,
    enum: {
      values: ['violeta', 'azul', 'rosa', 'naranja'],
      message: 'Color inválido'
    },
    required: [true, 'El color anónimo es obligatorio']
  },

  // Sistema de Auras
  auraScore: {
    type: Number,
    default: 0,
    min: 0
  },
  tipoAura: {
    type: String,
    enum: ['legendaria', 'misteriosa', 'caotica', 'popular', 'toxica', 'inteligente', 'nueva'],
    default: 'nueva'
  },

  // Temporada actual
  temporadaActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Temporada',
    default: null
  },

  activo: {
    type: Boolean,
    default: true
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

// Hash password antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12); // 12 saltos = más seguro
  next();
});

// Comparar contraseñas
usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);