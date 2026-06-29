const Usuario = require('../models/Usuario');
const cloudinary = require('../config/cloudinary');

const sanitizar = (str) => String(str || '').trim().replace(/[<>"'`]/g, '').substring(0, 500);

// PUT /api/perfil — actualizar apodo y descripción
const actualizarPerfil = async (req, res) => {
  try {
    const apodo = sanitizar(req.body.apodo);
    const descripcion = sanitizar(req.body.descripcion);

    if (apodo && (apodo.length < 2 || apodo.length > 30)) {
      return res.status(400).json({ ok: false, mensaje: 'El apodo debe tener entre 2 y 30 caracteres' });
    }

    const campos = {};
    if (apodo) campos.apodo = apodo;
    if (descripcion !== undefined) campos.descripcion = descripcion.substring(0, 150);

    const usuario = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      campos,
      { new: true }
    );

    res.json({
      ok: true,
      mensaje: 'Perfil actualizado',
      usuario: {
        apodo: usuario.apodo,
        descripcion: usuario.descripcion,
        fotos: usuario.fotos,
        colorAnonimo: usuario.colorAnonimo,
        tipoAura: usuario.tipoAura,
        auraScore: usuario.auraScore
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al actualizar perfil' });
  }
};

// POST /api/perfil/foto — subir foto a Cloudinary
const subirFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, mensaje: 'No se recibió ninguna imagen' });
    }

    const usuario = await Usuario.findById(req.usuario._id);

    // Máximo 3 fotos
    if (usuario.fotos && usuario.fotos.length >= 3) {
      return res.status(400).json({ ok: false, mensaje: 'Máximo 3 fotos por perfil. Elimina una antes de subir otra.' });
    }

    // Subir a Cloudinary desde buffer de memoria
    const resultado = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `bubbly/usuarios/${req.usuario._id}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Guardar URL en el usuario
    const fotos = usuario.fotos || [];
    fotos.push(resultado.secure_url);

    await Usuario.findByIdAndUpdate(req.usuario._id, { fotos });

    res.json({
      ok: true,
      mensaje: 'Foto subida correctamente',
      url: resultado.secure_url,
      fotos
    });

  } catch (error) {
    console.error('Error subiendo foto:', error);
    res.status(500).json({ ok: false, mensaje: 'Error al subir la foto' });
  }
};

// DELETE /api/perfil/foto — eliminar una foto
const eliminarFoto = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ ok: false, mensaje: 'URL requerida' });

    const usuario = await Usuario.findById(req.usuario._id);
    const fotos = (usuario.fotos || []).filter(f => f !== url);

    // Eliminar de Cloudinary
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    try {
      await cloudinary.uploader.destroy(`bubbly/usuarios/${req.usuario._id}/${publicId}`);
    } catch(e) { /* si falla en Cloudinary igual eliminamos de BD */ }

    await Usuario.findByIdAndUpdate(req.usuario._id, { fotos });

    res.json({ ok: true, mensaje: 'Foto eliminada', fotos });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: 'Error al eliminar foto' });
  }
};

module.exports = { actualizarPerfil, subirFoto, eliminarFoto };