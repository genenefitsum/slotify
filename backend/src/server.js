const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const { connectDb } = require('./config/db');
const env = require('./config/env');
const { errorHandler } = require('./common/middlewares/error');
const logger = require('./utils/logger');
const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const serviceRoutes = require('./routes/service.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const availabilityRoutes = require('./modules/availability/availability.routes');

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    const corsError = new Error('CORS policy does not allow this origin.');
    corsError.statusCode = 403;
    callback(corsError);
  },
};

const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitAuthMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(cors(corsOptions));
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/availability', availabilityRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'slotify-backend',
    env: env.nodeEnv,
  });
});

app.get('/api/ready', (req, res) => {
  const isReady = mongoose.connection.readyState === 1;
  if (!isReady) {
    return res.status(503).json({
      status: 'not_ready',
      service: 'slotify-backend',
      dbReady: false,
    });
  }

  return res.status(200).json({
    status: 'ready',
    service: 'slotify-backend',
    dbReady: true,
  });
});

app.use(errorHandler);

const PORT = env.port;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      logger.info('Backend server started', {
        port: PORT,
        env: env.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Failed to start backend', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();
