require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const { createSocketServer } = require('./socket/gameServer');

const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

const PORT = process.env.PORT || 8000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const SWAGGER_SERVER_URL =
  process.env.SWAGGER_SERVER_URL || `http://localhost:${PORT}`;

app.set('trust proxy', 1);
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.CLIENT_ORIGIN ||
  ''
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Postman/healthcheck kimi origin-siz request-lərə icazə ver
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Content-Disposition'], // fayl yükləmələri üçün faydalıdır
  })
);

// Preflight-ları rahatlaşdır
app.options('*', cors());

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'QuizOne API',
      version: '1.0.0',
      description: 'MERN layihəsi üçün Swagger/OpenAPI sənədləşdirməsi',
    },
    servers: [{ url: SWAGGER_SERVER_URL, description: 'Current' }],
    components: {
      securitySchemes: {
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

app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

const server = http.createServer(app);

// ⬇️ Socket.IO burada qurulur
createSocketServer(server);

server.listen(PORT, () =>
  console.log(`✅ HTTP + WS server running on ${PORT}`)
);
