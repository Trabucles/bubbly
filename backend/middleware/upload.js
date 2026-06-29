const multer = require('multer');

// Guardar en memoria (no en disco) para enviarlo a Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o GIF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // máx 5MB por foto
});

module.exports = upload;