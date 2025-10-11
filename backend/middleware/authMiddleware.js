/**
 * Authentication Middleware
 * Handles JWT token verification and request validation
 */

const JWTManager = require('../utils/jwtManager');

class AuthMiddleware {
  /**
   * Validate request body for required fields
   * @param {string[]} requiredFields - Array of required field names
   * @returns {Function} Express middleware function
   */
  static validateRequest(requiredFields) {
    return (req, res, next) => {
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          missingFields,
          code: 'MISSING_FIELDS'
        });
      }
      next();
    };
  }

  /**
   * Verify temporary JWT token for multi-step signup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static verifyTempToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = JWTManager.extractBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Temporary token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const verification = JWTManager.verifyTempToken(token);
    if (!verification.success) {
      return res.status(401).json({
        success: false,
        error: verification.error,
        code: verification.code
      });
    }

    req.tempToken = verification;
    next();
  }

  /**
   * Verify permanent JWT token for protected routes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static verifyPermanentToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = JWTManager.extractBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required',
        code: 'TOKEN_REQUIRED'
      });
    }

    const verification = JWTManager.verifyPermanentToken(token);
    if (!verification.success) {
      return res.status(401).json({
        success: false,
        error: verification.error,
        code: verification.code
      });
    }

    req.user = verification;
    next();
  }

  /**
   * Optional token verification (doesn't fail if no token)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = JWTManager.extractBearerToken(authHeader);

    if (token) {
      const verification = JWTManager.verifyPermanentToken(token);
      if (verification.success) {
        req.user = verification;
      }
    }

    next();
  }

  /**
   * Rate limiting middleware (simple implementation)
   * @param {number} windowMs - Time window in milliseconds
   * @param {number} maxRequests - Maximum requests per window
   * @returns {Function} Express middleware function
   */
  static rateLimit(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    const requests = new Map();

    return (req, res, next) => {
      const clientIp = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      if (!requests.has(clientIp)) {
        requests.set(clientIp, { count: 1, resetTime: now + windowMs });
        return next();
      }

      const clientData = requests.get(clientIp);
      
      if (now > clientData.resetTime) {
        requests.set(clientIp, { count: 1, resetTime: now + windowMs });
        return next();
      }

      if (clientData.count >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          resetTime: new Date(clientData.resetTime)
        });
      }

      clientData.count++;
      next();
    };
  }

  /**
   * CORS middleware with specific origins
   * @param {string[]} allowedOrigins - Array of allowed origins
   * @returns {Function} Express middleware function
   */
  static corsHandler(allowedOrigins = ['http://localhost:3000', 'http://localhost:5173']) {
    return (req, res, next) => {
      const origin = req.headers.origin;
      
      if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', true);

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }

      next();
    };
  }

  /**
   * Security headers middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.removeHeader('X-Powered-By');
    next();
  }

  /**
   * Request logging middleware
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent.substring(0, 50)}`);
    
    next();
  }
}

module.exports = AuthMiddleware;