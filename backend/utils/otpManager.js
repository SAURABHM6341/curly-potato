/**
 * OTP Utility Functions
 * Handles OTP generation, storage, validation, and cleanup
 * Uses in-memory storage for prototyping (can be replaced with Redis later)
 */

const otpGenerator = require('otp-generator');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// In-memory storage for OTPs (Replace with Redis in production)
class OTPStorage {
  constructor() {
    this.storage = new Map();
    this.cleanup();
  }

  /**
   * Store OTP with expiry
   * @param {string} key - Storage key
   * @param {Object} data - OTP data
   */
  set(key, data) {
    this.storage.set(key, {
      ...data,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (config.otp.expiryMinutes * 60 * 1000))
    });
  }

  /**
   * Retrieve OTP data
   * @param {string} key - Storage key
   * @returns {Object|null} OTP data or null if not found/expired
   */
  get(key) {
    const data = this.storage.get(key);
    if (!data) return null;

    // Check if expired
    if (new Date() > data.expiresAt) {
      this.storage.delete(key);
      return null;
    }

    return data;
  }

  /**
   * Delete OTP data
   * @param {string} key - Storage key
   */
  delete(key) {
    this.storage.delete(key);
  }

  /**
   * Check if key exists and is valid
   * @param {string} key - Storage key
   * @returns {boolean} True if exists and valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Get storage size
   * @returns {number} Number of stored OTPs
   */
  size() {
    return this.storage.size;
  }

  /**
   * Clean up expired OTPs every minute
   */
  cleanup() {
    setInterval(() => {
      const now = new Date();
      for (const [key, data] of this.storage.entries()) {
        if (now > data.expiresAt) {
          this.storage.delete(key);
        }
      }
    }, 60000); // Run every minute
  }
}

// Singleton OTP storage instance
const otpStorage = new OTPStorage();

class OTPManager {
  /**
   * Generate a new OTP
   * @param {string} type - OTP type ('mobile' or 'aadhaar')
   * @param {string} identifier - Mobile number or Aadhaar number
   * @returns {Object} OTP details
   */
  static generateOTP(type, identifier) {
    // Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(config.otp.length, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    // Create unique session ID for this OTP
    const sessionId = uuidv4();
    
    // Create storage key
    const storageKey = `${type}:${identifier}`;
    
    // Store OTP data
    const otpData = {
      otp,
      type,
      identifier,
      sessionId,
      attempts: 0,
      maxAttempts: 3,
      isUsed: false
    };

    otpStorage.set(storageKey, otpData);

    // Log OTP to console (for testing - remove in production)
    console.log('📱 OTP GENERATED:', {
      type: type.toUpperCase(),
      identifier: this.maskIdentifier(identifier, type),
      otp: otp,
      sessionId: sessionId,
      expiresIn: `${config.otp.expiryMinutes} minutes`
    });

    return {
      sessionId,
      message: `OTP sent to ${this.maskIdentifier(identifier, type)}`,
      expiresIn: config.otp.expiryMinutes * 60, // seconds
      otpForTesting: otp // Include OTP for testing (remove in production)
    };
  }

  /**
   * Verify OTP
   * @param {string} type - OTP type ('mobile' or 'aadhaar')
   * @param {string} identifier - Mobile number or Aadhaar number
   * @param {string} otp - OTP to verify
   * @param {string} sessionId - Session ID from generation
   * @returns {Object} Verification result
   */
  static verifyOTP(type, identifier, otp, sessionId) {
    const storageKey = `${type}:${identifier}`;
    const otpData = otpStorage.get(storageKey);

    // Check if OTP exists
    if (!otpData) {
      return {
        success: false,
        error: 'OTP not found or expired',
        code: 'OTP_NOT_FOUND'
      };
    }

    // Verify session ID
    if (otpData.sessionId !== sessionId) {
      return {
        success: false,
        error: 'Invalid session',
        code: 'INVALID_SESSION'
      };
    }

    // Check if already used
    if (otpData.isUsed) {
      return {
        success: false,
        error: 'OTP already used',
        code: 'OTP_ALREADY_USED'
      };
    }

    // Check attempt limit
    if (otpData.attempts >= otpData.maxAttempts) {
      otpStorage.delete(storageKey);
      return {
        success: false,
        error: 'Maximum attempts exceeded',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      };
    }

    // Increment attempt count
    otpData.attempts += 1;
    otpStorage.set(storageKey, otpData);

    // Verify OTP
    if (otpData.otp !== otp) {
      const remainingAttempts = otpData.maxAttempts - otpData.attempts;
      return {
        success: false,
        error: 'Invalid OTP',
        code: 'INVALID_OTP',
        remainingAttempts
      };
    }

    // Mark as used
    otpData.isUsed = true;
    otpStorage.set(storageKey, otpData);

    console.log('✅ OTP VERIFIED:', {
      type: type.toUpperCase(),
      identifier: this.maskIdentifier(identifier, type),
      sessionId: sessionId
    });

    return {
      success: true,
      message: 'OTP verified successfully',
      sessionId: otpData.sessionId
    };
  }

  /**
   * Resend OTP (generates new OTP for same identifier)
   * @param {string} type - OTP type ('mobile' or 'aadhaar')
   * @param {string} identifier - Mobile number or Aadhaar number
   * @returns {Object} New OTP details
   */
  static resendOTP(type, identifier) {
    // Clear existing OTP
    const storageKey = `${type}:${identifier}`;
    otpStorage.delete(storageKey);

    // Generate new OTP
    return this.generateOTP(type, identifier);
  }

  /**
   * Mask identifier for logging/display
   * @param {string} identifier - Original identifier
   * @param {string} type - Type of identifier
   * @returns {string} Masked identifier
   */
  static maskIdentifier(identifier, type) {
    if (type === 'mobile') {
      // Mask mobile: +91XXXXXX7890 or XXXXXX7890
      return identifier.replace(/^(\+91)?(\d{6})(\d{4})$/, '$1******$3');
    } else if (type === 'aadhaar') {
      // Mask Aadhaar: XXXX-XXXX-X789
      return identifier.replace(/^(\d{4})(\d{4})(\d{3})(\d{1})$/, 'XXXX-XXXX-X$4**');
    }
    return identifier;
  }

  /**
   * Cleanup specific OTP
   * @param {string} type - OTP type
   * @param {string} identifier - Identifier
   */
  static cleanupOTP(type, identifier) {
    const storageKey = `${type}:${identifier}`;
    otpStorage.delete(storageKey);
  }

  /**
   * Get OTP statistics (for monitoring)
   * @returns {Object} OTP storage statistics
   */
  static getStats() {
    return {
      totalActiveOTPs: otpStorage.size(),
      storage: 'in-memory',
      expiryMinutes: config.otp.expiryMinutes
    };
  }

  /**
   * Validate mobile number format
   * @param {string} mobile - Mobile number
   * @returns {boolean} True if valid
   */
  static isValidMobile(mobile) {
    return /^\+91[6-9]\d{9}$/.test(mobile);
  }

  /**
   * Validate Aadhaar number format (basic check)
   * @param {string} aadhaar - Aadhaar number
   * @returns {boolean} True if valid format
   */
  static isValidAadhaar(aadhaar) {
    // Basic format check: 12 digits, not starting with 0 or 1
    return /^[2-9]\d{11}$/.test(aadhaar);
  }
}

module.exports = OTPManager;