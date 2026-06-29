const express = require('express');
const router = express.Router();
const { obtenerUsuarios } = require('../controllers/usuariosController');
const { proteger } = require('../middleware/auth');

router.get('/', proteger, obtenerUsuarios);

module.exports = router;