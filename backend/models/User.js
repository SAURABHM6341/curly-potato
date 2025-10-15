/**
 * User Model Schema for MongoDB
 * Stores user information after successful Aadhaar verification
 * Includes masking for sensitive fields and proper indexing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  // Unique identifier for the user
  userId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },

  // System-generated User ID for login (e.g., USER_123456)
  loginUserId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },

  // System-generated password for login
  password: {
    type: String,
    required: true,
    select: false // Don't include in queries by default
  },

  // Personal Information (from Aadhaar verification)
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other']
  },

  // Contact Information
  mobile: {
    type: String,
    required: true,
    unique: true,
    // Mobile stored as masked for privacy (e.g., ******7890)
    validate: {
      validator: function(v) {
        return /^[*]{6}\d{4}$/.test(v) || /^\+91\d{10}$/.test(v);
      },
      message: 'Mobile number must be masked (******7890) or valid (+91xxxxxxxxxx)'
    }
  },

  // Original mobile for internal use (encrypted)
  mobileOriginal: {
    type: String,
    required: true,
    select: false // Don't include in queries by default
  },

  // Address Information
  address: {
    line1: {
      type: String,
      required: true,
      maxlength: 200
    },
    line2: {
      type: String,
      maxlength: 200
    },
    city: {
      type: String,
      required: true,
      maxlength: 100
    },
    state: {
      type: String,
      required: true,
      maxlength: 100
    },
    pincode: {
      type: String,
      required: true,
      match: /^[1-9][0-9]{5}$/
    }
  },

  // Aadhaar Information (Security Critical)
  aadhaarHash: {
    type: String,
    required: true,
    unique: true,
    select: false // Never include in queries by default
  },

  // Verification Status
  isVerified: {
    type: Boolean,
    default: true, // Set to true after Aadhaar verification
    required: true
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Verification Timestamps
  mobileVerifiedAt: {
    type: Date,
    required: true
  },

  aadhaarVerifiedAt: {
    type: Date,
    required: true
  },

  // Account Management
  lastLogin: {
    type: Date
  },

  loginCount: {
    type: Number,
    default: 0
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Schema options
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'users'
});

// Indexes for performance
UserSchema.index({ mobile: 1 });
UserSchema.index({ userId: 1 });
UserSchema.index({ loginUserId: 1 });
UserSchema.index({ aadhaarHash: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for age calculation
UserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for masked Aadhaar display (never show actual hash)
UserSchema.virtual('aadhaarMasked').get(function() {
  return 'XXXX-XXXX-****'; // Always show masked format
});

// Instance Methods

/**
 * Mask mobile number for display
 * @param {string} mobile - Original mobile number
 * @returns {string} Masked mobile number
 */
UserSchema.methods.maskMobile = function(mobile) {
  if (!mobile) return '';
  return mobile.replace(/^(\+91)?(\d{6})(\d{4})$/, '******$3');
};

/**
 * Update last login timestamp and increment login count
 */
UserSchema.methods.recordLogin = function() {
  this.lastLogin = new Date();
  this.loginCount = (this.loginCount || 0) + 1;

  // Update fields in the database without running full document validation.
  // Using updateOne on the document avoids triggering required-field validation
  // for fields that may be missing on partially selected documents.
  return this.updateOne({ $set: { lastLogin: this.lastLogin, loginCount: this.loginCount } });
};

/**
 * Get user profile (safe fields only)
 * @returns {Object} Safe user profile data
 */
UserSchema.methods.getProfile = function() {
  return {
    userId: this.userId,
    loginUserId: this.loginUserId, // Added for Navbar display
    name: this.name,
    dateOfBirth: this.dateOfBirth,
    age: this.age,
    gender: this.gender,
    mobile: this.mobile, // Already masked
    address: this.address,
    aadhaarMasked: this.aadhaarMasked,
    isVerified: this.isVerified,
    isActive: this.isActive,
    mobileVerifiedAt: this.mobileVerifiedAt,
    aadhaarVerifiedAt: this.aadhaarVerifiedAt,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    createdAt: this.createdAt
  };
};

// Static Methods

/**
 * Create a new user after Aadhaar verification
 * @param {Object} userData - User data from Aadhaar verification
 * @param {string} mobileOriginal - Original mobile number
 * @param {string} aadhaarHash - Hashed Aadhaar number
 * @returns {Promise<User>} Created user
 */
UserSchema.statics.createVerifiedUser = async function(userData, mobileOriginal, aadhaarHash) {
  const maskedMobile = userData.mobile.replace(/^(\+91)?(\d{6})(\d{4})$/, '******$3');
  
  // Generate login credentials
  const loginUserId = await this.generateLoginUserId();
  const generatedPassword = this.generatePassword();
  const hashedPassword = await bcrypt.hash(generatedPassword, 12);
  
  const user = new this({
    name: userData.name,
    dateOfBirth: new Date(userData.dateOfBirth),
    gender: userData.gender,
    mobile: maskedMobile,
    mobileOriginal: mobileOriginal,
    loginUserId: loginUserId,
    password: hashedPassword,
    address: userData.address,
    aadhaarHash: aadhaarHash,
    isVerified: true,
    mobileVerifiedAt: new Date(),
    aadhaarVerifiedAt: new Date()
  });

  const savedUser = await user.save();
  
  // Log credentials for testing (remove in production)
  console.log('🆔 USER CREDENTIALS GENERATED:');
  console.log(`   User ID: ${loginUserId}`);
  console.log(`   Password: ${generatedPassword}`);
  console.log(`   Name: ${userData.name}`);
  console.log(`   Mobile: ${maskedMobile}`);
  console.log('   ⚠️  Save these credentials for login!');
  
  return { newUser: savedUser, generatedPassword };
};

/**
 * Generate unique login User ID
 * @returns {Promise<string>} Generated User ID
 */
UserSchema.statics.generateLoginUserId = async function() {
  let loginUserId;
  let exists = true;
  
  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    loginUserId = `USER_${randomNum}`;
    exists = await this.findOne({ loginUserId });
  }
  
  return loginUserId;
};

/**
 * Generate secure random password
 * @returns {string} Generated password
 */
UserSchema.statics.generatePassword = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return password;
};

/**
 * Find user by login User ID
 * @param {string} loginUserId - Login User ID
 * @returns {Promise<User|null>} Found user or null
 */
UserSchema.statics.findByLoginUserId = async function(loginUserId) {
  return await this.findOne({ loginUserId }).select('+password');
};

/**
 * Verify password
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} True if password matches
 */
UserSchema.methods.verifyPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Find user by mobile number (checks both masked and original)
 * @param {string} mobile - Mobile number to search
 * @returns {Promise<User|null>} Found user or null
 */
UserSchema.statics.findByMobile = async function(mobile) {
  const maskedMobile = mobile.replace(/^(\+91)?(\d{6})(\d{4})$/, '******$3');
  
  return await this.findOne({
    $or: [
      { mobile: maskedMobile },
      { mobileOriginal: mobile }
    ]
  });
};

/**
 * Find user by Aadhaar hash
 * @param {string} aadhaarHash - Hashed Aadhaar number
 * @returns {Promise<User|null>} Found user or null
 */
UserSchema.statics.findByAadhaarHash = async function(aadhaarHash) {
  return await this.findOne({ aadhaarHash }).select('+aadhaarHash');
};

// Pre-save middleware to update timestamps
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);