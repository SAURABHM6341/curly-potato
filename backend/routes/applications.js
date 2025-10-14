/**
 * Application Routes
 * User-side application management endpoints
 * Session-based authentication required
 */

const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/applicationController');
const { requireAuth } = require('../middleware/sessionAuth');

/**
 * Create New Application
 * POST /applications
 */
router.post('/', 
  requireAuth,
  ApplicationController.createApplication
);

/**
 * Get User's Applications
 * GET /applications/my-applications
 */
router.get('/my-applications',
  requireAuth,
  ApplicationController.getMyApplications
);

/**
 * Get Application Status
 * GET /applications/:id/status
 */
router.get('/:id/status',
  requireAuth,
  ApplicationController.getApplicationStatus
);

/**
 * Update Application
 * PUT /applications/:id
 */
router.put('/:id',
  requireAuth,
  ApplicationController.updateApplication
);

/**
 * Delete Application
 * DELETE /applications/:id
 */
router.delete('/:id',
  requireAuth,
  ApplicationController.deleteApplication
);

/**
 * Upload Documents
 * POST /applications/:id/documents
 */
router.post('/:id/documents',
  requireAuth,
  ApplicationController.uploadDocuments
);

/**
 * Get Application Documents
 * GET /applications/:id/documents
 */
router.get('/:id/documents',
  requireAuth,
  ApplicationController.getDocuments
);

module.exports = router;