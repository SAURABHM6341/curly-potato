/**
 * Document Controller
 * Handles document upload, management and linking to applications
 */

const Document = require('../models/Document');
const Application = require('../models/Application');
const { getFileDetails, deleteFile } = require('../config/cloudinary');

class DocumentController {
  
  /**
   * Upload Documents
   * POST /documents/upload
   */
  static async uploadDocument(req, res) {
    try {
      const userId = req.session.user.userId;
      const { documentType, applicationIds: rawApplicationIds, comments } = req.body;
      
      // Parse applicationIds if it's a JSON string
      let applicationIds = [];
      if (rawApplicationIds) {
        try {
          applicationIds = typeof rawApplicationIds === 'string' 
            ? JSON.parse(rawApplicationIds) 
            : rawApplicationIds;
        } catch (parseError) {
          console.error('Error parsing applicationIds:', parseError);
          applicationIds = Array.isArray(rawApplicationIds) ? rawApplicationIds : [rawApplicationIds];
        }
      }
      
      console.log('📤 Upload Request - UserId:', userId);
      console.log('📤 Upload Request - DocumentType:', documentType);
      console.log('📤 Upload Request - ApplicationIds (parsed):', applicationIds);
      console.log('📤 Upload Request - File:', req.file ? 'Present' : 'Missing');
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
          code: 'NO_FILE'
        });
      }
      
      if (!documentType) {
        return res.status(400).json({
          success: false,
          error: 'Document type is required',
          code: 'MISSING_DOCUMENT_TYPE'
        });
      }
      
      // Log the Cloudinary response structure
      console.log('🔍 Multer File Object:', JSON.stringify(req.file, null, 2));
      
      // Get file details from Cloudinary response (req.file contains Cloudinary response)
      const fileDetails = {
        url: req.file.path || req.file.secure_url || req.file.url,
        publicId: req.file.filename || req.file.public_id,
        format: req.file.format || (req.file.mimetype ? req.file.mimetype.split('/')[1] : 'unknown'),
        bytes: req.file.size || req.file.bytes || 0
      };
      
      console.log('📋 Extracted File Details:', JSON.stringify(fileDetails, null, 2));
      
      // Validate required fields
      if (!fileDetails.url || !fileDetails.publicId) {
        console.error('❌ Missing required file details:', fileDetails);
        return res.status(400).json({
          success: false,
          error: 'Invalid file upload response from Cloudinary',
          code: 'INVALID_CLOUDINARY_RESPONSE',
          details: fileDetails
        });
      }
      
      // Create document record
      const document = new Document({
        userId,
        type: documentType,
        originalName: req.file.originalname,
        cloudinaryUrl: fileDetails.url,
        cloudinaryPublicId: fileDetails.publicId,
        fileFormat: fileDetails.format,
        fileSizeBytes: fileDetails.bytes,
        comments: comments || '',
        verificationHistory: [{
          action: 'uploaded',
          performedBy: userId,
          applicationId: 'INITIAL_UPLOAD',
          comments: `Document uploaded: ${req.file.originalname}`
        }]
      });
      
      console.log('📄 Document Object Before Save:', {
        documentId: document.documentId,
        type: document.type,
        cloudinaryUrl: document.cloudinaryUrl,
        cloudinaryPublicId: document.cloudinaryPublicId,
        fileFormat: document.fileFormat,
        fileSizeBytes: document.fileSizeBytes
      });
      
      // Link to applications if provided
      if (applicationIds && Array.isArray(applicationIds)) {
        for (const appId of applicationIds) {
          // Verify application exists and belongs to user
          const application = await Application.findOne({
            applicationId: appId,
            userId
          });
          
          if (application) {
            document.linkToApplication(appId, `Uploaded for ${application.schemeName || 'application'}`);
            
            // Add document reference to application
            const existingDoc = application.documents.find(doc => 
              doc.type === documentType && doc.documentId === document.documentId
            );
            
            if (!existingDoc) {
              application.documents.push({
                documentId: document.documentId,
                type: documentType,
                status: 'submitted',
                uploadedAt: new Date(),
                fileName: req.file.originalname,
                fileUrl: fileDetails.url
              });
              
              application.lastUpdated = new Date();
              await application.save();
            }
          }
        }
      }
      
      // Save the document first to generate documentId
      console.log('💾 Attempting to save document...');
      await document.save();
      console.log('✅ Document saved successfully with ID:', document.documentId);
      
      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        document: {
          documentId: document.documentId,
          type: document.type,
          originalName: document.originalName,
          url: document.cloudinaryUrl,
          linkedApplications: document.linkedApplications.length,
          uploadedAt: document.uploadedAt
        }
      });
      
    } catch (error) {
      console.error('Error uploading document:', error);
      
      // Clean up uploaded file from Cloudinary if document creation failed
      if (req.file && (req.file.public_id || req.file.filename)) {
        try {
          const publicId = req.file.public_id || req.file.filename;
          console.log('🧹 Cleaning up Cloudinary file:', publicId);
          await deleteFile(publicId);
        } catch (cleanupError) {
          console.error('Error cleaning up file from Cloudinary:', cleanupError);
        }
      }
      
      return res.status(500).json({
        success: false,
        error: 'Failed to upload document',
        code: 'UPLOAD_ERROR'
      });
    }
  }
  
  /**
   * Get User Documents
   * GET /documents/my-documents
   */
  static async getMyDocuments(req, res) {
    try {
      const userId = req.session.user.userId;
      const { type, applicationId } = req.query;
      
      let query = { userId };
      
      if (type) {
        query.type = type;
      }
      
      if (applicationId) {
        query['linkedApplications.applicationId'] = applicationId;
      }
      
      const documents = await Document.find(query)
        .sort({ uploadedAt: -1 })
        .select('-cloudinaryPublicId'); // Don't expose Cloudinary public ID
      
      return res.status(200).json({
        success: true,
        documents: documents.map(doc => ({
          documentId: doc.documentId,
          type: doc.type,
          originalName: doc.originalName,
          url: doc.cloudinaryUrl,
          fileFormat: doc.fileFormat,
          fileSizeBytes: doc.fileSizeBytes,
          overallStatus: doc.overallStatus,
          linkedApplications: doc.linkedApplications,
          uploadedAt: doc.uploadedAt,
          comments: doc.comments
        }))
      });
      
    } catch (error) {
      console.error('Error fetching user documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch documents',
        code: 'FETCH_ERROR'
      });
    }
  }
  
  /**
   * Link Document to Application
   * POST /documents/:documentId/link/:applicationId
   */
  static async linkDocumentToApplication(req, res) {
    try {
      const { documentId, applicationId } = req.params;
      const userId = req.session.user.userId;
      const { comments } = req.body;
      
      // Find document
      const document = await Document.findOne({
        documentId,
        userId
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND'
        });
      }
      
      // Find application
      const application = await Application.findOne({
        applicationId,
        userId
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }
      
      // Link document to application
      document.linkToApplication(applicationId, comments);
      await document.save();
      
      // Add document reference to application if not exists
      const existingDoc = application.documents.find(doc => 
        doc.documentId === documentId
      );
      
      if (!existingDoc) {
        application.documents.push({
          documentId: document.documentId,
          type: document.type,
          status: 'submitted',
          uploadedAt: new Date(),
          fileName: document.originalName,
          fileUrl: document.cloudinaryUrl
        });
        
        application.lastUpdated = new Date();
        await application.save();
      }
      
      return res.status(200).json({
        success: true,
        message: 'Document linked to application successfully'
      });
      
    } catch (error) {
      console.error('Error linking document to application:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to link document',
        code: 'LINK_ERROR'
      });
    }
  }
  
  /**
   * Get Reusable Documents (for new applications)
   * GET /documents/reusable
   */
  static async getReusableDocuments(req, res) {
    try {
      const userId = req.session.user.userId;
      const { types } = req.query; // Comma-separated document types
      
      let documentTypes = [];
      if (types) {
        documentTypes = types.split(',');
      }
      
      const documents = await Document.findReusableDocuments(userId, documentTypes);
      
      return res.status(200).json({
        success: true,
        documents: documents.map(doc => ({
          documentId: doc.documentId,
          type: doc.type,
          originalName: doc.originalName,
          url: doc.cloudinaryUrl,
          fileFormat: doc.fileFormat,
          overallStatus: doc.overallStatus,
          uploadedAt: doc.uploadedAt,
          linkedApplicationsCount: doc.linkedApplications.length
        }))
      });
      
    } catch (error) {
      console.error('Error fetching reusable documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch reusable documents',
        code: 'FETCH_ERROR'
      });
    }
  }
  
  /**
   * Delete Document
   * DELETE /documents/:documentId
   */
  static async deleteDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.session.user.userId;
      
      const document = await Document.findOne({
        documentId,
        userId
      });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND'
        });
      }
      
      // Check if document is linked to any active applications
      // Allow users to delete their own documents, but warn about active links
      const activeLinks = document.linkedApplications.filter(
        link => link.status === 'submitted' || link.status === 'pending'
      );
      
      console.log(`🗑️ Deleting document ${documentId} with ${activeLinks.length} active links`);
      
      // If there are active links, unlink them first
      if (activeLinks.length > 0) {
        // Remove the document links from applications
        for (const link of activeLinks) {
          try {
            const application = await Application.findOne({ applicationId: link.applicationId });
            if (application) {
              application.documents = application.documents.filter(
                doc => doc.documentId !== documentId
              );
              await application.save();
              console.log(`🔗 Unlinked document from application ${link.applicationId}`);
            }
          } catch (unlinkError) {
            console.error(`Error unlinking from application ${link.applicationId}:`, unlinkError);
          }
        }
      }
      
      // Delete from Cloudinary
      console.log(`🗑️ Deleting from Cloudinary: ${document.cloudinaryPublicId}`);
      try {
        await deleteFile(document.cloudinaryPublicId);
        console.log('✅ Cloudinary deletion successful');
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary deletion failed:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
      
      // Delete from database
      console.log(`🗑️ Deleting from database: ${documentId}`);
      await Document.deleteOne({ documentId });
      console.log('✅ Database deletion successful');
      
      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
        deletedDocumentId: documentId,
        activeLinksRemoved: activeLinks.length
      });
      
    } catch (error) {
      console.error('Error deleting document:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete document',
        code: 'DELETE_ERROR'
      });
    }
  }
  
  /**
   * Get Documents for Application (Authority/User access)
   * GET /documents/application/:applicationId
   */
  static async getApplicationDocuments(req, res) {
    try {
      const { applicationId } = req.params;
      const userId = req.session.user?.userId;
      const isAuthority = req.session.authority;
      
      // Check if user has access to this application
      if (!isAuthority) {
        const application = await Application.findOne({
          applicationId,
          userId
        });
        
        if (!application) {
          return res.status(404).json({
            success: false,
            error: 'Application not found or access denied',
            code: 'APPLICATION_NOT_FOUND'
          });
        }
      }
      
      // Get documents linked to this application
      const documents = await Document.find({
        'linkedApplications.applicationId': applicationId
      }).sort({ uploadedAt: -1 });
      
      // Format documents for response
      const formattedDocuments = documents.map(doc => {
        const appLink = doc.linkedApplications.find(link => link.applicationId === applicationId);
        return {
          documentId: doc.documentId,
          type: doc.type,
          originalName: doc.originalName,
          url: doc.cloudinaryUrl, // Map cloudinaryUrl to url for frontend compatibility
          fileSize: doc.fileSizeBytes,
          fileFormat: doc.fileFormat,
          uploadedAt: doc.uploadedAt,
          status: appLink ? appLink.status : doc.overallStatus,
          verificationComments: appLink ? appLink.verificationComments : '',
          verifiedBy: appLink ? appLink.verifiedBy : null,
          verifiedAt: appLink ? appLink.verifiedAt : null,
          linkedAt: appLink ? appLink.linkedAt : null
        };
      });
      
      res.json({
        success: true,
        documents: formattedDocuments,
        applicationId,
        totalDocuments: formattedDocuments.length
      });
      
    } catch (error) {
      console.error('Error fetching application documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch application documents',
        code: 'FETCH_ERROR'
      });
    }
  }
  
  /**
   * Verify Document (Authority only)
   * POST /documents/:documentId/verify/:applicationId
   */
  static async verifyDocument(req, res) {
    try {
      const { documentId, applicationId } = req.params;
      const { status, comments } = req.body; // status: 'verified' | 'rejected'
      const authorityId = req.session.user.userId;
      
      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be "verified" or "rejected"',
          code: 'INVALID_STATUS'
        });
      }
      
      const document = await Document.findOne({ documentId });
      
      if (!document) {
        return res.status(404).json({
          success: false,
          error: 'Document not found',
          code: 'DOCUMENT_NOT_FOUND'
        });
      }
      
      // Update verification status
      document.updateVerificationStatus(applicationId, status, authorityId, comments);
      await document.save();
      
      // Update application document status
      const application = await Application.findOne({ applicationId });
      if (application) {
        const appDoc = application.documents.find(doc => doc.documentId === documentId);
        if (appDoc) {
          appDoc.status = status;
          appDoc.verificationComments = comments;
          appDoc.verifiedBy = authorityId;
          appDoc.verifiedAt = new Date();
          
          application.lastUpdated = new Date();
          await application.save();
        }
      }
      
      return res.status(200).json({
        success: true,
        message: `Document ${status} successfully`
      });
      
    } catch (error) {
      console.error('Error verifying document:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify document',
        code: 'VERIFICATION_ERROR'
      });
    }
  }
}

module.exports = DocumentController;