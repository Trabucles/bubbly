const mongoose = require('mongoose');

const reaccionSchema = new mongoose.Schema({
  emisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  receptorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  tipo: {
    type: String,
    enum: ['❤️', '👍', '🔥', '👀', '😭', '🤮'],
    required: true
  },
  creadoEn: { type: Date, default: Date.now },
  actualizadoEn: { type: Date, default: Date.now }
});

// Un usuario solo puede tener UNA reacción por receptor
reaccionSchema.index({ emisorId: 1, receptorId: 1 }, { unique: true });

module.exports = mongoose.model('Reaccion', reaccionSchema);