require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// --- RUTA ESTATICA GLOBAL ---
// Servimos todo el contenido de la carpeta 'frontend' que está al mismo nivel que 'backend'
app.use(express.static(path.join(__dirname, '../frontend')));

// --- RUTAS API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ticker', require('./routes/ticker'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/reacciones', require('./routes/reacciones'));
app.use('/api/perfil', require('./routes/perfil'));

// --- RUTA FALLBACK (SPA) ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🫧 Bubbly corriendo en el puerto ${PORT}`);
});