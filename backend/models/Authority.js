/**
 * Authority Model Schema for MongoDB
 * Stores designation-based authority accounts for form verification
 * Each authority represents a role/designation, not a specific person
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const AuthoritySchema = new mongoose.Schema({
  // Unique identifier for the authority
  authorityId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },

  // Designation-based login ID (e.g., DISTRICT_MAGISTRATE, FIELD_VERIFIER)
  designation: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },

  // Human-readable designation name
  designationName: {
    type: String,
    required: true,
    maxlength: 100
  },

  // Contact information
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },

  // Hashed password for login
  password: {
    type: String,
    required: true,
    select: false // Don't include in queries by default
  },

  // Access level (1 = lowest, 5 = highest)
  accessLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 1
  },

  // Department/Office information
  department: {
    type: String,
    required: true,
    maxlength: 100
  },

  office: {
    type: String,
    required: true,
    maxlength: 100
  },

  // Jurisdiction (district, state, etc.)
  jurisdiction: {
    type: String,
    required: true,
    maxlength: 100
  },

  // Form management
  assignedForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  }],

  verifiedForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  }],

  rejectedForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  }],

  // Account status
  isActive: {
    type: Boolean,
    default: true
  },

  // Login tracking
  lastLogin: {
    type: Date
  },

  loginCount: {
    type: Number,
    default: 0
  },

  // Creation and update timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'authorities'
});

// Indexes for performance
AuthoritySchema.index({ designation: 1 });
AuthoritySchema.index({ accessLevel: 1 });
AuthoritySchema.index({ department: 1 });
AuthoritySchema.index({ isActive: 1 });
AuthoritySchema.index({ createdAt: -1 });

// Virtual for form statistics
AuthoritySchema.virtual('formStats').get(function() {
  return {
    assigned: this.assignedForms.length,
    verified: this.verifiedForms.length,
    rejected: this.rejectedForms.length,
    pending: this.assignedForms.length - this.verifiedForms.length - this.rejectedForms.length
  };
});

// Instance Methods

/**
 * Verify password
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} True if password matches
 */
AuthoritySchema.methods.verifyPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Update last login timestamp and increment login count
 */
AuthoritySchema.methods.recordLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  return this.save();
};

/**
 * Get authority profile (safe fields only)
 * @returns {Object} Safe authority profile data
 */
AuthoritySchema.methods.getProfile = function() {
  return {
    authorityId: this.authorityId,
    designation: this.designation,
    designationName: this.designationName,
    email: this.email,
    accessLevel: this.accessLevel,
    department: this.department,
    office: this.office,
    jurisdiction: this.jurisdiction,
    formStats: this.formStats,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    createdAt: this.createdAt
  };
};

/**
 * Check if authority can access a specific form
 * @param {string} formId - Form ID to check
 * @returns {boolean} True if can access
 */
AuthoritySchema.methods.canAccessForm = function(formId) {
  return this.assignedForms.includes(formId) || this.accessLevel >= 4;
};

// Static Methods

/**
 * Find authority by designation
 * @param {string} designation - Authority designation
 * @returns {Promise<Authority|null>} Found authority or null
 */
AuthoritySchema.statics.findByDesignation = async function(designation) {
  return await this.findOne({ 
    designation: designation.toUpperCase(),
    isActive: true 
  }).select('+password');
};

/**
 * Create a new authority
 * @param {Object} authorityData - Authority data
 * @returns {Promise<Authority>} Created authority
 */
AuthoritySchema.statics.createAuthority = async function(authorityData) {
  const hashedPassword = await bcrypt.hash(authorityData.password, 12);
  
  const authority = new this({
    designation: authorityData.designation.toUpperCase(),
    designationName: authorityData.designationName,
    email: authorityData.email.toLowerCase(),
    password: hashedPassword,
    accessLevel: authorityData.accessLevel || 1,
    department: authorityData.department,
    office: authorityData.office,
    jurisdiction: authorityData.jurisdiction
  });

  const savedAuthority = await authority.save();
  
  console.log('🏛️ AUTHORITY CREATED:', {
    designation: savedAuthority.designation,
    designationName: savedAuthority.designationName,
    accessLevel: savedAuthority.accessLevel,
    department: savedAuthority.department
  });
  
  return savedAuthority;
};

/**
 * Get authorities by access level
 * @param {number} minAccessLevel - Minimum access level
 * @returns {Promise<Authority[]>} Authorities with specified access level or higher
 */
AuthoritySchema.statics.getByAccessLevel = async function(minAccessLevel) {
  return await this.find({ 
    accessLevel: { $gte: minAccessLevel },
    isActive: true 
  }).sort({ accessLevel: -1 });
};

/**
 * Get authorities by department
 * @param {string} department - Department name
 * @returns {Promise<Authority[]>} Authorities in specified department
 */
AuthoritySchema.statics.getByDepartment = async function(department) {
  return await this.find({ 
    department: department,
    isActive: true 
  }).sort({ accessLevel: -1 });
};

// Pre-save middleware to update timestamps
AuthoritySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are serialized
AuthoritySchema.set('toJSON', { virtuals: true });
AuthoritySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Authority', AuthoritySchema);