/**
 * Session Authentication Middleware
 * Replaces JWT-based authentication with session-based authentication
 * Handles both user and authority session validation
 */

class SessionAuth {
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
   * Check if user is authenticated (has valid session)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
        message: 'Please log in to access this resource'
      });
    }

    // Check if session is still valid
    if (req.session.user.expiresAt && new Date() > new Date(req.session.user.expiresAt)) {
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      
      return res.status(401).json({
        success: false,
        error: 'Session expired',
        code: 'SESSION_EXPIRED',
        message: 'Your session has expired. Please log in again.'
      });
    }

    // Attach user data to request
    req.user = req.session.user;
    next();
  }

  /**
   * Check if authority is authenticated (has valid authority session)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static requireAuthorityAuth(req, res, next) {
    if (!req.session || !req.session.authority) {
      return res.status(401).json({
        success: false,
        error: 'Authority authentication required',
        code: 'AUTHORITY_NOT_AUTHENTICATED',
        message: 'Please log in as an authority to access this resource'
      });
    }

    // Check if session is still valid
    if (req.session.authority.expiresAt && new Date() > new Date(req.session.authority.expiresAt)) {
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
      });
      
      return res.status(401).json({
        success: false,
        error: 'Authority session expired',
        code: 'AUTHORITY_SESSION_EXPIRED',
        message: 'Your authority session has expired. Please log in again.'
      });
    }

    // Attach authority data to request
    req.authority = req.session.authority;
    next();
  }

  /**
   * Check minimum access level for authority
   * @param {number} minAccessLevel - Minimum required access level
   * @returns {Function} Express middleware function
   */
  static requireAccessLevel(minAccessLevel) {
    return (req, res, next) => {
      if (!req.authority) {
        return res.status(401).json({
          success: false,
          error: 'Authority authentication required',
          code: 'AUTHORITY_NOT_AUTHENTICATED'
        });
      }

      if (req.authority.accessLevel < minAccessLevel) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient access level',
          code: 'INSUFFICIENT_ACCESS',
          required: minAccessLevel,
          current: req.authority.accessLevel
        });
      }

      next();
    };
  }

  /**
   * Optional authentication (doesn't fail if no session)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static optionalAuth(req, res, next) {
    if (req.session && req.session.user) {
      // Check if session is still valid
      if (!req.session.user.expiresAt || new Date() <= new Date(req.session.user.expiresAt)) {
        req.user = req.session.user;
      }
    }
    next();
  }

  /**
   * Check if user is already logged in (for login/signup routes)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      return res.status(200).json({
        success: true,
        message: 'User already authenticated',
        user: {
          userId: req.session.user.userId,
          loginUserId: req.session.user.loginUserId,
          name: req.session.user.name,
          mobile: req.session.user.mobile
        },
        redirect: '/dashboard'
      });
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
   * Request logging middleware with session info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static requestLogger(req, res, next) {
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress;
    
    let sessionInfo = '';
    if (req.session && req.session.user) {
      sessionInfo = ` - User: ${req.session.user.loginUserId}`;
    } else if (req.session && req.session.authority) {
      sessionInfo = ` - Authority: ${req.session.authority.designation}`;
    }
    
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip}${sessionInfo}`);
    
    next();
  }

  /**
   * Session cleanup middleware (removes expired session data)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  static sessionCleanup(req, res, next) {
    if (req.session) {
      // Remove expired user session
      if (req.session.user && req.session.user.expiresAt && 
          new Date() > new Date(req.session.user.expiresAt)) {
        delete req.session.user;
      }

      // Remove expired authority session
      if (req.session.authority && req.session.authority.expiresAt && 
          new Date() > new Date(req.session.authority.expiresAt)) {
        delete req.session.authority;
      }

      // If session is empty, destroy it
      if (!req.session.user && !req.session.authority && 
          Object.keys(req.session).length <= 2) { // Only contains session metadata
        req.session.destroy((err) => {
          if (err) console.error('Session cleanup error:', err);
        });
      }
    }
    next();
  }
}

module.exports = SessionAuth;