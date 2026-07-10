require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

const corsOptions = {
  origin: '*', // Esto permite que tu frontend en Railway se comunique con el backend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' fonts.googleapis.com fonts.gstatic.com res.cloudinary.com; img-src 'self' data: res.cloudinary.com;");
  next();
});

const requestCounts = new Map();
app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = requestCounts.get(ip) || { count: 0, start: now };
  if (now - entry.start > 60000) { entry.count = 1; entry.start = now; }
  else entry.count++;
  requestCounts.set(ip, entry);
  if (entry.count > 30) return res.status(429).json({ ok: false, mensaje: 'Demasiadas solicitudes.' });
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// --- CORRECCIÓN FINAL ---
// Subimos un nivel (..) desde backend para llegar a frontend
app.use(express.static(path.resolve(__dirname, '..', 'frontend')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ticker', require('./routes/ticker'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/reacciones', require('./routes/reacciones'));
app.use('/api/perfil', require('./routes/perfil'));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'frontend', 'pages', 'login.html'));
});
// -----------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🫧 Bubbly corriendo en el puerto ${PORT}`);
});