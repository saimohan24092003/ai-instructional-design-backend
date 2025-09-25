import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { httpLogger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import OAuth configuration
import './config/passport.js';

// Import routes
import chatRouter from './routes/chat.js';
import authRouter from './routes/auth.js';
import strategyRouter from './routes/strategy.js';
import contentRouter from './routes/content.js';
import legacyEndpointsRouter from './routes/legacy-endpoints.js';

// Create Express app FIRST
const app = express();

// Security headers
app.use(helmet());

// CORS configuration - Allow requests from multiple origins including local files
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman, or local files)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      env.frontendOrigin,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];

    // Allow file:// protocol for local development
    if (origin.startsWith('file://')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // For development, be more permissive with localhost
    if (env.nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    return callback(null, true); // Allow all origins in development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Body parser with increased limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration for OAuth
app.use(session({
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logger
app.use(httpLogger);

// Basic healthcheck endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes (defined AFTER app creation)
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/strategy', strategyRouter);
app.use('/api/content', contentRouter);
app.use('/api', legacyEndpointsRouter);

// Error handler
app.use(errorHandler);

// REMOVE the duplicate app.listen() - this is handled in server.js

export default app;
