/**
 * Authority Controller
 * Handles all authority-related business logic including application processing
 * Separated from routes for better code organization
 */

const Authority = require('../models/Authority');
const Application = require('../models/Application');
const User = require('../models/User');
const Document = require('../models/Document');

class AuthorityController {
  /**
   * Authority Dashboard with Real Application Statistics
   * GET /authority/dashboard
   */
  static async getDashboard(req, res) {
    try {
      const { designation, accessLevel, department } = req.session.authority;
      
      // For low-level authorities (Level 1-2), provide data verification dashboard
      if (accessLevel <= 2) {
        // Get pending applications for data verification
        const pendingApps = await Application.getPendingDataVerification(designation);
        
        // Get recent applications (last 5)
        const recentApps = pendingApps.slice(0, 5).map(app => ({
          applicationId: app.applicationId,
          applicantName: app.applicantName,
          purpose: app.applicationData?.purpose,
          status: app.status,
          submittedAt: app.submittedAt,
          urgency: app.applicationData?.urgency || 'normal'
        }));
        
        // Calculate statistics
        const highPriority = pendingApps.filter(app => 
          app.applicationData?.urgency === 'high' || app.applicationData?.urgency === 'urgent'
        ).length;
        
        // Get processed today count - only count completed verifications (escalated or sent back)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const processedToday = await Application.countDocuments({
          'dataVerification.verifiedBy': designation,
          'dataVerification.verifiedAt': { $gte: today },
          'dataVerification.action': { $in: ['escalated', 'sent_back_to_user', 'incomplete'] }
        });
        
        return res.json({
          success: true,
          dashboard: {
            authority: {
              designation: designation,
              department: department,
              accessLevel: accessLevel
            },
            statistics: {
              pendingApplications: pendingApps.length,
              processedToday: processedToday,
              totalApplications: pendingApps.length + processedToday,
              byStatus: {
                data_verification: pendingApps.length
              }
            },
            recentApplications: recentApps,
            workload: {
              high_priority: highPriority,
              overdue: 0
            },
            message: 'Data Entry Operator - Verify application completeness and escalate to reviewers'
          },
          lastUpdated: new Date()
        });
      }
      
      // For reviewers and above (Level 3+), provide full dashboard
      try {
        console.log('📊 DASHBOARD FOR REVIEWER:', { designation, accessLevel, department });
        
        // Check if District Collector (admin view - sees ALL applications)
        const isDistrictCollector = designation === 'DISTRICT_COLLECTOR_DELHI' || accessLevel >= 5;
        
        // Get real application statistics
        const stats = await Application.getApplicationStats(designation, isDistrictCollector);
        const allRecentApplications = await Application.getApplicationsForAuthority(
          designation, 
          null, 
          isDistrictCollector
        );
        const recentApplications = allRecentApplications.slice(0, 5);
        
        // Get processing metrics
        let pendingCount, processedToday;
        
        if (isDistrictCollector) {
          // District Collector sees ALL applications
          pendingCount = await Application.countDocuments({
            status: { $nin: ['approved', 'accepted', 'rejected'] }
          });
          
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          
          processedToday = await Application.countDocuments({
            'processingChain.timestamp': { $gte: todayStart },
            'processingChain.action': { $in: ['approved', 'rejected', 'forwarded'] }
          });
        } else {
          // Other authorities see only their assigned applications
          const designationRegex = new RegExp(`^${designation}$`, 'i');
          
          pendingCount = await Application.countDocuments({
            'currentAuthority.designation': designationRegex,
            status: { $nin: ['approved', 'accepted', 'rejected'] }
          });
          
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          
          processedToday = await Application.countDocuments({
            'processingChain.designation': designationRegex,
            'processingChain.timestamp': { $gte: todayStart },
            'processingChain.action': { $in: ['approved', 'rejected', 'forwarded'] }
          });
        }

        console.log('📊 Pending count:', pendingCount, 'Is District Collector:', isDistrictCollector);

        const dashboardData = {
          authority: {
            designation: designation,
            department: department,
            accessLevel: accessLevel,
            isAdmin: isDistrictCollector // Flag to indicate admin view
          },
          statistics: {
            pendingApplications: pendingCount,
            processedToday: processedToday,
            totalApplications: stats.total || 0,
            byStatus: stats.byStatus || {}
          },
          recentApplications: recentApplications.map(app => ({
            applicationId: app.applicationId,
            applicantName: app.applicantName,
            purpose: app.applicationData?.purpose || 'N/A',
            status: app.status,
            submittedAt: app.submittedAt,
            urgency: app.applicationData?.urgency || 'normal',
            assignedAt: app.currentAuthority?.assignedAt || app.submittedAt,
            currentAuthority: app.currentAuthority?.designation // Show current authority for admin view
          })),
          workload: isDistrictCollector ? {
            high_priority: await Application.countDocuments({
              'applicationData.urgency': { $in: ['high', 'urgent'] },
              status: { $nin: ['approved', 'accepted', 'rejected'] }
            }),
            overdue: await Application.countDocuments({
              'currentAuthority.assignedAt': { $lt: new Date(Date.now() - 72 * 60 * 60 * 1000) },
              status: { $nin: ['approved', 'accepted', 'rejected'] }
            })
          } : {
            high_priority: await Application.countDocuments({
              'currentAuthority.designation': new RegExp(`^${designation}$`, 'i'),
              'applicationData.urgency': { $in: ['high', 'urgent'] },
              status: { $nin: ['approved', 'accepted', 'rejected'] }
            }),
            overdue: await Application.countDocuments({
              'currentAuthority.designation': new RegExp(`^${designation}$`, 'i'),
              'currentAuthority.assignedAt': { $lt: new Date(Date.now() - 72 * 60 * 60 * 1000) },
              status: { $nin: ['approved', 'accepted', 'rejected'] }
            })
          }
        };

        res.json({
          success: true,
          dashboard: dashboardData,
          lastUpdated: new Date()
        });
      } catch (appError) {
        // If Application queries fail, return empty dashboard
        console.error('Error querying applications:', appError);
        
        res.json({
          success: true,
          dashboard: {
            authority: {
              designation: designation,
              department: department,
              accessLevel: accessLevel
            },
            statistics: {
              pendingApplications: 0,
              processedToday: 0,
              totalApplications: 0,
              byStatus: {}
            },
            recentApplications: [],
            workload: {
              high_priority: 0,
              overdue: 0
            },
            message: 'No applications found'
          },
          lastUpdated: new Date()
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to load dashboard',
        code: 'DASHBOARD_ERROR',
        details: error.message
      });
    }
  }

  /**
   * Get Pending Applications for Review
   * GET /authority/applications/pending
   */
  static async getPendingApplications(req, res) {
    try {
      const { designation, accessLevel } = req.session.authority;
      const { status, urgency, limit = 20, page = 1 } = req.query;
      
      console.log('📋 GET PENDING APPLICATIONS:', {
        designation,
        accessLevel,
        status,
        urgency,
        page
      });
      
      // Check if District Collector (admin view)
      const isDistrictCollector = designation === 'DISTRICT_COLLECTOR_DELHI' || accessLevel >= 5;
      
      // Build query
      let query = {};
      
      if (!isDistrictCollector) {
        // Normal authority - only see applications assigned to them
        query = { 
          'currentAuthority.designation': new RegExp(`^${designation}$`, 'i')
        };
        
        // For normal authorities, default to exclude completed
        if (!status) {
          query.status = { $nin: ['approved', 'accepted', 'rejected'] };
        } else {
          query.status = status;
        }
      } else {
        // District Collector (admin) - sees ALL applications
        // Default: Show only pending applications (exclude completed)
        // status='all': Show everything (no filter)
        if (status === 'all') {
          // Show ALL applications (no status filter)
        } else if (status) {
          query.status = status;
        } else {
          // Default: exclude completed applications
          query.status = { $nin: ['approved', 'accepted', 'rejected'] };
        }
      }
      
      if (urgency) {
        query['applicationData.urgency'] = urgency;
      }
      
      console.log('🔍 Query:', JSON.stringify(query, null, 2), 'isDistrictCollector:', isDistrictCollector);
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get applications with user details
      const applications = await Application.find(query)
        .sort({ 
          'applicationData.urgency': -1,  // High urgency first
          submittedAt: -1                 // Newest first for admin view
        })
        .skip(skip)
        .limit(parseInt(limit))
        .populate({
          path: 'userId',
          select: 'name mobile loginUserId',
          foreignField: 'userId',
          localField: 'userId'
        });
      
      const totalCount = await Application.countDocuments(query);
      
      // For each application, fetch the linked documents from the Document model
      const formattedApplications = await Promise.all(applications.map(async (app) => {
        // Fetch documents linked to this application
        const documents = await Document.find({
          'linkedApplications.applicationId': app.applicationId
        }).select('documentId type originalName cloudinaryUrl linkedApplications overallStatus');

        // Format documents for the response
        const formattedDocuments = documents.map(doc => {
          const appLink = doc.linkedApplications.find(link => link.applicationId === app.applicationId);
          return {
            documentId: doc.documentId,
            type: doc.type,
            originalName: doc.originalName,
            url: doc.cloudinaryUrl, // Map cloudinaryUrl to url for frontend compatibility
            status: appLink ? appLink.status : doc.overallStatus,
            verifiedBy: appLink ? appLink.verifiedBy : null
          };
        });

        return {
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
          currentAuthority: app.currentAuthority,
          assignedAt: app.currentAuthority.assignedAt,
          processingTime: Math.round((new Date() - app.submittedAt) / (1000 * 60 * 60)), // hours
          documents: formattedDocuments, // Use the new documents from Document model
          lastAction: app.processingChain[app.processingChain.length - 1] || null
        };
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
          accessLevel: req.session.authority.accessLevel,
          isAdmin: isDistrictCollector // Flag for frontend to show admin features
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
        .populate({
          path: 'userId',
          select: 'name mobile loginUserId',
          foreignField: 'userId',
          localField: 'userId'
        });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      // Fetch documents linked to this application using the new Document model
      const documents = await Document.find({
        'linkedApplications.applicationId': applicationId
      }).select('documentId type originalName cloudinaryUrl fileSizeBytes uploadedAt linkedApplications overallStatus');

      // Format documents for the response
      const formattedDocuments = documents.map(doc => {
        const appLink = doc.linkedApplications.find(link => link.applicationId === applicationId);
        return {
          documentId: doc.documentId,
          type: doc.type,
          originalName: doc.originalName,
          url: doc.cloudinaryUrl, // Map cloudinaryUrl to url for frontend compatibility
          fileSize: doc.fileSizeBytes,
          uploadedAt: doc.uploadedAt,
          status: appLink ? appLink.status : doc.overallStatus,
          verificationComments: appLink ? appLink.verificationComments : '',
          verifiedBy: appLink ? appLink.verifiedBy : null,
          verifiedAt: appLink ? appLink.verifiedAt : null
        };
      });

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
          documents: formattedDocuments, // Use the new documents from Document model
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

      console.log('🔍 REVIEW APPLICATION REQUEST:', {
        applicationId,
        action,
        authority: authority?.designation,
        hasComments: !!comments,
        forwardTo
      });

      // Validate action
      const validActions = ['approve', 'reject', 'request_documents', 'forward', 'hold'];
      if (!validActions.includes(action)) {
        console.log('❌ Invalid action:', action);
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Must be approve, reject, request_documents, forward, or hold',
          code: 'INVALID_ACTION'
        });
      }

      // Find application
      const application = await Application.findOne({ applicationId });
      if (!application) {
        console.log('❌ Application not found:', applicationId);
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'APPLICATION_NOT_FOUND'
        });
      }

      // Verify application is assigned to this authority (case-insensitive)
      if (application.currentAuthority.designation.toLowerCase() !== authority.designation.toLowerCase()) {
        console.log('❌ Not assigned to this authority:', {
          current: application.currentAuthority.designation,
          requesting: authority.designation
        });
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
          // Define automatic forwarding on approval based on authority level
          // Use uppercase designations to match Authority model format
          const approvalForwardingRules = {
            'TEHSILDAR_CP_ZONE': 'Assistant_Collector_North',
            'ASSISTANT_COLLECTOR_NORTH': 'District_Collector_Delhi',
            'DISTRICT_COLLECTOR_DELHI': 'Banking_Section'
          };
          
          const autoForwardTo = approvalForwardingRules[authority.designation];
          
          if (autoForwardTo) {
            // Approve and auto-forward to next level
            console.log(`✅ ${authority.designation} approved - Auto-forwarding to ${autoForwardTo}`);
            
            // FIRST: Add approval to processing chain
            application.processingChain.push({
              authorityId: authority.authorityId,
              designation: authority.designation,
              department: authority.department,
              action: 'approved',
              comments: comments || `Approved by ${authority.designation}`,
              timestamp: new Date()
            });
            
            // THEN: Forward to next authority
            if (autoForwardTo === 'Banking_Section') {
              // District Collector approval - final step
              result = await application.forwardToBankingSection(authority, comments || 'Approved by District Collector');
            } else {
              // Lower level approval - forward to next authority
              result = await application.forwardTo(authority, autoForwardTo, comments || `Approved and forwarded to ${autoForwardTo}`);
            }
          } else {
            // No auto-forward rule (shouldn't happen, but fallback to old behavior)
            result = await application.processApplication(authority, 'approved', comments);
          }
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
          
          // Define forwarding hierarchy - Use uppercase designations to match Authority model
          const forwardingRules = {
            'DATA_ENTRY_OPERATOR': ['Tehsildar_CP_Zone', 'Assistant_Collector_North'],
            'TEHSILDAR_CP_ZONE': ['Assistant_Collector_North', 'District_Collector_Delhi'],
            'ASSISTANT_COLLECTOR_NORTH': ['District_Collector_Delhi'],
            'DISTRICT_COLLECTOR_DELHI': ['Banking_Section']
          };
          
          const allowedForwards = forwardingRules[authority.designation] || [];
          if (!allowedForwards.includes(forwardTo)) {
            return res.status(400).json({
              success: false,
              error: `Cannot forward to ${forwardTo}. Allowed: ${allowedForwards.join(', ')}`,
              code: 'INVALID_FORWARD_TARGET'
            });
          }
          
          // Special handling for Banking Section (final destination - no actual authority)
          if (forwardTo === 'Banking_Section') {
            // Mark application as forwarded to banking (final step)
            result = await application.forwardToBankingSection(authority, comments);
          } else {
            result = await application.forwardTo(authority, forwardTo, comments);
          }
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
        forwardedTo: forwardTo || 'auto-forwarded',
        newStatus: result.status,
        currentAuthority: result.currentAuthority.designation
      });

      // Determine success message based on action and auto-forwarding
      let successMessage = '';
      if (action === 'approve') {
        const approvalForwardingRules = {
          'Tehsildar_CP_Zone': 'Assistant_Collector_North',
          'Assistant_Collector_North': 'District_Collector_Delhi',
          'District_Collector_Delhi': 'Banking_Section'
        };
        const approvalForwardingRulesForMsg = {
          'TEHSILDAR_CP_ZONE': 'Assistant_Collector_North',
          'ASSISTANT_COLLECTOR_NORTH': 'District_Collector_Delhi',
          'DISTRICT_COLLECTOR_DELHI': 'Banking_Section'
        };
        const forwardedTo = approvalForwardingRulesForMsg[authority.designation];
        if (forwardedTo) {
          successMessage = `Application approved and forwarded to ${forwardedTo.replace(/_/g, ' ')}`;
        } else {
          successMessage = 'Application approved successfully';
        }
      } else if (action === 'forward') {
        successMessage = `Application forwarded to ${forwardTo.replace(/_/g, ' ')}`;
      } else {
        successMessage = `Application ${action}${action === 'forward' ? 'ed' : 'd'} successfully`;
      }

      res.json({
        success: true,
        message: successMessage,
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
      
      // Define forwarding hierarchy - Use uppercase keys to match Authority model
      const forwardingRules = {
        'DATA_ENTRY_OPERATOR': [
          { designation: 'Tehsildar_CP_Zone', department: 'Revenue', level: 'Tehsildar' },
          { designation: 'Assistant_Collector_North', department: 'Revenue', level: 'Assistant Collector' }
        ],
        'TEHSILDAR_CP_ZONE': [
          { designation: 'Assistant_Collector_North', department: 'Revenue', level: 'Assistant Collector' },
          { designation: 'District_Collector_Delhi', department: 'Revenue', level: 'District Collector' }
        ],
        'ASSISTANT_COLLECTOR_NORTH': [
          { designation: 'District_Collector_Delhi', department: 'Revenue', level: 'District Collector' }
        ],
        'DISTRICT_COLLECTOR_DELHI': [
          { designation: 'Banking_Section', department: 'Banking', level: 'Banking Section' }
        ]
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
          { type: 'aadhaar', status: 'verified', verifiedBy: 'System', verifiedAt: new Date() },
          { type: 'mobile_verification', status: 'verified', verifiedBy: 'System', verifiedAt: new Date() },
          { type: 'address_proof', status: 'submitted' },
          { type: 'income_proof', status: 'submitted' }
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

  // ===== DATA VERIFICATION METHODS (Data Entry Operators) =====

  /**
   * Get Applications for Data Verification (Data Entry Operators)
   * GET /authority/data-verification/pending
   */
  static async getPendingDataVerification(req, res) {
    try {
      const { designation } = req.session.authority;
      const { limit = 20, page = 1 } = req.query;
      
      const applications = await Application.getPendingDataVerification(designation);
      
      const paginatedApps = applications.slice((page - 1) * limit, page * limit);
      
      res.json({
        success: true,
        applications: paginatedApps.map(app => ({
          applicationId: app.applicationId,
          applicantName: app.applicantName,
          applicantMobile: app.applicantMobile,
          purpose: app.applicationData?.purpose,
          description: app.applicationData?.description,
          urgency: app.applicationData?.urgency,
          documents: app.documents.map(doc => ({
            type: doc.type,
            status: doc.status
          })),
          submittedAt: app.submittedAt,
          assignedAt: app.currentAuthority?.assignedAt,
          dataVerification: app.dataVerification
        })),
        pagination: {
          total: applications.length,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(applications.length / limit)
        }
      });
      
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending verifications',
        code: 'FETCH_ERROR'
      });
    }
  }

  /**
   * Get Single Application Details for Verification
   * GET /authority/data-verification/:applicationId
   */
  static async getApplicationForVerification(req, res) {
    try {
      const { applicationId } = req.params;
      const { designation } = req.session.authority;
      
      const application = await Application.findOne({ applicationId })
        .populate({
          path: 'userId',
          select: 'name mobile email address dateOfBirth gender',
          foreignField: 'userId',
          localField: 'userId'
        });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check if this data entry operator is assigned to this application (case-insensitive)
      if (application.currentAuthority.designation.toLowerCase() !== designation.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: 'This application is not assigned to you',
          code: 'NOT_ASSIGNED'
        });
      }
      
      res.json({
        success: true,
        application: {
          applicationId: application.applicationId,
          applicant: {
            name: application.applicantName,
            mobile: application.applicantMobile,
            email: application.userId?.email,
            dateOfBirth: application.userId?.dateOfBirth,
            gender: application.userId?.gender,
            address: application.userId?.address
          },
          applicationData: application.applicationData,
          documents: application.documents,
          status: application.status,
          dataVerification: application.dataVerification,
          processingHistory: application.getProcessingHistory(),
          submittedAt: application.submittedAt
        }
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
   * Verify and Escalate Application
   * POST /authority/data-verification/:applicationId/verify
   */
  static async verifyAndEscalateApplication(req, res) {
    try {
      const { applicationId } = req.params;
      const { designation, accessLevel } = req.session.authority;
      const { isComplete, missingFields, comments } = req.body;
      
      // Only data entry operators (level 1-2) can use this endpoint
      if (accessLevel > 2) {
        return res.status(403).json({
          success: false,
          error: 'This endpoint is only for data entry operators',
          code: 'INVALID_ACCESS_LEVEL'
        });
      }
      
      const application = await Application.findOne({ applicationId });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found',
          code: 'NOT_FOUND'
        });
      }
      
      // Check if assigned to this operator (case-insensitive)
      if (application.currentAuthority.designation.toLowerCase() !== designation.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: 'This application is not assigned to you',
          code: 'NOT_ASSIGNED'
        });
      }
      
      // Verify and escalate (escalation is now automatic)
      const updatedApp = await application.verifyDataCompleteness(designation, {
        isComplete,
        missingFields: missingFields || [],
        comments
      });
      
      res.json({
        success: true,
        message: isComplete 
          ? `Application verified and automatically escalated to Tehsildar for review` 
          : 'Application marked as incomplete - sent back to user for corrections',
        application: {
          applicationId: updatedApp.applicationId,
          status: updatedApp.status,
          dataVerification: updatedApp.dataVerification,
          currentAuthority: updatedApp.currentAuthority
        }
      });
      
    } catch (error) {
      console.error('Error verifying application:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify application',
        code: 'VERIFICATION_ERROR',
        details: error.message
      });
    }
  }

  /**
   * Get Available Reviewers for Escalation
   * GET /authority/data-verification/escalation-options
   * NOTE: This endpoint is deprecated - escalation is now automatic
   */
  static async getEscalationOptions(req, res) {
    try {
      // Return empty array since escalation is now automatic
      res.json({
        success: true,
        message: 'Escalation is now automatic to Tehsildar',
        reviewers: [],
        isAutomatic: true
      });
      
    } catch (error) {
      console.error('Error fetching escalation options:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch escalation options',
        code: 'FETCH_ERROR'
      });
    }
  }
}

module.exports = AuthorityController;