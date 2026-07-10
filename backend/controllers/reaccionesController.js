const Reaccion = require('../models/Reaccion');
const Usuario = require('../models/Usuario');

const PESOS = {
  '❤️': 10, '👍': 6, '🔥': 8, '👀': 3, '😭': -2, '🤮': -8,
};

const calcularAura = (conteo) => {
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);
  if (total === 0) return 'nueva';

  // Necesitamos mínimo 3 reacciones para clasificar
  if (total < 3) return 'nueva';

  const pct = (tipo) => (conteo[tipo] || 0) / total;

  // Positivas vs negativas
  const positivasPct = pct('❤️') + pct('👍') + pct('🔥');
  const negativasPct = pct('🤮') + pct('😭');

  // Tóxica: mayoría de vómitos
  if (pct('🤮') >= 0.5) return 'toxica';

  // Caótica: mezcla extrema (muchas positivas Y muchas negativas)
  if (positivasPct >= 0.3 && negativasPct >= 0.3) return 'caotica';

  // Legendaria: mayoría de fuego 🔥
  if (pct('🔥') >= 0.4) return 'legendaria';

  // Popular: mayoría de corazones ❤️
  if (pct('❤️') >= 0.4) return 'popular';

  // Misteriosa: mayoría de ojos 👀
  if (pct('👀') >= 0.4) return 'misteriosa';

  // Inteligente: mayoría de pulgar 👍
  if (pct('👍') >= 0.4) return 'inteligente';

  // Si hay más positivas que negativas
  if (positivasPct > negativasPct) {
    const score = Object.entries(conteo).reduce((sum, [tipo, cant]) => sum + (PESOS[tipo] || 0) * cant, 0);
    if (score >= 50) return 'legendaria';
    if (score >= 25) return 'popular';
    return 'inteligente';
  }

  // Si hay más negativas
  if (negativasPct > positivasPct) return 'toxica';

  return 'misteriosa';
};

// POST /api/reacciones — enviar o cambiar reacción
const enviarReaccion = async (req, res) => {
  try {
    const emisorId = req.usuario._id;
    const { receptorId, tipo } = req.body;

    if (!receptorId || !tipo) return res.status(400).json({ ok: false, mensaje: 'Faltan datos' });
    if (emisorId.toString() === receptorId) return res.status(400).json({ ok: false, mensaje: 'No puedes reaccionar a tu propio perfil' });
    if (!Object.keys(PESOS).includes(tipo)) return res.status(400).json({ ok: false, mensaje: 'Tipo de reacción inválido' });

    await Reaccion.findOneAndUpdate(
      { emisorId, receptorId },
      { tipo, actualizadoEn: Date.now() },
      { upsert: true, new: true }
    );

    const todasLasReacciones = await Reaccion.find({ receptorId });
    const conteo = {};
    let score = 0;
    todasLasReacciones.forEach(r => {
      conteo[r.tipo] = (conteo[r.tipo] || 0) + 1;
      score += PESOS[r.tipo] || 0;
    });

    const tipoAura = calcularAura(conteo);
    const auraScore = Math.max(0, score);
    await Usuario.findByIdAndUpdate(receptorId, { auraScore, tipoAura });

    // Verificar conexión mutua (❤️ de ambos lados)
    let conexion = false;
    if (tipo === '❤️') {
      const reaccionMutua = await Reaccion.findOne({
        emisorId: receptorId,
        receptorId: emisorId,
        tipo: '❤️'
      });
      if (reaccionMutua) conexion = true;
    }

    res.json({ ok: true, mensaje: 'Reacción registrada', auraScore, tipoAura, conexion });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

// GET /api/reacciones/:receptorId — reacción actual del usuario hacia alguien
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

// GET /api/reacciones/mis-reacciones — todas las reacciones que yo he recibido
const misReacciones = async (req, res) => {
  try {
    const reacciones = await Reaccion.find({ receptorId: req.usuario._id })
      .populate('emisorId', 'colorAnonimo')
      .sort({ actualizadoEn: -1 });

    const conteo = {};
    const lista = reacciones.map(r => ({
      tipo: r.tipo,
      colorAnonimo: r.emisorId ? r.emisorId.colorAnonimo : 'violeta'
    }));

    lista.forEach(r => { conteo[r.tipo] = (conteo[r.tipo] || 0) + 1; });

    res.json({ ok: true, reacciones: lista, conteo });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
};

module.exports = { enviarReaccion, obtenerMiReaccion, misReacciones };