/**
 * MERN Multi-Step Signup Backend Server
 * Handles multi-step user signup with mobile OTP and Aadhaar verification
 * 
 * Flow:
 * 1. Mobile OTP Request/Verification
 * 2. Aadhaar OTP Initiation/Verification (Mocked)
 * 3. User Account Creation
 * 4. Session-based Login System
 * 5. Authority Access Management
 */

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./config');
const database = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const authorityRoutes = require('./routes/authority');
const applicationRoutes = require('./routes/applications');
const documentRoutes = require('./routes/documents');

// Initialize Express app
const app = express();

// Trust proxy - Required for Render/Heroku/Railway deployments
app.set('trust proxy', 1);

// CORS configuration - Environment-aware
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = isProduction 
  ? [
      'https://curly-potato-two.vercel.app',
      'https://curly-potato-tzpc.onrender.com'
    ]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Global middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration - Environment-aware for cross-origin support
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.database.mongoUri,
    collectionName: 'sessions',
    ttl: parseInt(process.env.SESSION_MAX_AGE) / 1000 || 86400 // 24 hours
  }),
  cookie: {
    httpOnly: true,
    // For cross-origin requests (localhost frontend to production backend)
    // secure must be true and sameSite must be 'none'
    secure: isProduction, // true in production (HTTPS required)
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24 hours
  },
  name: 'pcr_poa_session'
};

app.use(session(sessionConfig));
console.log(`Session configured - Production: ${isProduction}, Secure: ${sessionConfig.cookie.secure}, SameSite: ${sessionConfig.cookie.sameSite}`);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MERN Multi-Step Signup Backend API',
    version: config.app.apiVersion,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: database.isConnected() ? 'connected' : 'disconnected',
    endpoints: {
      auth: {
        // Signup
        requestMobileOTP: 'POST /auth/request-mobile-otp',
        verifyMobileOTP: 'POST /auth/verify-mobile-otp',
        initiateAadhaar: 'POST /auth/aadhaar/initiate',
        verifyAadhaar: 'POST /auth/aadhaar/verify',
        resendOTP: 'POST /auth/resend-otp',
        // Login
        login: 'POST /auth/login',
        verifyLoginOTP: 'POST /auth/verify-login-otp',
        loginPassword: 'POST /auth/login-password',
        authorityLogin: 'POST /auth/authority/login',
        // Session
        sessionInfo: 'GET /auth/session',
        logout: 'POST /auth/logout'
      },
      users: {
        profile: 'GET /users/profile',
        updateProfile: 'PUT /users/profile',
        dashboard: 'GET /users/dashboard',
        stats: 'GET /users/stats',
        validateToken: 'GET /users/validate-token',
        deactivate: 'POST /users/deactivate'
      },
      authority: {
        login: 'POST /authority/login',
        dashboard: 'GET /authority/dashboard',
        pendingApplications: 'GET /authority/applications/pending',
        applicationDetails: 'GET /authority/applications/:id',
        reviewApplication: 'POST /authority/applications/:id/review',
        forwardingOptions: 'GET /authority/forwarding-options',
        createTestApp: 'POST /authority/applications/create-test',
        createAuthority: 'POST /authority/create',
        listAuthorities: 'GET /authority/list'
      },
      applications: {
        create: 'POST /applications',
        myApplications: 'GET /applications/my-applications',
        getStatus: 'GET /applications/:id/status',
        update: 'PUT /applications/:id',
        delete: 'DELETE /applications/:id',
        uploadDocuments: 'POST /applications/:id/documents',
        getDocuments: 'GET /applications/:id/documents'
      },
      documents: {
        upload: 'POST /documents/upload',
        myDocuments: 'GET /documents/my-documents',
        applicationDocuments: 'GET /documents/application/:applicationId',
        linkDocument: 'POST /documents/:documentId/link/:applicationId',
        reusableDocuments: 'GET /documents/reusable',
        deleteDocument: 'DELETE /documents/:documentId',
        verifyDocument: 'POST /documents/:documentId/verify/:applicationId'
      }
    }
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/authority', authorityRoutes);
app.use('/applications', applicationRoutes);
app.use('/documents', documentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    requestedPath: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      // Auth endpoints
      'POST /auth/request-mobile-otp',
      'POST /auth/verify-mobile-otp',
      'POST /auth/aadhaar/initiate',
      'POST /auth/aadhaar/verify',
      'POST /auth/resend-otp',
      'POST /auth/login',
      'POST /auth/verify-login-otp',
      'POST /auth/login-password',
      'POST /auth/authority/login',
      'GET /auth/session',
      'POST /auth/logout',
      // User endpoints
      'GET /users/profile',
      'PUT /users/profile',
      'GET /users/dashboard',
      'GET /users/stats',
      'GET /users/validate-token',
      'POST /users/deactivate',
      // Authority endpoints
      'POST /authority/login',
      'GET /authority/dashboard',
      'GET /authority/applications/pending',
      'GET /authority/applications/:id',
      'POST /authority/applications/:id/review',
      'GET /authority/forwarding-options',
      'POST /authority/applications/create-test',
      'POST /authority/create',
      'GET /authority/list',
      // Application endpoints
      'POST /applications',
      'GET /applications/my-applications',
      'GET /applications/:id/status',
      'PUT /applications/:id',
      'DELETE /applications/:id',
      'POST /applications/:id/documents',
      'GET /applications/:id/documents'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Error Handler:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.message,
      code: 'VALIDATION_ERROR'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid data format',
      code: 'CAST_ERROR'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      code: 'DUPLICATE_ERROR'
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'SERVER_ERROR',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received. Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received. Shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    await database.connect();

    const PORT = config.port;
    const HOST = process.env.HOST || '0.0.0.0'; // Bind to 0.0.0.0 for deployment platforms

    app.listen(PORT, HOST, () => {
      console.log('🚀 MERN Multi-Step Signup Backend Started');
      console.log(`📡 Server running on ${HOST}:${PORT}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📊 Database: ${database.isConnected() ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`🔐 JWT: ${config.jwt.secret ? '✅ Configured' : '⚠️ Using fallback'}`);
      console.log(`🍪 Session: ${process.env.SESSION_SECRET ? '✅ Configured' : '⚠️ Using fallback'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();