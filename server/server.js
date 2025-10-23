// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// DB
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// --- Port & URLs ---
const PORT = process.env.PORT || 8000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const SWAGGER_SERVER_URL =
  process.env.SWAGGER_SERVER_URL || `http://localhost:${PORT}`;

// Proxy arxasında (prod-da secure cookie üçün vacib)
app.set('trust proxy', 1);

// --- CORS (cookie üçün credentials: true) ---
app.use(
  cors({
    origin: (origin, cb) => {
      // birdən çox origin dəstəyi üçün CSV
      const allowed = (process.env.CORS_ORIGINS || CLIENT_ORIGIN)
        .split(',')
        .map((s) => s.trim());
      // SSR/insomnia/postman origin = undefined
      if (!origin || allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// JSON & form
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser (session cookie oxumaq üçün)
app.use(cookieParser());

// Statik fayllar (avatar/upload üçün)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB qoşul
connectDB();

// ---- Swagger ----
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Is-Tap-Az API',
      version: '1.0.0',
      description: 'MERN layihəsi üçün Swagger/OpenAPI sənədləşdirməsi',
    },
    servers: [{ url: SWAGGER_SERVER_URL, description: 'Current' }],
    components: {
      securitySchemes: {
        // Qeyd: artıq cookie session işlədilir. BearerAuth qalsın (digər servislər üçün).
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./routes/authRoutes.js', './routes/userRoutes.js'],
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

// ---- Healthcheck (opsional) ----
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ---- Server ----
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI: ${SWAGGER_SERVER_URL}/api-docs`);
  console.log(
    `CORS allowed origin(s): ${process.env.CORS_ORIGINS || CLIENT_ORIGIN}`
  );
});
