const express = require('express');
const router = express.Router();
const { obtenerMensajes, publicarMensaje, borrarMensaje } = require('../controllers/tickerController');
const { proteger } = require('../middleware/auth');

// Todas las rutas del ticker requieren autenticación
router.get('/', proteger, obtenerMensajes);
router.post('/', proteger, publicarMensaje);
router.delete('/:id', proteger, borrarMensaje);

module.exports = router;