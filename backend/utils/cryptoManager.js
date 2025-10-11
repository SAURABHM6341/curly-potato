/**
 * Cryptography Utility Functions
 * Handles secure hashing of sensitive data like Aadhaar numbers
 * Uses strong cryptographic functions for data protection
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config');

class CryptoManager {
  /**
   * Generate secure hash for Aadhaar number
   * Uses SHA-256 with salt for one-way hashing
   * @param {string} aadhaar - Aadhaar number (12 digits)
   * @returns {string} Secure hash
   */
  static hashAadhaar(aadhaar) {
    // Remove any spaces or hyphens
    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '');
    
    // Validate Aadhaar format
    if (!/^[2-9]\d{11}$/.test(cleanAadhaar)) {
      throw new Error('Invalid Aadhaar number format');
    }

    // Create salt with app-specific prefix
    const salt = crypto.createHash('sha256')
      .update(`${config.app.name}:aadhaar:${cleanAadhaar}`)
      .digest('hex');

    // Generate secure hash
    const hash = crypto.createHash('sha256')
      .update(`${salt}:${cleanAadhaar}:${config.jwt.secret}`)
      .digest('hex');

    console.log('🔐 AADHAAR HASHED:', {
      originalLength: cleanAadhaar.length,
      hashLength: hash.length,
      algorithm: 'SHA-256'
    });

    return hash;
  }

  /**
   * Encrypt mobile number for secure storage
   * @param {string} mobile - Mobile number
   * @returns {string} Encrypted mobile number
   */
  static encryptMobile(mobile) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(config.jwt.secret, 'mobile-salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('mobile-encryption'));
    
    let encrypted = cipher.update(mobile, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt mobile number
   * @param {string} encryptedMobile - Encrypted mobile number
   * @returns {string} Decrypted mobile number
   */
  static decryptMobile(encryptedMobile) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(config.jwt.secret, 'mobile-salt', 32);
      
      const [ivHex, authTagHex, encrypted] = encryptedMobile.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('mobile-encryption'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt mobile number');
    }
  }

  /**
   * Generate secure random string
   * @param {number} length - Length of random string
   * @returns {string} Random string
   */
  static generateRandomString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate session ID with timestamp
   * @returns {string} Unique session ID
   */
  static generateSessionId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(16).toString('hex');
    return `${timestamp}_${random}`;
  }

  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, config.security.bcryptSaltRounds);
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Create HMAC signature
   * @param {string} data - Data to sign
   * @param {string} secret - Secret key
   * @returns {string} HMAC signature
   */
  static createHMAC(data, secret = config.jwt.secret) {
    return crypto.createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify HMAC signature
   * @param {string} data - Original data
   * @param {string} signature - HMAC signature to verify
   * @param {string} secret - Secret key
   * @returns {boolean} True if signature is valid
   */
  static verifyHMAC(data, signature, secret = config.jwt.secret) {
    const expectedSignature = this.createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate checksum for data integrity
   * @param {string} data - Data to checksum
   * @returns {string} Checksum
   */
  static generateChecksum(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Sanitize and validate Aadhaar number
   * @param {string} aadhaar - Aadhaar number input
   * @returns {Object} Validation result
   */
  static validateAadhaar(aadhaar) {
    if (!aadhaar) {
      return { valid: false, error: 'Aadhaar number is required' };
    }

    // Remove spaces and hyphens
    const cleaned = aadhaar.replace(/[\s-]/g, '');

    // Check length
    if (cleaned.length !== 12) {
      return { valid: false, error: 'Aadhaar number must be 12 digits' };
    }

    // Check if all digits
    if (!/^\d{12}$/.test(cleaned)) {
      return { valid: false, error: 'Aadhaar number must contain only digits' };
    }

    // Check if starts with 0 or 1 (invalid)
    if (/^[01]/.test(cleaned)) {
      return { valid: false, error: 'Aadhaar number cannot start with 0 or 1' };
    }

    // Simple checksum validation (Verhoeff algorithm - simplified)
    if (!this.verifyAadhaarChecksum(cleaned)) {
      return { valid: false, error: 'Invalid Aadhaar number checksum' };
    }

    return { valid: true, cleaned };
  }

  /**
   * Verify Aadhaar checksum using simplified Verhoeff algorithm
   * @param {string} aadhaar - Clean 12-digit Aadhaar number
   * @returns {boolean} True if checksum is valid
   */
  static verifyAadhaarChecksum(aadhaar) {
    const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];
    const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

    let c = 0;
    const a = aadhaar.split('').reverse().map(Number);

    for (let i = 0; i < a.length; i++) {
        c = d[c][p[i % 8][a[i]]];
    }

    return c === 0;
  }

  /**
   * Mask sensitive data for logging
   * @param {string} data - Sensitive data
   * @param {number} visibleChars - Number of characters to show at end
   * @returns {string} Masked data
   */
  static maskSensitiveData(data, visibleChars = 4) {
    if (!data || data.length <= visibleChars) return data;
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }
}

module.exports = CryptoManager;