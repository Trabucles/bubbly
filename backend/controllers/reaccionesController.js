const Reaccion = require('../models/Reaccion');
const Usuario = require('../models/Usuario');

// Peso de cada reacción para el Aura Score
const PESOS = {
  '❤️': 10,
  '👍':  6,
  '🔥':  8,
  '👀':  3,
  '😭': -2,
  '🤮': -8,
};

// Calcular tipo de aura según distribución de reacciones
const calcularAura = (conteo) => {
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);
  if (total === 0) return 'nueva';

  const pct = (tipo) => (conteo[tipo] || 0) / total;

  if (pct('❤️') >= 0.4) return 'popular';
  if (pct('🔥') >= 0.4) return 'legendaria';
  if (pct('👀') >= 0.4) return 'misteriosa';
  if (pct('🤮') >= 0.4) return 'toxica';
  if (pct('😭') >= 0.4) return 'caotica';
  if (pct('👍') >= 0.4) return 'inteligente';

  // Si hay mezcla, el score total decide
  const score = Object.entries(conteo).reduce((sum, [tipo, cant]) => sum + (PESOS[tipo] || 0) * cant, 0);
  if (score >= 100) return 'legendaria';
  if (score >= 50)  return 'popular';
  if (score >= 20)  return 'inteligente';
  if (score >= 0)   return 'misteriosa';
  if (score >= -30) return 'caotica';
  return 'toxica';
};

// POST /api/reacciones — enviar o cambiar reacción
const enviarReaccion = async (req, res) => {
  try {
    const emisorId = req.usuario._id;
    const { receptorId, tipo } = req.body;

    if (!receptorId || !tipo) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
    }
    if (emisorId.toString() === receptorId) {
      return res.status(400).json({ ok: false, mensaje: 'No puedes reaccionar a tu propio perfil' });
    }
    if (!Object.keys(PESOS).includes(tipo)) {
      return res.status(400).json({ ok: false, mensaje: 'Tipo de reacción inválido' });
    }

    // Insertar o actualizar reacción (upsert)
    await Reaccion.findOneAndUpdate(
      { emisorId, receptorId },
      { tipo, actualizadoEn: Date.now() },
      { upsert: true, new: true }
    );

    // Recalcular Aura Score del receptor
    const todasLasReacciones = await Reaccion.find({ receptorId });

    const conteo = {};
    let score = 0;
    todasLasReacciones.forEach(r => {
      conteo[r.tipo] = (conteo[r.tipo] || 0) + 1;
      score += PESOS[r.tipo] || 0;
    });

    const tipoAura = calcularAura(conteo);
    const auraScore = Math.max(0, score);

    // Actualizar receptor en BD
    await Usuario.findByIdAndUpdate(receptorId, { auraScore, tipoAura });

    res.json({
      ok: true,
      mensaje: 'Reacción registrada',
      auraScore,
      tipoAura
    });

  } catch (error) {
    console.error('Error en reacción:', error);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

// GET /api/reacciones/:receptorId — obtener reacción actual del usuario hacia alguien
const obtenerMiReaccion = async (req, res) => {
  try {
    const reaccion = await Reaccion.findOne({
      emisorId: req.usuario._id,
      receptorId: req.params.receptorId
    });
    res.json({ ok: true, reaccion: reaccion ? reaccion.tipo : null });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

module.exports = { enviarReaccion, obtenerMiReaccion };