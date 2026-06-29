const express = require('express');
const router = express.Router();
const { enviarReaccion, obtenerMiReaccion } = require('../controllers/reaccionesController');
const { proteger } = require('../middleware/auth');

router.post('/', proteger, enviarReaccion);
router.get('/:receptorId', proteger, obtenerMiReaccion);

module.exports = router;