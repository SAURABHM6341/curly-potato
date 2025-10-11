/**
 * Authority Controller
 * Handles all authority-related business logic including application processing
 * Separated from routes for better code organization
 */

const Authority = require('../models/Authority');
const Application = require('../models/Application');
const User = require('../models/User');

class AuthorityController {
  /**
   * Authority Dashboard with Real Application Statistics
   * GET /authority/dashboard
   */
  static async getDashboard(req, res) {
    try {
      const { designation } = req.session.authority;
      
      // Get real application statistics
      const stats = await Application.getApplicationStats(designation);
      const recentApplications = await Application.getApplicationsForAuthority(designation)
        .limit(5)
        .sort({ lastUpdated: -1 });
      
      // Get processing metrics
      const pendingCount = await Application.countDocuments({
        'currentAuthority.designation': designation,
        status: { $nin: ['approved', 'rejected'] }
      });
      
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const processedToday = await Application.countDocuments({
        'processingChain.designation': designation,
        'processingChain.timestamp': { $gte: todayStart },
        'processingChain.action': { $in: ['approved', 'rejected', 'forwarded'] }
      });

      const dashboardData = {
        authority: {
          designation: req.session.authority.designation,
          department: req.session.authority.department,
          accessLevel: req.session.authority.accessLevel
        },
        statistics: {
          pendingApplications: pendingCount,
          processedToday: processedToday,
          totalApplications: stats.total,
          byStatus: stats.byStatus
        },
        recentApplications: recentApplications.map(app => ({
          applicationId: app.applicationId,
          applicantName: app.applicantName,
          purpose: app.applicationData.purpose,
          status: app.status,
          submittedAt: app.submittedAt,
          urgency: app.applicationData.urgency,
          assignedAt: app.currentAuthority.assignedAt
        })),
        workload: {
          high_priority: await Application.countDocuments({
            'currentAuthority.designation': designation,
            'applicationData.urgency': { $in: ['high', 'urgent'] },
            status: { $nin: ['approved', 'rejected'] }
          }),
          overdue: await Application.countDocuments({
            'currentAuthority.designation': designation,
            'currentAuthority.assignedAt': { $lt: new Date(Date.now() - 72 * 60 * 60 * 1000) }, // 3 days
            status: { $nin: ['approved', 'rejected'] }
          })
        }
      };

      res.json({
        success: true,
        dashboard: dashboardData,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard',
        code: 'DASHBOARD_ERROR'
      });
    }
  }

  /**
   * Get Pending Applications for Review
   * GET /authority/applications/pending
   */
  static async getPendingApplications(req, res) {
    try {
      const { designation } = req.session.authority;
      const { status, urgency, limit = 20, page = 1 } = req.query;
      
      // Build query
      let query = { 'currentAuthority.designation': designation };
      
      if (status) {
        query.status = status;
      } else {
        // Default: exclude completed applications
        query.status = { $nin: ['approved', 'rejected'] };
      }
      
      if (urgency) {
        query['applicationData.urgency'] = urgency;
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get applications with user details
      const applications = await Application.find(query)
        .sort({ 
          'applicationData.urgency': -1,  // High urgency first
          submittedAt: 1                  // Older applications first
        })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name mobile loginUserId');
      
      const totalCount = await Application.countDocuments(query);
      
      const formattedApplications = applications.map(app => ({
        applicationId: app.applicationId,
        applicant: {
          name: app.applicantName,
          mobile: app.applicantMobile,
          userId: app.userId?.loginUserId
        },
        application: {
          purpose: app.applicationData.purpose,
          description: app.applicationData.description,
          urgency: app.applicationData.urgency
        },
        status: app.status,
        submittedAt: app.submittedAt,
        assignedAt: app.currentAuthority.assignedAt,
        processingTime: Math.round((new Date() - app.submittedAt) / (1000 * 60 * 60)), // hours
        documents: app.documents.map(doc => ({
          type: doc.type,
          status: doc.status,
          verifiedBy: doc.verifiedBy
        })),
        lastAction: app.processingChain[app.processingChain.length - 1] || null
      }));

      res.json({
        success: true,
        applications: formattedApplications,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit))
        },
        authority: {
          designation: req.session.authority.designation,
          accessLevel: req.session.authority.accessLevel
        },
        filters: { status, urgency }
      });

    } catch (error) {
      console.error('Error fetching pending applications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch applications',
        code: 'FETCH_ERROR'
      });
    }
  }

  /**
   * Get Application Details with Processing History
   * GET /authority/applications/:applicationId
   */
  static async getApplicationDetails(req, res) {
    try {
      const { applicationId } = req.params;
      
      const application = await Application.findOne({ applicationId })
        .populate('userId', 'name mobile loginUserId');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        application: {
          applicationId: application.applicationId,
          applicant: {
            name: application.applicantName,
            mobile: application.applicantMobile,
            userId: application.userId?.loginUserId
          },
          applicationData: application.applicationData,
          status: application.status,
          currentAuthority: application.currentAuthority,
          submittedAt: application.submittedAt,
          lastUpdated: application.lastUpdated,
          completedAt: application.completedAt,
          totalProcessingTime: application.totalProcessingTime,
          authorityChanges: application.authorityChanges,
          documents: application.documents,
          processingHistory: application.getProcessingHistory()
        },
        requestedBy: req.session.authority.designation
      });

    } catch (error) {
      console.error('Error fetching application details:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch application details',
        code: 'FETCH_ERROR'
      });
    }
  }

  /**
   * Review/Process Application
   * POST /authority/applications/:applicationId/review
   */
  static async reviewApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { action, comments, requiredDocuments, forwardTo } = req.body;
      const authority = req.session.authority;

      // Validate action
      const validActions = ['approve', 'reject', 'request_documents', 'forward', 'hold'];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be approve, reject, request_documents, forward, or hold',
          code: 'INVALID_ACTION'
        });
      }

      // Find application
      const application = await Application.findOne({ applicationId });
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      // Verify application is assigned to this authority
      if (application.currentAuthority.designation !== authority.designation) {
        return res.status(403).json({
          success: false,
          error: 'Application not assigned to your authority',
          code: 'NOT_ASSIGNED'
        });
      }

      let result;

      // Process based on action
      switch (action) {
        case 'approve':
          result = await application.processApplication(authority, 'approved', comments);
          break;
          
        case 'reject':
          result = await application.processApplication(authority, 'rejected', comments);
          break;
          
        case 'request_documents':
          if (!requiredDocuments || requiredDocuments.length === 0) {
            return res.status(400).json({
              success: false,
              error: 'Required documents must be specified',
              code: 'MISSING_REQUIRED_DOCS'
            });
          }
          result = await application.processApplication(authority, 'requested_docs', comments, requiredDocuments);
          break;
          
        case 'forward':
          if (!forwardTo) {
            return res.status(400).json({
              success: false,
              error: 'Forward destination authority must be specified',
              code: 'MISSING_FORWARD_TO'
            });
          }
          
          // Define forwarding hierarchy
          const forwardingRules = {
            'Data_Entry_Operator': ['Tehsildar_CP_Zone', 'Assistant_Collector_North'],
            'Tehsildar_CP_Zone': ['Assistant_Collector_North', 'District_Collector_Delhi'],
            'Assistant_Collector_North': ['District_Collector_Delhi']
          };
          
          const allowedForwards = forwardingRules[authority.designation] || [];
          if (!allowedForwards.includes(forwardTo)) {
            return res.status(400).json({
              success: false,
              error: `Cannot forward to ${forwardTo}. Allowed: ${allowedForwards.join(', ')}`,
              code: 'INVALID_FORWARD_TARGET'
            });
          }
          
          result = await application.forwardTo(authority, forwardTo, comments);
          break;
          
        case 'hold':
          result = await application.processApplication(authority, 'on_hold', comments);
          break;
      }

      console.log('📋 APPLICATION PROCESSED:', {
        applicationId: result.applicationId,
        action,
        authority: authority.designation,
        department: authority.department,
        comments: comments?.substring(0, 50) + (comments?.length > 50 ? '...' : ''),
        forwardedTo: forwardTo || null,
        newStatus: result.status
      });

      res.json({
        success: true,
        message: `Application ${action}${action === 'forward' ? 'ed' : 'd'} successfully`,
        application: {
          applicationId: result.applicationId,
          status: result.status,
          currentAuthority: result.currentAuthority,
          lastAction: result.processingChain[result.processingChain.length - 1],
          totalProcessingTime: result.totalProcessingTime,
          authorityChanges: result.authorityChanges
        },
        processingHistory: result.getProcessingHistory()
      });

    } catch (error) {
      console.error('Error reviewing application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to review application',
        code: 'REVIEW_ERROR'
      });
    }
  }

  /**
   * Get Forwarding Options for Current Authority
   * GET /authority/forwarding-options
   */
  static async getForwardingOptions(req, res) {
    try {
      const { designation } = req.session.authority;
      
      // Define forwarding hierarchy
      const forwardingRules = {
        'Data_Entry_Operator': [
          { designation: 'Tehsildar_CP_Zone', department: 'Revenue', level: 'Tehsildar' },
          { designation: 'Assistant_Collector_North', department: 'Revenue', level: 'Assistant Collector' }
        ],
        'Tehsildar_CP_Zone': [
          { designation: 'Assistant_Collector_North', department: 'Revenue', level: 'Assistant Collector' },
          { designation: 'District_Collector_Delhi', department: 'Revenue', level: 'District Collector' }
        ],
        'Assistant_Collector_North': [
          { designation: 'District_Collector_Delhi', department: 'Revenue', level: 'District Collector' }
        ],
        'District_Collector_Delhi': [] // Highest authority, cannot forward
      };
      
      const options = forwardingRules[designation] || [];
      
      res.json({
        success: true,
        currentAuthority: {
          designation,
          department: req.session.authority.department,
          accessLevel: req.session.authority.accessLevel
        },
        forwardingOptions: options,
        canForward: options.length > 0
      });

    } catch (error) {
      console.error('Error fetching forwarding options:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch forwarding options',
        code: 'FETCH_ERROR'
      });
    }
  }

  /**
   * Create Test Application for Demonstration
   * POST /authority/applications/create-test
   */
  static async createTestApplication(req, res) {
    try {
      // Find a random user to create application for
      const users = await User.find({ isActive: true }).limit(5);
      if (users.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No active users found to create test application',
          code: 'NO_USERS'
        });
      }
      
      const randomUser = users[Math.floor(Math.random() * users.length)];
      
      const testApplicationData = {
        userId: randomUser.userId,
        applicantName: randomUser.name,
        applicantMobile: randomUser.mobile,
        applicationData: {
          purpose: ['income_certificate', 'residence_certificate', 'caste_certificate'][Math.floor(Math.random() * 3)],
          description: 'Test application for demonstration purposes',
          urgency: ['normal', 'high'][Math.floor(Math.random() * 2)]
        },
        documents: [
          { type: 'aadhaar', status: 'verified' },
          { type: 'mobile_verification', status: 'verified' }
        ]
      };
      
      const application = await Application.createApplication(testApplicationData);
      
      console.log('🧪 TEST APPLICATION CREATED:', {
        applicationId: application.applicationId,
        applicant: application.applicantName,
        purpose: application.applicationData.purpose,
        createdBy: req.session.authority.designation
      });

      res.status(201).json({
        success: true,
        message: 'Test application created successfully',
        application: {
          applicationId: application.applicationId,
          applicantName: application.applicantName,
          purpose: application.applicationData.purpose,
          status: application.status,
          currentAuthority: application.currentAuthority,
          submittedAt: application.submittedAt
        }
      });

    } catch (error) {
      console.error('Error creating test application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create test application',
        code: 'CREATE_ERROR'
      });
    }
  }

  /**
   * Create New Authority Account
   * POST /authority/create
   */
  static async createAuthority(req, res) {
    try {
      const { designation, department, accessLevel, password, permissions } = req.body;
      
      // Check if authority already exists
      const existingAuthority = await Authority.findByDesignation(designation);
      if (existingAuthority) {
        return res.status(400).json({
          success: false,
          error: 'Authority with this designation already exists',
          code: 'AUTHORITY_EXISTS'
        });
      }

      // Create new authority
      const newAuthority = await Authority.createAuthority({
        designation,
        department,
        accessLevel,
        password,
        permissions: permissions || [],
        createdBy: req.session.authority.designation
      });

      console.log('👮 NEW AUTHORITY CREATED:', {
        designation: newAuthority.designation,
        department: newAuthority.department,
        accessLevel: newAuthority.accessLevel,
        createdBy: req.session.authority.designation
      });

      res.status(201).json({
        success: true,
        message: 'Authority account created successfully',
        authority: {
          authorityId: newAuthority.authorityId,
          designation: newAuthority.designation,
          department: newAuthority.department,
          accessLevel: newAuthority.accessLevel,
          isActive: newAuthority.isActive,
          createdAt: newAuthority.createdAt
        }
      });

    } catch (error) {
      console.error('Error creating authority:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create authority account',
        code: 'CREATE_ERROR'
      });
    }
  }

  /**
   * List All Authorities
   * GET /authority/list
   */
  static async listAuthorities(req, res) {
    try {
      const authorities = await Authority.find({ isDeleted: false })
        .select('-password -__v')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        authorities,
        total: authorities.length,
        requestedBy: req.session.authority.designation
      });

    } catch (error) {
      console.error('Error listing authorities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch authorities',
        code: 'FETCH_ERROR'
      });
    }
  }
}

module.exports = AuthorityController;