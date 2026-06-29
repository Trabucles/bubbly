const express = require('express');
const router = express.Router();
const { actualizarPerfil, subirFoto, eliminarFoto } = require('../controllers/perfilController');
const { proteger } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.put('/', proteger, actualizarPerfil);
router.post('/foto', proteger, upload.single('foto'), subirFoto);
router.delete('/foto', proteger, eliminarFoto);

module.exports = router;
