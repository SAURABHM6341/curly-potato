/**
 * Data Verification Routes
 * Add these routes to backend/routes/authority.js
 */

// ===== DATA ENTRY VERIFICATION ROUTES (Level 1-2) =====

/**
 * Get applications pending data verification
 * GET /authority/data-verification/pending
 */
router.get('/data-verification/pending',
  requireAuthorityAuth,
  requireAccessLevel([1, 2]),  // Only for data entry operators
  AuthorityController.getPendingDataVerification
);

/**
 * Get single application details for verification
 * GET /authority/data-verification/:applicationId
 */
router.get('/data-verification/:applicationId',
  requireAuthorityAuth,
  requireAccessLevel([1, 2]),
  AuthorityController.getApplicationForVerification
);

/**
 * Verify application completeness and escalate
 * POST /authority/data-verification/:applicationId/verify
 */
router.post('/data-verification/:applicationId/verify',
  requireAuthorityAuth,
  requireAccessLevel([1, 2]),
  AuthMiddleware.validateRequest(['isComplete', 'comments']),
  AuthorityController.verifyAndEscalateApplication
);

/**
 * Get available reviewers for escalation
 * GET /authority/data-verification/escalation-options
 */
router.get('/data-verification/escalation-options',
  requireAuthorityAuth,
  requireAccessLevel([1, 2]),
  AuthorityController.getEscalationOptions
);
