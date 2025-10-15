/**
 * Document Routes
 * File upload and document management endpoints
 */

const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/documentController');
const { requireAuth, requireAuthorityAuth } = require('../middleware/sessionAuth');
const { upload } = require('../config/cloudinary');

// Middleware to allow both user and authority access
const requireUserOrAuthority = (req, res, next) => {
  // Check if user is logged in
  if (req.session.user?.userId) {
    return next();
  }
  
  // Check if authority is logged in
  if (req.session.authority?.designation) {
    return next();
  }
  
  return res.status(401).json({
    success: false,
    error: 'Authentication required',
    code: 'UNAUTHORIZED'
  });
};

/**
 * Upload Document
 * POST /documents/upload
 */
router.post('/upload',
  requireAuth,
  upload.single('document'), // Multer middleware with Cloudinary storage
  DocumentController.uploadDocument
);

/**
 * Get User's Documents
 * GET /documents/my-documents
 */
router.get('/my-documents',
  requireAuth,
  DocumentController.getMyDocuments
);

/**
 * Get Documents for Application (Both User and Authority access)
 * GET /documents/application/:applicationId
 */
router.get('/application/:applicationId',
  requireUserOrAuthority,
  DocumentController.getApplicationDocuments
);

/**
 * Link Existing Document to Application
 * POST /documents/:documentId/link/:applicationId
 */
router.post('/:documentId/link/:applicationId',
  requireAuth,
  DocumentController.linkDocumentToApplication
);

/**
 * Get Reusable Documents
 * GET /documents/reusable
 */
router.get('/reusable',
  requireAuth,
  DocumentController.getReusableDocuments
);

/**
 * Delete Document
 * DELETE /documents/:documentId
 */
router.delete('/:documentId',
  requireAuth,
  DocumentController.deleteDocument
);

/**
 * Verify Document (Authority only)
 * POST /documents/:documentId/verify/:applicationId
 */
router.post('/:documentId/verify/:applicationId',
  requireAuth,
  // TODO: Add authority permission middleware
  DocumentController.verifyDocument
);

module.exports = router;