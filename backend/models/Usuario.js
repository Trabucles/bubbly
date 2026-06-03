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
    maxlength: [30, 'Máximo 30 caracteres']
  },
  carrera: {
    type: String,
    required: [true, 'La carrera es obligatoria'],
    trim: true
  },
  descripcion: {
    type: String,
    default: '',
    maxlength: [150, 'Máximo 150 caracteres']
  },
  foto: {
    type: String,
    default: '' // URL de la foto de perfil
  },

  // Identidad anónima en ticker/reacciones
  avatarAnonimo: {
    type: String,
    enum: ['gato', 'zorro', 'pulpo', 'oso'],
    required: true
  },
  colorAnonimo: {
    type: String,
    enum: ['violeta', 'azul', 'rosa', 'naranja'],
    required: true
  },

  // Sistema de Auras
  auraScore: {
    type: Number,
    default: 0
  },
  tipoAura: {
    type: String,
    enum: ['legendaria', 'misteriosa', 'caotica', 'popular', 'toxica', 'inteligente', 'nueva'],
    default: 'nueva'
  },

  // Metadata
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
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
