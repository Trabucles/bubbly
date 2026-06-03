# 🫧 Bubbly — Red Social Universitaria

## Cómo correr el proyecto

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tus datos (el archivo ya tiene valores por defecto para desarrollo)
```

### 3. Asegúrate de tener MongoDB corriendo
```bash
# Si tienes MongoDB instalado localmente:
mongod

# O usa MongoDB Compass para iniciarlo
```

### 4. Correr el servidor
```bash
# Modo desarrollo (se reinicia automático con nodemon)
npm run dev

# Modo producción
npm start
```

### 5. Abrir en el navegador
```
http://localhost:3000/pages/login.html
```

---

## Estructura del proyecto
```
bubbly/
├── backend/
│   ├── config/
│   │   └── db.js              # Conexión MongoDB
│   ├── controllers/
│   │   └── authController.js  # Lógica de login/registro
│   ├── middleware/
│   │   └── auth.js            # Verificación JWT
│   ├── models/
│   │   └── Usuario.js         # Modelo de usuario
│   ├── routes/
│   │   └── auth.js            # Rutas /api/auth/*
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Servidor principal
│
└── frontend/
    ├── css/
    │   └── global.css         # Estilos globales neón/oscuro
    └── pages/
        ├── login.html         # Login + Registro
        └── mapa.html          # Pantalla principal (próximo paso)
```

## API disponible

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/registro | Crear cuenta nueva |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/auth/yo | Ver usuario actual (requiere token) |
