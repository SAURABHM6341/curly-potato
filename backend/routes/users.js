/**
 * User Routes
 * Clean route definitions using controllers and middleware
 * Follows MVC architecture best practices - Session-based authentication
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const AuthMiddleware = require('../middleware/authMiddleware');
const { requireAuth } = require('../middleware/sessionAuth');

/**
 * Get User Profile
 * GET /users/profile
 */
router.get('/profile', 
  requireAuth,
  UserController.getProfile
);

/**
 * Update User Profile (Limited fields)
 * PUT /users/profile
 */
router.put('/profile',
  requireAuth,
  UserController.updateProfile
);

/**
 * Get Dashboard Data
 * GET /users/dashboard
 */
router.get('/dashboard',
  requireAuth,
  UserController.getDashboard
);

/**
 * Get Account Statistics
 * GET /users/stats
 */
router.get('/stats',
  requireAuth,
  UserController.getStats
);

/**
 * Validate Session (Health Check)
 * GET /users/validate-session
 */
router.get('/validate-session',
  requireAuth,
  UserController.validateSession
);

/**
 * Deactivate Account
 * POST /users/deactivate
 */
router.post('/deactivate',
  requireAuth,
  AuthMiddleware.validateRequest(['confirmation']),
  UserController.deactivateAccount
);

module.exports = router;