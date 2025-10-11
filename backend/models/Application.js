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
      'under_review',       // Being reviewed by authority
      'pending_documents',  // Waiting for additional documents
      'forwarded',          // Forwarded to higher authority
      'approved',           // Final approval
      'rejected',           // Rejected
      'on_hold'            // Temporarily on hold
    ],
    default: 'submitted'
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
    processingChain: [{
      action: 'review_started',
      timestamp: new Date(),
      comments: 'Application submitted and under initial review'
    }],
    currentAuthority: {
      designation: 'Data_Entry_Operator', // Start with data entry
      department: 'IT',
      assignedAt: new Date()
    }
  });
  
  return await application.save();
};

// Forward application to next authority
applicationSchema.methods.forwardTo = async function(currentAuthority, targetAuthority, comments) {
  this.processingChain.push({
    authorityId: currentAuthority.authorityId,
    designation: currentAuthority.designation,
    department: currentAuthority.department,
    action: 'forwarded',
    comments: comments || `Forwarded to ${targetAuthority}`,
    timestamp: new Date(),
    forwardedTo: targetAuthority
  });
  
  this.currentAuthority = {
    designation: targetAuthority,
    department: 'Revenue', // Most forwards go to Revenue dept
    assignedAt: new Date()
  };
  
  this.status = 'under_review';
  this.authorityChanges += 1;
  this.lastUpdated = new Date();
  
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
applicationSchema.statics.getApplicationsForAuthority = async function(designation, status = null) {
  const query = { 'currentAuthority.designation': designation };
  
  if (status) {
    query.status = status;
  } else {
    // By default, exclude completed applications
    query.status = { $nin: ['approved', 'rejected'] };
  }
  
  return await this.find(query)
    .sort({ submittedAt: -1 })
    .populate('userId', 'name mobile');
};

// Get application statistics
applicationSchema.statics.getApplicationStats = async function(designation = null) {
  const matchStage = designation ? 
    { 'currentAuthority.designation': designation } : {};
  
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

module.exports = mongoose.model('Application', applicationSchema);