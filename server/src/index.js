const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { seedAdmin, seedPackages, seedDemoUsers } = require('./utils/seeder');

dotenv.config();

const app = express();

// Set request timeout
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);
  next();
});

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression()); // Compress all responses
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'];
      if (!origin || allowed.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    maxAge: 86400 // Cache preflight requests for 24 hours
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

// Routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const adminRoutes = require('./routes/admin');
const openaiRoutes = require('./routes/openai');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/openai', openaiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('[Error]', err.message || err);
  if (res.headersSent) {
    return next(err);
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ 
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

async function start() {
  await connectDB(process.env.MONGO_URI);
  await seedPackages();
  await seedAdmin();
  await seedDemoUsers();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();