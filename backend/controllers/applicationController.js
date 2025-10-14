/**
 * Application Controller
 * Handles application submission, tracking, and user-side operations
 */

const Application = require('../models/Application');
const User = require('../models/User');

class ApplicationController {
  /**
   * Create New Application
   * POST /applications
   */
  static async createApplication(req, res) {
    try {
      const { schemeName, applicationData } = req.body;
      const userId = req.session.user.userId;
      const user = await User.findOne({ userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Map scheme name to application purpose
      const purposeMapping = {
        'Income Certificate Scheme': 'income_certificate',
        'Residence Certificate Scheme': 'residence_certificate', 
        'Caste Certificate Scheme': 'caste_certificate',
        'Character Certificate Scheme': 'character_certificate',
        'Education Grant Scheme': 'other'
      };

      // Get purpose from mapping or default to 'other' for valid enum
      let purpose = purposeMapping[schemeName];
      
      // If no exact match, try partial matching or default to 'other'
      if (!purpose) {
        const lowerSchemeName = schemeName.toLowerCase();
        if (lowerSchemeName.includes('income')) {
          purpose = 'income_certificate';
        } else if (lowerSchemeName.includes('residence') || lowerSchemeName.includes('domicile')) {
          purpose = 'residence_certificate';
        } else if (lowerSchemeName.includes('caste') || lowerSchemeName.includes('community')) {
          purpose = 'caste_certificate';
        } else if (lowerSchemeName.includes('character') || lowerSchemeName.includes('conduct')) {
          purpose = 'character_certificate';
        } else {
          purpose = 'other'; // Default fallback for any scheme
        }
      }

      console.log('🔎 Application creation:', {
        schemeName,
        mappedPurpose: purpose,
        userId: user.userId,
        incomingApplicationData: applicationData
      });

      // Prepare application data, ensuring our mapped purpose overrides any incoming purpose
      const processedApplicationData = {
        ...applicationData, // Spread first to get all fields
        purpose: purpose,   // Then override purpose with our mapped value
        description: applicationData.description || `Application for ${schemeName}`,
        urgency: applicationData.urgency || 'normal'
      };

      // Create application
      const application = await Application.createApplication({
        userId: user.userId,
        applicantName: user.name,
        applicantMobile: user.mobile,
        applicationData: processedApplicationData
      });

      console.log('📋 APPLICATION CREATED:', {
        applicationId: application.applicationId,
        userId: user.userId,
        purpose: purpose,
        createdAt: application.submittedAt
      });

      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        application: {
          applicationId: application.applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          currentAuthority: application.currentAuthority,
          processingChain: application.getProcessingHistory()
        }
      });

    } catch (error) {
      console.error('Error creating application:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create application',
        code: 'APPLICATION_CREATION_ERROR'
      });
    }
  }

  /**
   * Get User's Applications
   * GET /applications/my-applications
   */
  static async getMyApplications(req, res) {
    try {
      const userId = req.session.user.userId;

      const applications = await Application.find({ userId })
        .sort({ submittedAt: -1 })
        .select('applicationId status submittedAt lastUpdated applicationData currentAuthority completedAt totalProcessingTime');

      return res.status(200).json({
        success: true,
        applications: applications.map(app => ({
          applicationId: app.applicationId,
          purpose: app.applicationData.purpose,
          description: app.applicationData.description,
          status: app.status,
          submittedAt: app.submittedAt,
          lastUpdated: app.lastUpdated,
          currentAuthority: app.currentAuthority?.designation,
          completedAt: app.completedAt,
          processingTimeHours: app.totalProcessingTime
        }))
      });

    } catch (error) {
      console.error('Error fetching user applications:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch applications',
        code: 'FETCH_APPLICATIONS_ERROR'
      });
    }
  }

  /**
   * Get Application Status and Details
   * GET /applications/:id/status
   */
  static async getApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.userId;

      const application = await Application.findOne({
        applicationId: id,
        userId: userId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        application: {
          applicationId: application.applicationId,
          status: application.status,
          submittedAt: application.submittedAt,
          lastUpdated: application.lastUpdated,
          currentAuthority: application.currentAuthority,
          processingChain: application.getProcessingHistory(),
          applicationData: application.applicationData,
          documents: application.documents,
          completedAt: application.completedAt,
          processingTimeHours: application.totalProcessingTime
        }
      });

    } catch (error) {
      console.error('Error fetching application status:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch application status',
        code: 'APPLICATION_STATUS_ERROR'
      });
    }
  }

  /**
   * Update Application (limited fields)
   * PUT /applications/:id
   */
  static async updateApplication(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.userId;
      const { applicationData } = req.body;

      const application = await Application.findOne({
        applicationId: id,
        userId: userId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      // Only allow updates if application is in certain states
      if (!['submitted', 'pending_documents'].includes(application.status)) {
        return res.status(400).json({
          success: false,
          error: 'Application cannot be updated in current status',
          code: 'UPDATE_NOT_ALLOWED'
        });
      }

      // Update allowed fields
      if (applicationData.description) {
        application.applicationData.description = applicationData.description;
      }
      if (applicationData.urgency) {
        application.applicationData.urgency = applicationData.urgency;
      }

      application.lastUpdated = new Date();
      await application.save();

      return res.status(200).json({
        success: true,
        message: 'Application updated successfully',
        application: {
          applicationId: application.applicationId,
          status: application.status,
          lastUpdated: application.lastUpdated,
          applicationData: application.applicationData
        }
      });

    } catch (error) {
      console.error('Error updating application:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update application',
        code: 'APPLICATION_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete Application (only if not processed)
   * DELETE /applications/:id
   */
  static async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.userId;

      const application = await Application.findOne({
        applicationId: id,
        userId: userId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      // Only allow deletion if application is just submitted
      if (application.status !== 'submitted') {
        return res.status(400).json({
          success: false,
          error: 'Application cannot be deleted after processing has started',
          code: 'DELETE_NOT_ALLOWED'
        });
      }

      await Application.deleteOne({ applicationId: id, userId: userId });

      console.log('🗑️ APPLICATION DELETED:', {
        applicationId: application.applicationId,
        userId: userId,
        deletedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Application deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting application:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete application',
        code: 'APPLICATION_DELETE_ERROR'
      });
    }
  }

  /**
   * Upload Documents for Application
   * POST /applications/:id/documents
   */
  static async uploadDocuments(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.userId;
      
      // Debug: Log the incoming request body
      console.log('🔎 uploadDocuments - req.body:', JSON.stringify(req.body));
      console.log('🔎 uploadDocuments - req.params:', JSON.stringify(req.params));
      console.log('🔎 uploadDocuments - userId:', userId);

      // Check if req.body exists and has the expected structure
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body is missing',
          code: 'MISSING_REQUEST_BODY'
        });
      }

      const { documents } = req.body;

      // Validate documents array
      if (!documents) {
        return res.status(400).json({
          success: false,
          error: 'Documents array is required',
          code: 'MISSING_DOCUMENTS'
        });
      }

      if (!Array.isArray(documents)) {
        return res.status(400).json({
          success: false,
          error: 'Documents must be an array',
          code: 'INVALID_DOCUMENTS_FORMAT'
        });
      }

      const application = await Application.findOne({
        applicationId: id,
        userId: userId
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      // Add documents to application
      if (documents.length > 0) {
        documents.forEach(doc => {
          application.documents.push({
            type: doc.type || 'other',
            status: 'submitted',
            comments: doc.comments || ''
          });
        });

        application.lastUpdated = new Date();
        await application.save();
      }

      return res.status(200).json({
        success: true,
        message: 'Documents uploaded successfully',
        application: {
          applicationId: application.applicationId,
          documents: application.documents
        }
      });

    } catch (error) {
      console.error('Error uploading documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload documents',
        code: 'DOCUMENT_UPLOAD_ERROR'
      });
    }
  }

  /**
   * Get Application Documents
   * GET /applications/:id/documents
   */
  static async getDocuments(req, res) {
    try {
      const { id } = req.params;
      const userId = req.session.user.userId;

      const application = await Application.findOne({
        applicationId: id,
        userId: userId
      }).select('applicationId documents');

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        applicationId: application.applicationId,
        documents: application.documents
      });

    } catch (error) {
      console.error('Error fetching documents:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch documents',
        code: 'DOCUMENT_FETCH_ERROR'
      });
    }
  }
}

module.exports = ApplicationController;