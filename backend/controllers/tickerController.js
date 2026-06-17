const Ticker = require('../models/Ticker');

const sanitizar = (str) => String(str).trim().replace(/[<>"'`]/g, '').substring(0, 140);

// GET /api/ticker — obtener últimos 200 mensajes
const obtenerMensajes = async (req, res) => {
  try {
    const mensajes = await Ticker.find()
      .sort({ creadoEn: -1 })
      .limit(200)
      .select('colorAnonimo texto creadoEn autorId');

    res.json({ ok: true, mensajes });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al obtener mensajes' });
  }
};

// POST /api/ticker — publicar mensaje
const publicarMensaje = async (req, res) => {
  try {
    const texto = sanitizar(req.body.texto || '');

    if (!texto || texto.length < 1) {
      return res.status(400).json({ ok: false, mensaje: 'El mensaje no puede estar vacío' });
    }

    const mensaje = await Ticker.create({
      autorId: req.usuario._id,
      colorAnonimo: req.usuario.colorAnonimo,
      texto
    });

    res.status(201).json({
      ok: true,
      mensaje: {
        _id: mensaje._id,
        colorAnonimo: mensaje.colorAnonimo,
        texto: mensaje.texto,
        creadoEn: mensaje.creadoEn,
        esPropio: true
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al publicar mensaje' });
  }
};

// DELETE /api/ticker/:id — borrar propio mensaje
const borrarMensaje = async (req, res) => {
  try {
    const mensaje = await Ticker.findById(req.params.id);

    if (!mensaje) {
      return res.status(404).json({ ok: false, mensaje: 'Mensaje no encontrado' });
    }

    // Solo el autor puede borrar su mensaje
    if (mensaje.autorId.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({ ok: false, mensaje: 'No puedes borrar mensajes de otros' });
    }

    await mensaje.deleteOne();
    res.json({ ok: true, mensaje: 'Mensaje eliminado' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar mensaje' });
  }
};

module.exports = { obtenerMensajes, publicarMensaje, borrarMensaje };