/**
 * JWT Utility Functions
 * Handles JWT token generation, verification, and management
 * Supports both temporary tokens (for multi-step verification) and permanent tokens (for dashboard access)
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class JWTManager {
  /**
   * Generate temporary JWT token for Aadhaar verification step
   * Valid only for completing the signup process
   * @param {string} mobile - Verified mobile number
   * @param {string} mobileSessionId - Session ID from mobile OTP verification
   * @returns {Object} Token details
   */
  static generateTempToken(mobile, mobileSessionId) {
    const payload = {
      type: 'temporary',
      mobile: mobile,
      sessionId: mobileSessionId,
      jti: uuidv4(), // JWT ID for tracking
      purpose: 'aadhaar_verification',
      iat: Math.floor(Date.now() / 1000), // Issued at
    };

    const token = jwt.sign(payload, config.jwt.tempSecret, {
      expiresIn: config.jwt.tempExpiresIn,
      issuer: config.app.name,
      audience: 'aadhaar-verification'
    });

    console.log('🔑 TEMPORARY JWT GENERATED:', {
      mobile: this.maskMobile(mobile),
      sessionId: mobileSessionId,
      expiresIn: config.jwt.tempExpiresIn,
      purpose: 'Aadhaar verification'
    });

    return {
      token,
      type: 'temporary',
      expiresIn: config.jwt.tempExpiresIn,
      purpose: 'aadhaar_verification'
    };
  }

  /**
   * Generate permanent JWT token for dashboard access
   * Valid for long-term user authentication
   * @param {Object} user - User object from database
   * @returns {Object} Token details
   */
  static generatePermanentToken(user) {
    const payload = {
      type: 'permanent',
      userId: user.userId,
      mobile: user.mobile, // Already masked in database
      name: user.name,
      jti: uuidv4(), // JWT ID for tracking
      purpose: 'dashboard_access',
      iat: Math.floor(Date.now() / 1000), // Issued at
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.permanentExpiresIn,
      issuer: config.app.name,
      audience: 'dashboard'
    });

    console.log('🔑 PERMANENT JWT GENERATED:', {
      userId: user.userId,
      mobile: user.mobile,
      name: user.name,
      expiresIn: config.jwt.permanentExpiresIn,
      purpose: 'Dashboard access'
    });

    return {
      token,
      type: 'permanent',
      expiresIn: config.jwt.permanentExpiresIn,
      purpose: 'dashboard_access'
    };
  }

  /**
   * Verify temporary JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Verification result
   */
  static verifyTempToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.tempSecret, {
        issuer: config.app.name,
        audience: 'aadhaar-verification'
      });

      // Check token type
      if (decoded.type !== 'temporary') {
        return {
          success: false,
          error: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        };
      }

      // Check purpose
      if (decoded.purpose !== 'aadhaar_verification') {
        return {
          success: false,
          error: 'Invalid token purpose',
          code: 'INVALID_TOKEN_PURPOSE'
        };
      }

      return {
        success: true,
        payload: decoded,
        mobile: decoded.mobile,
        sessionId: decoded.sessionId
      };
    } catch (error) {
      return this.handleJWTError(error);
    }
  }

  /**
   * Verify permanent JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Verification result
   */
  static verifyPermanentToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: config.app.name,
        audience: 'dashboard'
      });

      // Check token type
      if (decoded.type !== 'permanent') {
        return {
          success: false,
          error: 'Invalid token type',
          code: 'INVALID_TOKEN_TYPE'
        };
      }

      // Check purpose
      if (decoded.purpose !== 'dashboard_access') {
        return {
          success: false,
          error: 'Invalid token purpose',
          code: 'INVALID_TOKEN_PURPOSE'
        };
      }

      return {
        success: true,
        payload: decoded,
        userId: decoded.userId,
        mobile: decoded.mobile,
        name: decoded.name
      };
    } catch (error) {
      return this.handleJWTError(error);
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   * @param {string} token - JWT token to decode
   * @returns {Object} Decoded token or null
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {string} token - JWT token to check
   * @returns {boolean} True if expired
   */
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiry time
   * @param {string} token - JWT token
   * @returns {Date|null} Expiry date or null
   */
  static getTokenExpiry(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract bearer token from authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null
   */
  static extractBearerToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Handle JWT verification errors
   * @param {Error} error - JWT error
   * @returns {Object} Error result
   */
  static handleJWTError(error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return {
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
          expiredAt: error.expiredAt
        };
      case 'JsonWebTokenError':
        return {
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        };
      case 'NotBeforeError':
        return {
          success: false,
          error: 'Token not active',
          code: 'TOKEN_NOT_ACTIVE'
        };
      default:
        return {
          success: false,
          error: 'Token verification failed',
          code: 'VERIFICATION_FAILED'
        };
    }
  }

  /**
   * Mask mobile number for logging
   * @param {string} mobile - Mobile number
   * @returns {string} Masked mobile number
   */
  static maskMobile(mobile) {
    if (!mobile) return '';
    return mobile.replace(/^(\+91)?(\d{6})(\d{4})$/, '$1******$3');
  }

  /**
   * Generate token metadata for response
   * @param {string} token - JWT token
   * @param {string} type - Token type
   * @returns {Object} Token metadata
   */
  static getTokenMetadata(token, type) {
    const decoded = jwt.decode(token);
    const expiry = this.getTokenExpiry(token);
    
    return {
      type: type,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: expiry,
      issuer: decoded.iss,
      audience: decoded.aud,
      jwtId: decoded.jti
    };
  }
}

module.exports = JWTManager;