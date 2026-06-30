require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sequelize, initDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const config = require('./config');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
});
app.use('/api', limiter);

// Request logging
app.use(logger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ===== API Routes =====

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: 'AI Interview Simulator API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Profile routes
app.use('/api/profile', require('./routes/profile'));

// Position routes
app.use('/api/positions', require('./routes/positions'));

// Question routes
app.use('/api/questions', require('./routes/questions'));

// Interview routes
app.use('/api/interviews', require('./routes/interviews'));

// Resume routes
app.use('/api/resumes', require('./routes/resumes'));

// Learning path routes
app.use('/api/learning', require('./routes/learning'));

// Project drill routes
app.use('/api/projects', require('./routes/projects'));

// Stats routes
app.use('/api/stats', require('./routes/stats'));

// Ranking routes
app.use('/api/rankings', require('./routes/rankings'));

// Message routes
app.use('/api/messages', require('./routes/messages'));

// ===== Admin Routes =====
app.use('/api/admin/dashboard', require('./routes/admin/dashboard'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/questions', require('./routes/admin/questions'));
app.use('/api/admin/interviews', require('./routes/admin/interviews'));
app.use('/api/admin/resumes', require('./routes/admin/resumes'));
app.use('/api/admin/messages', require('./routes/admin/messages'));
app.use('/api/admin/system', require('./routes/admin/system'));

// Swagger docs
try {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} catch (e) {
  console.log('[Swagger] Not configured, skipping');
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;

async function startServer() {
  try {
    // Connect to database
    await initDatabase();
    console.log('[Server] Database initialized');

    // Connect to Redis
    await connectRedis();
    console.log('[Server] Redis initialized');

    // Start listening
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log(`  AI Interview Simulator Server`);
      console.log(`  Environment: ${config.nodeEnv}`);
      console.log(`  Port: ${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log(`  Swagger: http://localhost:${PORT}/api-docs`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
