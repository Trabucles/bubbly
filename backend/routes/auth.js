const express = require('express');
const router = express.Router();
const { registro, login, obtenerYo } = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);

// Rutas protegidas (requieren token)
router.get('/yo', proteger, obtenerYo);

module.exports = router;
