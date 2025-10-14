/**
 * Application Model
 * Tracks user applications and their processing through different authority levels
 */

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true,
    required: true,
    match: /^APP_\d{6}$/
  },
  
  // User Information
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  applicantName: {
    type: String,
    required: true
  },
  
  applicantMobile: {
    type: String,
    required: true
  },
  
  // Application Details
  applicationData: {
    purpose: {
      type: String,
      required: true,
      enum: ['income_certificate', 'residence_certificate', 'caste_certificate', 'character_certificate', 'other']
    },
    description: String,
    urgency: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    }
  },
  
  // Document Information
  documents: [{
    type: {
      type: String,
      required: true,
      enum: ['aadhaar', 'mobile_verification', 'address_proof', 'income_proof', 'other']
    },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'rejected', 'pending'],
      default: 'submitted'
    },
    verifiedBy: String,
    verifiedAt: Date,
    comments: String
  }],
  
  // Application Status and Flow
  status: {
    type: String,
    enum: [
      'submitted',           // Initial submission
      'data_verification',   // Data Entry Operator checking completeness
      'under_review',       // Being reviewed by authority
      'pending_documents',  // Waiting for additional documents
      'forwarded',          // Forwarded to higher authority
      'approved',           // Final approval (general)
      'accepted',           // Accepted by District Collector and forwarded to Banking
      'rejected',           // Rejected
      'on_hold'            // Temporarily on hold
    ],
    default: 'data_verification'  // Start with data verification
  },
  
  // Data Verification (by Data Entry Operator)
  dataVerification: {
    isComplete: {
      type: Boolean,
      default: null
    },
    verifiedBy: String,  // Data Entry Operator designation
    verifiedAt: Date,
    missingFields: [String],  // List of missing or incomplete fields
    comments: String,
    action: {
      type: String,
      enum: ['pending', 'verified_complete', 'incomplete', 'escalated'],
      default: 'pending'
    }
  },
  
  // Authority Processing Chain
  processingChain: [{
    authorityId: String,
    designation: String,
    department: String,
    action: {
      type: String,
      enum: ['review_started', 'approved', 'rejected', 'forwarded', 'requested_docs', 'on_hold']
    },
    comments: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    forwardedTo: String  // Next authority designation
  }],
  
  // Current Processing
  currentAuthority: {
    designation: String,
    department: String,
    assignedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  // Processing Metrics
  totalProcessingTime: Number, // in hours
  authorityChanges: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate unique application ID
applicationSchema.statics.generateApplicationId = function() {
  const timestamp = Date.now().toString().slice(-6);
  return `APP_${timestamp}`;
};

// Create new application
applicationSchema.statics.createApplication = async function(applicationData) {
  const applicationId = this.generateApplicationId();
  
  const application = new this({
    applicationId,
    ...applicationData,
    status: 'data_verification', // Force data verification status
    processingChain: [{
      action: 'review_started',
      timestamp: new Date(),
      comments: 'Application submitted and under initial review'
    }],
    currentAuthority: {
      designation: 'DATA_ENTRY_OPERATOR', // Match the authority designation format (uppercase)
      department: 'IT',
      assignedAt: new Date()
    }
  });
  
  return await application.save();
};

// Forward application to next authority
applicationSchema.methods.forwardTo = async function(currentAuthority, targetAuthority, comments) {
  // Normalize target authority designation to uppercase to match Authority model format
  const normalizedTarget = targetAuthority.toUpperCase();
  
  this.processingChain.push({
    authorityId: currentAuthority.authorityId,
    designation: currentAuthority.designation,
    department: currentAuthority.department,
    action: 'forwarded',
    comments: comments || `Forwarded to ${targetAuthority}`,
    timestamp: new Date(),
    forwardedTo: normalizedTarget
  });
  
  this.currentAuthority = {
    designation: normalizedTarget, // Use normalized uppercase designation
    department: 'Revenue', // Most forwards go to Revenue dept
    assignedAt: new Date()
  };
  
  this.status = 'under_review';
  this.authorityChanges += 1;
  this.lastUpdated = new Date();
  
  return await this.save();
};

// Forward application to Banking Section (final step - marks as accepted and forwarded)
applicationSchema.methods.forwardToBankingSection = async function(currentAuthority, comments) {
  this.processingChain.push({
    authorityId: currentAuthority.authorityId,
    designation: currentAuthority.designation,
    department: currentAuthority.department,
    action: 'forwarded',
    comments: comments || 'Accepted by District Collector and forwarded to Banking Section',
    timestamp: new Date(),
    forwardedTo: 'BANKING_SECTION' // Use uppercase for consistency
  });
  
  // Mark as accepted since District Collector is the final approving authority
  this.status = 'accepted';
  this.completedAt = new Date();
  this.authorityChanges += 1;
  this.lastUpdated = new Date();
  
  // Update current authority to Banking Section (even though it doesn't exist as an authority)
  this.currentAuthority = {
    designation: 'BANKING_SECTION', // Use uppercase for consistency
    department: 'Banking',
    assignedAt: new Date()
  };
  
  // Calculate total processing time
  this.totalProcessingTime = Math.round((this.completedAt - this.submittedAt) / (1000 * 60 * 60)); // hours
  
  return await this.save();
};

// Process application (approve/reject/request docs)
applicationSchema.methods.processApplication = async function(authority, action, comments, requiredDocuments = []) {
  this.processingChain.push({
    authorityId: authority.authorityId,
    designation: authority.designation,
    department: authority.department,
    action,
    comments,
    timestamp: new Date()
  });
  
  switch (action) {
    case 'approved':
      this.status = 'approved';
      this.completedAt = new Date();
      break;
    case 'rejected':
      this.status = 'rejected';
      this.completedAt = new Date();
      break;
    case 'requested_docs':
      this.status = 'pending_documents';
      if (requiredDocuments.length > 0) {
        requiredDocuments.forEach(docType => {
          this.documents.push({
            type: docType,
            status: 'pending'
          });
        });
      }
      break;
    case 'on_hold':
      this.status = 'on_hold';
      break;
  }
  
  this.lastUpdated = new Date();
  
  // Calculate processing time if completed
  if (this.completedAt) {
    this.totalProcessingTime = Math.round((this.completedAt - this.submittedAt) / (1000 * 60 * 60)); // hours
  }
  
  return await this.save();
};

// Get applications by authority designation
applicationSchema.statics.getApplicationsForAuthority = async function(designation, status = null, includeAll = false) {
  let query = {};
  
  // Special case: District Collector sees ALL applications (admin view)
  if (includeAll) {
    // No currentAuthority filter - show all applications
    if (status) {
      query.status = status;
    }
    // Don't exclude any status for District Collector
  } else {
    // Normal authority - only see applications assigned to them
    query = { 'currentAuthority.designation': new RegExp(`^${designation}$`, 'i') }; // Case-insensitive
    
    if (status) {
      query.status = status;
    } else {
      // By default, exclude completed applications
      query.status = { $nin: ['approved', 'accepted', 'rejected'] };
    }
  }
  
  return await this.find(query)
    .sort({ submittedAt: -1 })
    .populate({
      path: 'userId',
      select: 'name mobile',
      foreignField: 'userId',
      localField: 'userId'
    });
};

// Get application statistics
applicationSchema.statics.getApplicationStats = async function(designation = null, includeAll = false) {
  let matchStage = {};
  
  // Special case: District Collector sees stats for ALL applications
  if (!includeAll && designation) {
    matchStage = { 'currentAuthority.designation': new RegExp(`^${designation}$`, 'i') }; // Case-insensitive
  }
  // If includeAll is true, matchStage remains empty {} - all applications
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgProcessingTime: { $avg: '$totalProcessingTime' }
      }
    }
  ]);
  
  const totalApplications = await this.countDocuments(matchStage);
  
  return {
    total: totalApplications,
    byStatus: stats,
    generated: new Date()
  };
};

// Get processing chain for application
applicationSchema.methods.getProcessingHistory = function() {
  return this.processingChain.map(step => ({
    authority: step.designation,
    department: step.department,
    action: step.action,
    comments: step.comments,
    timestamp: step.timestamp,
    forwardedTo: step.forwardedTo
  }));
};

// ===== DATA VERIFICATION METHODS =====

// Data Entry Operator: Verify application completeness
applicationSchema.methods.verifyDataCompleteness = async function(verifierDesignation, verificationData) {
  const { isComplete, missingFields, comments } = verificationData;
  
  // Update data verification
  this.dataVerification = {
    isComplete,
    verifiedBy: verifierDesignation,
    verifiedAt: new Date(),
    missingFields: missingFields || [],
    comments: comments || '',
    action: isComplete ? 'verified_complete' : 'incomplete'
  };
  
  // Add to processing chain
  this.processingChain.push({
    designation: verifierDesignation,
    department: 'IT',
    action: isComplete ? 'approved' : 'requested_docs',
    comments: comments || (isComplete ? 'Data verification complete' : 'Incomplete data - requires correction'),
    timestamp: new Date()
  });
  
  // Update status and current authority based on verification
  if (isComplete) {
    // AUTOMATIC ESCALATION: Level 1 (Data Entry) -> Level 3 (Tehsildar)
    const nextReviewer = 'TEHSILDAR_CP_ZONE'; // Use uppercase to match Authority model
    
    this.status = 'under_review';
    this.currentAuthority = {
      designation: nextReviewer,
      department: 'Revenue',
      assignedAt: new Date()
    };
    this.dataVerification.action = 'escalated';
    this.authorityChanges += 1;
    
    // Add escalation to processing chain
    this.processingChain.push({
      designation: verifierDesignation,
      department: 'IT',
      action: 'forwarded',
      comments: `Automatically escalated to ${nextReviewer} for review`,
      timestamp: new Date(),
      forwardedTo: nextReviewer
    });
  } else if (!isComplete) {
    // Send back to applicant for corrections
    this.status = 'pending_documents';
    this.dataVerification.action = 'sent_back_to_user';
  }
  
  this.lastUpdated = new Date();
  return await this.save();
};

// Get applications pending data verification
applicationSchema.statics.getPendingDataVerification = async function(designation = 'Data_Entry_Operator') {
  return await this.find({
    'currentAuthority.designation': new RegExp(`^${designation}$`, 'i'), // Case-insensitive match
    status: 'data_verification',
    $or: [
      { 'dataVerification.action': 'pending' },
      { 'dataVerification.action': { $exists: false } },
      { 'dataVerification.action': null }
    ]
  })
    .sort({ submittedAt: 1 });
};

module.exports = mongoose.model('Application', applicationSchema);