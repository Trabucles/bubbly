const express = require('express');
const router = express.Router();
const { enviarReaccion, obtenerMiReaccion, misReacciones } = require('../controllers/reaccionesController');
const { proteger } = require('../middleware/auth');

router.post('/', proteger, enviarReaccion);
router.get('/mis-reacciones', proteger, misReacciones);
router.get('/:receptorId', proteger, obtenerMiReaccion);

module.exports = router;