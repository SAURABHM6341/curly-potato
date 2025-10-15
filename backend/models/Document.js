/**
 * Document Model
 * Stores uploaded document metadata and links to applications
 */

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'DOC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  },
  
  // User who uploaded the document
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // Document type (aadhaar, address_proof, income_proof, etc.)
  type: {
    type: String,
    required: true,
    enum: [
      'aadhaar',
      'address_proof', 
      'income_proof',
      'age_proof',
      'caste_certificate',
      'income_certificate',
      'domicile_certificate',
      'character_certificate',
      'educational_certificate',
      'employment_certificate',
      'business_proof',
      'bank_passbook',
      'land_documents',
      'construction_estimate',
      'other'
    ]
  },
  
  // Original file details
  originalName: {
    type: String,
    required: true
  },
  
  // Cloudinary details
  cloudinaryUrl: {
    type: String,
    required: true
  },
  
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  
  fileFormat: {
    type: String,
    required: true
  },
  
  fileSizeBytes: {
    type: Number,
    required: true
  },
  
  // Applications that use this document
  linkedApplications: [{
    applicationId: {
      type: String,
      required: true
    },
    linkedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['submitted', 'verified', 'rejected', 'pending'],
      default: 'submitted'
    },
    verificationComments: {
      type: String,
      default: ''
    },
    verifiedBy: {
      type: String,
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    }
  }],
  
  // Document status across all applications
  overallStatus: {
    type: String,
    enum: ['submitted', 'verified', 'rejected', 'pending'],
    default: 'submitted'
  },
  
  // Metadata
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Comments or notes
  comments: {
    type: String,
    default: ''
  },
  
  // Verification history
  verificationHistory: [{
    action: {
      type: String,
      enum: ['uploaded', 'verified', 'rejected', 'resubmitted'],
      required: true
    },
    performedBy: {
      type: String,
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    comments: {
      type: String,
      default: ''
    },
    applicationId: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
documentSchema.index({ userId: 1, type: 1 });
documentSchema.index({ 'linkedApplications.applicationId': 1 });
documentSchema.index({ type: 1, overallStatus: 1 });
documentSchema.index({ documentId: 1 });

// Methods

// Add application link
documentSchema.methods.linkToApplication = function(applicationId, comments = '') {
  const existingLink = this.linkedApplications.find(
    link => link.applicationId === applicationId
  );
  
  if (!existingLink) {
    this.linkedApplications.push({
      applicationId,
      status: 'submitted',
      verificationComments: comments
    });
    
    this.verificationHistory.push({
      action: 'uploaded',
      performedBy: this.userId,
      applicationId,
      comments: `Document linked to application ${applicationId}`
    });
    
    this.lastUpdated = new Date();
  }
  
  return this;
};

// Update verification status for specific application
documentSchema.methods.updateVerificationStatus = function(applicationId, status, verifiedBy, comments = '') {
  const link = this.linkedApplications.find(
    link => link.applicationId === applicationId
  );
  
  if (link) {
    link.status = status;
    link.verificationComments = comments;
    link.verifiedBy = verifiedBy;
    link.verifiedAt = new Date();
    
    this.verificationHistory.push({
      action: status,
      performedBy: verifiedBy,
      applicationId,
      comments
    });
    
    // Update overall status based on all linked applications
    this.updateOverallStatus();
    this.lastUpdated = new Date();
  }
  
  return this;
};

// Update overall status based on all linked applications
documentSchema.methods.updateOverallStatus = function() {
  if (this.linkedApplications.length === 0) {
    this.overallStatus = 'submitted';
    return this;
  }
  
  const statuses = this.linkedApplications.map(link => link.status);
  
  if (statuses.every(status => status === 'verified')) {
    this.overallStatus = 'verified';
  } else if (statuses.some(status => status === 'rejected')) {
    this.overallStatus = 'rejected';
  } else if (statuses.some(status => status === 'verified')) {
    this.overallStatus = 'verified'; // At least one verified
  } else {
    this.overallStatus = 'pending';
  }
  
  return this;
};

// Static methods

// Find documents by user and type
documentSchema.statics.findByUserAndType = function(userId, type) {
  return this.find({ userId, type }).sort({ uploadedAt: -1 });
};

// Find documents for application
documentSchema.statics.findForApplication = function(applicationId) {
  return this.find({ 'linkedApplications.applicationId': applicationId });
};

// Find reusable documents for user (verified documents)
documentSchema.statics.findReusableDocuments = function(userId, documentTypes) {
  return this.find({
    userId,
    type: { $in: documentTypes },
    overallStatus: 'verified'
  }).sort({ uploadedAt: -1 });
};

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;