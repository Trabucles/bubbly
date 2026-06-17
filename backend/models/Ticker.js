const mongoose = require('mongoose');

const tickerSchema = new mongoose.Schema({
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  colorAnonimo: {
    type: String,
    enum: ['violeta', 'azul', 'rosa', 'naranja'],
    required: true
  },
  texto: {
    type: String,
    required: true,
    maxlength: [140, 'Máximo 140 caracteres'],
    trim: true
  },
  creadoEn: {
    type: Date,
    default: Date.now,
    // TTL: se borra automáticamente después de 24 horas
    expires: 86400
  }
});

module.exports = mongoose.model('Ticker', tickerSchema);