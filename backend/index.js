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

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // React/Vite dev servers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Global middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-session-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.database.mongoUri,
    collectionName: 'sessions',
    ttl: parseInt(process.env.SESSION_MAX_AGE) / 1000 || 86400 // 24 hours
  }),
  cookie: {
    httpOnly: true, // Prevent XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 86400000 // 24 hours
  },
  name: 'pcr_poa_session' // Custom session name
}));

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
    // Connect to database
    await database.connect();
    
    // Start listening
    const server = app.listen(config.port, () => {
      console.log('🚀 MERN Multi-Step Signup Backend Started');
      console.log(`📡 Server running on http://localhost:${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📊 Database: ${database.isConnected() ? '✅ Connected' : '❌ Disconnected'}`);
      console.log(`🔐 JWT: ${config.jwt.secret ? '✅ Configured' : '⚠️ Using fallback'}`);
      console.log('📋 Available Endpoints:');
      console.log('   ===== HEALTH & INFO =====');
      console.log('   GET  / - Health check & API info');
      console.log('');
      console.log('   ===== SIGNUP FLOW =====');
      console.log('   POST /auth/request-mobile-otp - Request mobile OTP');
      console.log('   POST /auth/verify-mobile-otp - Verify mobile OTP');
      console.log('   POST /auth/aadhaar/initiate - Initiate Aadhaar verification');
      console.log('   POST /auth/aadhaar/verify - Verify Aadhaar OTP & create account');
      console.log('   POST /auth/resend-otp - Resend OTP');
      console.log('');
      console.log('   ===== LOGIN FLOW =====');
      console.log('   POST /auth/login - Initiate login (Aadhaar or User ID)');
      console.log('   POST /auth/verify-login-otp - Verify login OTP');
      console.log('   POST /auth/login-password - Login with User ID & password');
      console.log('   POST /auth/authority/login - Authority login');
      console.log('   GET  /auth/session - Get current session info');
      console.log('   POST /auth/logout - Logout (destroys session)');
      console.log('');
      console.log('   ===== USER ROUTES =====');
      console.log('   GET  /users/profile - Get user profile');
      console.log('   PUT  /users/profile - Update user profile');
      console.log('   GET  /users/dashboard - Get dashboard data');
      console.log('   GET  /users/stats - Get account statistics');
      console.log('   GET  /users/validate-token - Validate JWT token');
      console.log('   POST /users/deactivate - Deactivate account');
      console.log('');
      console.log('   ===== AUTHORITY ROUTES =====');
      console.log('   POST /authority/login - Authority login (alternative)');
      console.log('   GET  /authority/dashboard - Authority dashboard with real stats');
      console.log('   GET  /authority/applications/pending - Get real pending applications');
      console.log('   GET  /authority/applications/:id - Get application details & history');
      console.log('   POST /authority/applications/:id/review - Review/forward applications');
      console.log('   GET  /authority/forwarding-options - Get valid forwarding targets');
      console.log('   POST /authority/applications/create-test - Create test application');
      console.log('   POST /authority/create - Create new authority (admin only)');
      console.log('   GET  /authority/list - List all authorities (admin only)');
      console.log('');
      console.log('🧪 Testing Notes:');
      console.log('   - All OTPs are logged to console for testing');
      console.log('   - Aadhaar verification is fully mocked');
      console.log('   - Session-based authentication (no JWT tokens needed)');
      console.log('   - Mobile format: +91XXXXXXXXXX');
      console.log('   - Aadhaar format: 12 digits, not starting with 0 or 1');
      console.log('   - Authority login: Use predefined designations');
      console.log('   - Cookie-based sessions with 24hr expiry');
      console.log('');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();