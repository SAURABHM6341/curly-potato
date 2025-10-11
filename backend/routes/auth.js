/**
 * Authentication Routes
 * Clean route definitions using controllers and middleware
 * Follows MVC architecture best practices
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');
const { requireAuth, requireAuthorityAuth } = require('../middleware/sessionAuth');

// ===== SIGNUP ROUTES =====

/**
 * Step 1: Request Mobile OTP
 * POST /auth/request-mobile-otp
 */
router.post('/request-mobile-otp', 
  AuthMiddleware.validateRequest(['mobile']),
  AuthController.requestMobileOTP
);

/**
 * Step 2: Verify Mobile OTP
 * POST /auth/verify-mobile-otp
 */
router.post('/verify-mobile-otp',
  AuthMiddleware.validateRequest(['mobile', 'otp', 'sessionId']),
  AuthController.verifyMobileOTP
);

/**
 * Step 3: Initiate Aadhaar Verification (Mocked)
 * POST /auth/aadhaar/initiate
 */
router.post('/aadhaar/initiate',
  AuthMiddleware.verifyTempToken,
  AuthMiddleware.validateRequest(['aadhaar']),
  AuthController.initiateAadhaarVerification
);

/**
 * Step 4: Verify Aadhaar OTP and Create User (Mocked)
 * POST /auth/aadhaar/verify
 */
router.post('/aadhaar/verify',
  AuthMiddleware.verifyTempToken,
  AuthMiddleware.validateRequest(['aadhaar', 'otp', 'sessionId']),
  AuthController.verifyAadhaarOTP
);

/**
 * Resend OTP endpoint
 * POST /auth/resend-otp
 */
router.post('/resend-otp',
  AuthMiddleware.validateRequest(['type', 'identifier']),
  AuthController.resendOTP
);

// ===== LOGIN ROUTES =====

/**
 * Step 1: Initiate login (works with Aadhaar or User ID)
 * POST /auth/login
 */
router.post('/login',
  AuthMiddleware.validateRequest(['identifier']),
  AuthController.initiateLogin
);

/**
 * Step 2a: Verify login OTP
 * POST /auth/verify-login-otp
 */
router.post('/verify-login-otp',
  AuthMiddleware.validateRequest(['identifier', 'otp', 'sessionId']),
  AuthController.verifyLoginOTP
);

/**
 * Step 2b: Password login (alternative to OTP)
 * POST /auth/login-password
 */
router.post('/login-password',
  AuthMiddleware.validateRequest(['loginUserId', 'password']),
  AuthController.loginWithPassword
);

// ===== AUTHORITY ROUTES =====

/**
 * Authority login
 * POST /auth/authority/login
 */
router.post('/authority/login',
  AuthMiddleware.validateRequest(['designation', 'password']),
  AuthController.authorityLogin
);

// ===== SESSION MANAGEMENT =====

/**
 * Get current session info
 * GET /auth/session
 */
router.get('/session', AuthController.getSessionInfo);

/**
 * Logout (works for both users and authorities)
 * POST /auth/logout
 */
router.post('/logout', AuthController.logout);

// ===== PROTECTED ROUTES (Examples) =====

/**
 * User-only protected route
 * GET /auth/user/profile
 */
router.get('/user/profile', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'User profile accessed',
    user: req.session.user
  });
});

/**
 * Authority-only protected route
 * GET /auth/authority/dashboard
 */
router.get('/authority/dashboard', requireAuthorityAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Authority dashboard accessed',
    authority: req.session.authority
  });
});

module.exports = router;