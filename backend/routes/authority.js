/**
 * Authority Management Routes
 * Routes for authority-specific operations and administration
 * Clean routes using proper controller separation
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthorityController = require('../controllers/authorityController');
const AuthMiddleware = require('../middleware/authMiddleware');
const { requireAuthorityAuth, requireAccessLevel } = require('../middleware/sessionAuth');

// ===== AUTHORITY LOGIN (Alternative path) =====

/**
 * Authority login (alternative endpoint)
 * POST /authority/login
 */
router.post('/login',
  AuthMiddleware.validateRequest(['designation', 'password']),
  AuthController.authorityLogin
);

// ===== AUTHORITY DASHBOARD =====

/**
 * Authority dashboard - overview of pending applications
 * GET /authority/dashboard
 */
router.get('/dashboard', requireAuthorityAuth, AuthorityController.getDashboard);

// ===== APPLICATION MANAGEMENT =====

/**
 * Get pending applications for review
 * GET /authority/applications/pending
 */
router.get('/applications/pending', 
  requireAuthorityAuth, 
  requireAccessLevel(['reviewer', 'admin']),
  AuthorityController.getPendingApplications
);

/**
 * Get application details with full processing history
 * GET /authority/applications/:applicationId
 */
router.get('/applications/:applicationId',
  requireAuthorityAuth,
  AuthorityController.getApplicationDetails
);

/**
 * Review an application
 * POST /authority/applications/:applicationId/review
 */
router.post('/applications/:applicationId/review',
  requireAuthorityAuth,
  requireAccessLevel(['reviewer', 'admin']),
  AuthMiddleware.validateRequest(['action', 'comments']),
  AuthorityController.reviewApplication
);

/**
 * Create a test application (for demonstration)
 * POST /authority/applications/create-test
 */
router.post('/applications/create-test',
  requireAuthorityAuth,
  requireAccessLevel(['admin']),
  AuthorityController.createTestApplication
);

/**
 * Get forwarding options for current authority
 * GET /authority/forwarding-options
 */
router.get('/forwarding-options',
  requireAuthorityAuth,
  requireAccessLevel(['reviewer', 'admin']),
  AuthorityController.getForwardingOptions
);

// ===== AUTHORITY MANAGEMENT (Admin only) =====

/**
 * Create new authority account (Admin only)
 * POST /authority/create
 */
router.post('/create',
  requireAuthorityAuth,
  requireAccessLevel(['admin']),
  AuthMiddleware.validateRequest(['designation', 'department', 'accessLevel', 'password']),
  AuthorityController.createAuthority
);

/**
 * List all authorities (Admin only)
 * GET /authority/list
 */
router.get('/list',
  requireAuthorityAuth,
  requireAccessLevel(['admin']),
  AuthorityController.listAuthorities
);

module.exports = router;