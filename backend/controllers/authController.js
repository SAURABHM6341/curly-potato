/**
 * Authentication Controller
 * Handles all authentication-related business logic
 * Includes signup, login (OTP & password), and session management
 */

const OTPManager = require('../utils/otpManager');
const JWTManager = require('../utils/jwtManager');
const CryptoManager = require('../utils/cryptoManager');
const User = require('../models/User');
const Authority = require('../models/Authority');

class AuthController {
  /**
   * Step 1: Request Mobile OTP
   * POST /auth/request-mobile-otp
   */
  static async requestMobileOTP(req, res) {
    try {
      const { mobile } = req.body;

      // Validate mobile number format
      if (!OTPManager.isValidMobile(mobile)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile number format. Use +91XXXXXXXXXX',
          code: 'INVALID_MOBILE_FORMAT'
        });
      }

      // Check if user already exists with this mobile
      const existingUser = await User.findByMobile(mobile);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists with this mobile number',
          code: 'USER_ALREADY_EXISTS'
        });
      }

      // Generate OTP
      const otpResult = OTPManager.generateOTP('mobile', mobile);

      return res.status(200).json({
        success: true,
        message: otpResult.message,
        sessionId: otpResult.sessionId,
        expiresIn: otpResult.expiresIn,
        // Include OTP for testing (remove in production)
        testing: {
          otp: otpResult.otpForTesting,
          note: 'OTP included for testing only'
        }
      });

    } catch (error) {
      console.error('Error requesting mobile OTP:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Step 2: Verify Mobile OTP
   * POST /auth/verify-mobile-otp
   */
  static async verifyMobileOTP(req, res) {
    try {
      const { mobile, otp, sessionId } = req.body;

      // Validate mobile format
      if (!OTPManager.isValidMobile(mobile)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile number format',
          code: 'INVALID_MOBILE_FORMAT'
        });
      }

      // Verify OTP
      const otpVerification = OTPManager.verifyOTP('mobile', mobile, otp, sessionId);
      
      if (!otpVerification.success) {
        return res.status(400).json({
          success: false,
          error: otpVerification.error,
          code: otpVerification.code,
          remainingAttempts: otpVerification.remainingAttempts
        });
      }

      // Generate temporary JWT token for Aadhaar verification
      const tempToken = JWTManager.generateTempToken(mobile, sessionId);

      // Clean up mobile OTP
      OTPManager.cleanupOTP('mobile', mobile);

      return res.status(200).json({
        success: true,
        message: 'Mobile number verified successfully',
        tempToken: tempToken.token,
        tokenType: tempToken.type,
        expiresIn: tempToken.expiresIn,
        nextStep: 'aadhaar_verification',
        instructions: 'Use the temporary token to proceed with Aadhaar verification'
      });

    } catch (error) {
      console.error('Error verifying mobile OTP:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Step 3: Initiate Aadhaar Verification (Mocked)
   * POST /auth/aadhaar/initiate
   */
  static async initiateAadhaarVerification(req, res) {
    try {
      const { aadhaar } = req.body;
      const { mobile } = req.tempToken;

      // Validate Aadhaar number
      const aadhaarValidation = CryptoManager.validateAadhaar(aadhaar);
      if (!aadhaarValidation.valid) {
        return res.status(400).json({
          success: false,
          error: aadhaarValidation.error,
          code: 'INVALID_AADHAAR_FORMAT'
        });
      }

      const cleanAadhaar = aadhaarValidation.cleaned;

      // Check if Aadhaar is already registered
      const aadhaarHash = CryptoManager.hashAadhaar(cleanAadhaar);
      const existingUser = await User.findByAadhaarHash(aadhaarHash);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Aadhaar number is already registered',
          code: 'AADHAAR_ALREADY_EXISTS'
        });
      }

      // Mock: Generate OTP for Aadhaar verification
      // In real implementation, this would trigger UIDAI OTP
      const otpResult = OTPManager.generateOTP('aadhaar', cleanAadhaar);

      return res.status(200).json({
        success: true,
        message: 'Aadhaar OTP sent to registered mobile number',
        sessionId: otpResult.sessionId,
        expiresIn: otpResult.expiresIn,
        aadhaarMasked: CryptoManager.maskSensitiveData(cleanAadhaar, 3),
        // Include OTP for testing (remove in production)
        testing: {
          otp: otpResult.otpForTesting,
          note: 'This is a mocked Aadhaar verification. OTP included for testing.'
        }
      });

    } catch (error) {
      console.error('Error in Aadhaar verification:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * User Login (Step 1) - Initiate login with Aadhaar or User ID
   * POST /auth/login
   */
  static async initiateLogin(req, res) {
    try {
      const { identifier } = req.body; // Can be Aadhaar or User ID

      // Normalize identifier robustly to handle nested or wrapped payloads
      let rawIdentifier = (req.body && req.body.identifier !== undefined) ? req.body.identifier : req.body;

      if (rawIdentifier && typeof rawIdentifier === 'object') {
        if (typeof rawIdentifier.identifier === 'string' || typeof rawIdentifier.identifier === 'number') {
          rawIdentifier = rawIdentifier.identifier;
        } else if (typeof rawIdentifier.value === 'string' || typeof rawIdentifier.value === 'number') {
          rawIdentifier = rawIdentifier.value;
        } else {
          const keys = Object.keys(rawIdentifier);
          if (keys.length === 1) rawIdentifier = rawIdentifier[keys[0]];
        }
      }

      if (rawIdentifier === undefined || rawIdentifier === null) {
        return res.status(400).json({ success: false, error: 'Missing identifier', code: 'MISSING_IDENTIFIER' });
      }

      // Final normalized string
      const normalizedIdentifier = String(rawIdentifier).trim();
      
      // Simple and reliable identification logic
      // If starts with "USER" -> User ID, otherwise treat as Aadhaar
      const isUserId = normalizedIdentifier.startsWith('USER');
      const isAadhaar = !isUserId;

      // Validate format based on type
      if (isUserId) {
        if (!/^USER_\d{6}$/.test(normalizedIdentifier)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid User ID format. Must be: USER_123456 (6 digits after USER_)',
            code: 'INVALID_USER_ID_FORMAT'
          });
        }
      } else {
        // For testing: Use simplified Aadhaar validation
        // TODO: In production, use full CryptoManager.validateAadhaar(normalizedIdentifier)

        // Debug: log the raw and normalized identifier to catch hidden chars
        try {
          console.log('🔎 initiateLogin - identifier raw:', JSON.stringify(identifier), 'normalized:', JSON.stringify(normalizedIdentifier));
        } catch (e) {
          console.log('🔎 initiateLogin - identifier logging failed', e);
        }

        // Basic validation: 12 digits, not starting with 0 or 1
        const digits12 = /^\d{12}$/.test(normalizedIdentifier);
        const startsWith01 = /^[01]/.test(normalizedIdentifier);

        console.log('🔎 Aadhaar checks -> digits12:', digits12, 'startsWith0or1:', startsWith01);

        if (!digits12) {
          return res.status(400).json({
            success: false,
            error: 'Invalid Aadhaar format. Must be exactly 12 digits',
            code: 'INVALID_AADHAAR_FORMAT'
          });
        }

        if (startsWith01) {
          return res.status(400).json({
            success: false,
            error: 'Invalid Aadhaar number. Cannot start with 0 or 1',
            code: 'INVALID_AADHAAR_FORMAT'
          });
        }

        console.log('🔍 LOGIN: Aadhaar validation passed for:', CryptoManager.maskSensitiveData(normalizedIdentifier, 3));
      }

      let user;
      let mobile;

      if (isAadhaar) {
        // Find user by Aadhaar hash
        const aadhaarHash = CryptoManager.hashAadhaar(normalizedIdentifier);
        user = await User.findByAadhaarHash(aadhaarHash);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'No account found with this Aadhaar number',
            code: 'USER_NOT_FOUND'
          });
        }
        mobile = user.mobileOriginal;
      } else {
        // Find user by User ID
        user = await User.findByLoginUserId(normalizedIdentifier);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'No account found with this User ID',
            code: 'USER_NOT_FOUND'
          });
        }
        mobile = user.mobileOriginal;
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Account is deactivated. Please contact support.',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Generate OTP for login
      const otpResult = OTPManager.generateOTP('login', normalizedIdentifier);

      return res.status(200).json({
        success: true,
        message: `Login OTP sent to registered mobile number`,
        sessionId: otpResult.sessionId,
        expiresIn: otpResult.expiresIn,
        loginMethod: 'otp',
        identifierType: isAadhaar ? 'aadhaar' : 'userId',
        identifier: isAadhaar ? CryptoManager.maskSensitiveData(normalizedIdentifier, 3) : normalizedIdentifier,
        mobile: user.mobile, // Already masked
        // Include OTP for testing (remove in production)
        testing: {
          otp: otpResult.otpForTesting,
          note: 'OTP included for testing only'
        }
      });

    } catch (error) {
      console.error('Error initiating login:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Verify Login OTP
   * POST /auth/verify-login-otp
   */
  static async verifyLoginOTP(req, res) {

    try {
      // Normalize identifier robustly to match how OTP was generated in initiateLogin
      let rawIdentifier = (req.body && req.body.identifier !== undefined) ? req.body.identifier : req.body;
      // Extract otp and sessionId from body
      const { otp, sessionId } = req.body;

      if (rawIdentifier && typeof rawIdentifier === 'object') {
        if (typeof rawIdentifier.identifier === 'string' || typeof rawIdentifier.identifier === 'number') {
          rawIdentifier = rawIdentifier.identifier;
        } else if (typeof rawIdentifier.value === 'string' || typeof rawIdentifier.value === 'number') {
          rawIdentifier = rawIdentifier.value;
        } else {
          const keys = Object.keys(rawIdentifier);
          if (keys.length === 1) rawIdentifier = rawIdentifier[keys[0]];
        }
      }

      if (rawIdentifier === undefined || rawIdentifier === null) {
        return res.status(400).json({ success: false, error: 'Missing identifier', code: 'MISSING_IDENTIFIER' });
      }

      const normalizedIdentifier = String(rawIdentifier).trim();

      // Debug: log the identifier being used for OTP verification
      console.log('🔎 verifyLoginOTP - normalized identifier:', JSON.stringify(normalizedIdentifier));
      console.log('🔎 verifyLoginOTP - sessionId:', sessionId);
      console.log('🔎 verifyLoginOTP - otp:', otp);

      // Verify OTP using normalized identifier so storage key matches
      const otpVerification = OTPManager.verifyOTP('login', normalizedIdentifier, otp, sessionId);
      
      console.log('🔎 OTP verification result:', otpVerification);
      
      if (!otpVerification.success) {
        return res.status(400).json({
          success: false,
          error: otpVerification.error,
          code: otpVerification.code,
          remainingAttempts: otpVerification.remainingAttempts
        });
      }

      // Find user using the same normalized identifier
      let user;
      const isUserId = normalizedIdentifier.startsWith('USER');
      const isAadhaar = !isUserId;

      if (isUserId) {
        // Validate User ID format
        if (!/^USER_\d{6}$/.test(normalizedIdentifier)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid User ID format',
            code: 'INVALID_USER_ID_FORMAT'
          });
        }
        user = await User.findByLoginUserId(normalizedIdentifier);
      } else {
        // For testing: simplified Aadhaar validation
        if (!/^\d{12}$/.test(normalizedIdentifier)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid Aadhaar format. Must be exactly 12 digits',
            code: 'INVALID_AADHAAR_FORMAT'
          });
        }
        if (/^[01]/.test(normalizedIdentifier)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid Aadhaar number. Cannot start with 0 or 1',
            code: 'INVALID_AADHAAR_FORMAT'
          });
        }

        const aadhaarHash = CryptoManager.hashAadhaar(normalizedIdentifier);
        user = await User.findByAadhaarHash(aadhaarHash);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Create session
      req.session.user = {
        userId: user.userId,
        loginUserId: user.loginUserId,
        name: user.name,
        mobile: user.mobile,
        isVerified: user.isVerified,
        isActive: user.isActive,
        loginMethod: 'otp',
        loginAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Update user login stats
      await user.recordLogin();

      // Clean up OTP
      OTPManager.cleanupOTP('login', normalizedIdentifier);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: user.getProfile(),
        session: {
          loginMethod: 'otp',
          loginAt: req.session.user.loginAt,
          expiresAt: req.session.user.expiresAt
        }
      });

    } catch (error) {
      console.error('Error verifying login OTP:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Password Login
   * POST /auth/login-password
   */
  static async loginWithPassword(req, res) {
    try {
      const { loginUserId, password } = req.body;

      // Validate User ID format
      if (!/^USER_\d{6}$/.test(loginUserId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid User ID format. Should be USER_XXXXXX',
          code: 'INVALID_USER_ID'
        });
      }

      // Find user
      const user = await User.findByLoginUserId(loginUserId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Account is deactivated. Please contact support.',
          code: 'ACCOUNT_DEACTIVATED'
        });
      }

      // Verify password
      const isPasswordValid = await user.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Create session
      req.session.user = {
        userId: user.userId,
        loginUserId: user.loginUserId,
        name: user.name,
        mobile: user.mobile,
        isVerified: user.isVerified,
        isActive: user.isActive,
        loginMethod: 'password',
        loginAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Update user login stats
      await user.recordLogin();

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: user.getProfile(),
        session: {
          loginMethod: 'password',
          loginAt: req.session.user.loginAt,
          expiresAt: req.session.user.expiresAt
        }
      });

    } catch (error) {
      console.error('Error with password login:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Logout
   * POST /auth/logout
   */
  static async logout(req, res) {
    try {
      const sessionData = req.session.user || req.session.authority;
      
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            success: false,
            error: 'Failed to logout',
            code: 'LOGOUT_ERROR'
          });
        }

        res.clearCookie('pcr_poa_session');
        
        console.log('👋 USER LOGGED OUT:', {
          type: sessionData ? (sessionData.loginUserId ? 'user' : 'authority') : 'unknown',
          identifier: sessionData ? (sessionData.loginUserId || sessionData.designation) : 'unknown',
          logoutAt: new Date()
        });

        return res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      });

    } catch (error) {
      console.error('Error during logout:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Authority Login
   * POST /auth/authority/login
   */
  static async authorityLogin(req, res) {
    try {
      const { designation, password } = req.body;

      // Validate inputs
      if (!designation || !password) {
        return res.status(400).json({
          success: false,
          error: 'Designation and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Find authority by designation
      const authority = await Authority.findByDesignation(designation);
      if (!authority) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check if authority is active
      if (!authority.isActive) {
        return res.status(403).json({
          success: false,
          error: 'Authority account is deactivated. Please contact administrator.',
          code: 'AUTHORITY_DEACTIVATED'
        });
      }

      // Verify password
      const isPasswordValid = await authority.verifyPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Create authority session
      req.session.authority = {
        authorityId: authority.authorityId,
        designation: authority.designation,
        department: authority.department,
        accessLevel: authority.accessLevel,
        permissions: authority.permissions,
        isActive: authority.isActive,
        loginAt: new Date(),
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours for authority
      };

      // Update authority login stats
      await authority.recordLogin();

      console.log('🏛️ AUTHORITY LOGIN:', {
        designation: authority.designation,
        department: authority.department,
        accessLevel: authority.accessLevel,
        loginAt: req.session.authority.loginAt
      });

      return res.status(200).json({
        success: true,
        message: 'Authority login successful',
        authority: {
          authorityId: authority.authorityId,
          designation: authority.designation,
          department: authority.department,
          accessLevel: authority.accessLevel,
          permissions: authority.permissions,
          lastLogin: authority.lastLogin
        },
        session: {
          loginAt: req.session.authority.loginAt,
          expiresAt: req.session.authority.expiresAt,
          sessionType: 'authority'
        }
      });

    } catch (error) {
      console.error('Error during authority login:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Get Current Session Info
   * GET /auth/session
   */
  static async getSessionInfo(req, res) {
    try {
      if (req.session.user) {
        // User session
        return res.status(200).json({
          success: true,
          sessionType: 'user',
          user: {
            userId: req.session.user.userId,
            loginUserId: req.session.user.loginUserId,
            name: req.session.user.name,
            mobile: req.session.user.mobile,
            isVerified: req.session.user.isVerified,
            loginMethod: req.session.user.loginMethod,
            loginAt: req.session.user.loginAt,
            expiresAt: req.session.user.expiresAt
          }
        });
      } else if (req.session.authority) {
        // Authority session
        return res.status(200).json({
          success: true,
          sessionType: 'authority',
          authority: {
            authorityId: req.session.authority.authorityId,
            designation: req.session.authority.designation,
            department: req.session.authority.department,
            accessLevel: req.session.authority.accessLevel,
            permissions: req.session.authority.permissions,
            loginAt: req.session.authority.loginAt,
            expiresAt: req.session.authority.expiresAt
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'No active session',
          code: 'NO_SESSION'
        });
      }

    } catch (error) {
      console.error('Error getting session info:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Step 4: Verify Aadhaar OTP and Create User (Mocked)
   * POST /auth/aadhaar/verify
   */
  static async verifyAadhaarOTP(req, res) {
    try {
      const { aadhaar, otp, sessionId } = req.body;
      const { mobile } = req.tempToken;

      // Validate Aadhaar format
      const aadhaarValidation = CryptoManager.validateAadhaar(aadhaar);
      if (!aadhaarValidation.valid) {
        return res.status(400).json({
          success: false,
          error: aadhaarValidation.error,
          code: 'INVALID_AADHAAR_FORMAT'
        });
      }

      const cleanAadhaar = aadhaarValidation.cleaned;

      // Verify Aadhaar OTP
      const otpVerification = OTPManager.verifyOTP('aadhaar', cleanAadhaar, otp, sessionId);
      
      if (!otpVerification.success) {
        return res.status(400).json({
          success: false,
          error: otpVerification.error,
          code: otpVerification.code,
          remainingAttempts: otpVerification.remainingAttempts
        });
      }

      // Mock: Fetch user data from Aadhaar (this would be UIDAI API call)
      const mockAadhaarData = AuthController.generateMockAadhaarData(cleanAadhaar, mobile);

      // Create Aadhaar hash for storage
      const aadhaarHash = CryptoManager.hashAadhaar(cleanAadhaar);

      // Create user account in database
      const newUser = await User.createVerifiedUser(mockAadhaarData, mobile, aadhaarHash);

      // Generate permanent JWT token for dashboard access
      const permanentToken = JWTManager.generatePermanentToken(newUser);

      // Clean up Aadhaar OTP
      OTPManager.cleanupOTP('aadhaar', cleanAadhaar);

      return res.status(201).json({
        success: true,
        message: 'User account created successfully',
        user: newUser.getProfile(),
        credentials: {
          loginUserId: newUser.loginUserId,
          message: 'Login credentials have been generated. Check console for password.'
        },
        accountStatus: {
          isVerified: newUser.isVerified,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt
        },
        nextStep: 'login_with_credentials'
      });

    } catch (error) {
      console.error('Error verifying Aadhaar OTP:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Resend OTP endpoint
   * POST /auth/resend-otp
   */
  static async resendOTP(req, res) {
    try {
      // Normalize identifier robustly to handle nested or wrapped payloads
      let rawIdentifier = (req.body && req.body.identifier !== undefined) ? req.body.identifier : req.body;
      const { type } = req.body;

      if (rawIdentifier && typeof rawIdentifier === 'object') {
        if (typeof rawIdentifier.identifier === 'string' || typeof rawIdentifier.identifier === 'number') {
          rawIdentifier = rawIdentifier.identifier;
        } else if (typeof rawIdentifier.value === 'string' || typeof rawIdentifier.value === 'number') {
          rawIdentifier = rawIdentifier.value;
        } else {
          const keys = Object.keys(rawIdentifier);
          if (keys.length === 1) rawIdentifier = rawIdentifier[keys[0]];
        }
      }

      if (rawIdentifier === undefined || rawIdentifier === null) {
        return res.status(400).json({ success: false, error: 'Missing identifier', code: 'MISSING_IDENTIFIER' });
      }

      const normalizedIdentifier = String(rawIdentifier).trim();

      // Debug incoming body to help diagnose client payloads
      try {
        console.log('🔎 resendOTP - incoming body:', JSON.stringify(req.body));
        console.log('🔎 resendOTP - normalized identifier:', JSON.stringify(normalizedIdentifier));
      } catch (e) {
        console.log('🔎 resendOTP - body logging failed', e);
      }

      // Validate type - support 'mobile', 'aadhaar', and 'login' (login used for OTP login flow)
      if (!['mobile', 'aadhaar', 'login'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid OTP type. Must be "mobile", "aadhaar", or "login"',
          code: 'INVALID_OTP_TYPE'
        });
      }

      // Additional validation for Aadhaar resend (requires temp token)
      if (type === 'aadhaar') {
        const authHeader = req.headers.authorization;
        const token = JWTManager.extractBearerToken(authHeader);
        
        if (!token) {
          return res.status(401).json({
            success: false,
            error: 'Temporary token required for Aadhaar OTP resend',
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
      }

      // Validate identifier format
      if (type === 'mobile' && !OTPManager.isValidMobile(normalizedIdentifier)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid mobile number format',
          code: 'INVALID_MOBILE_FORMAT'
        });
      }

      if (type === 'aadhaar' && !OTPManager.isValidAadhaar(normalizedIdentifier)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Aadhaar number format',
          code: 'INVALID_AADHAAR_FORMAT'
        });
      }

  // Resend OTP
  // For 'login' type we bypass mobile/aadhaar format validators because the
  // login OTP may be generated against either an Aadhaar, UserID or mobile.
  const otpResult = OTPManager.resendOTP(type, normalizedIdentifier);

      return res.status(200).json({
        success: true,
        message: `New ${type} OTP sent successfully`,
        sessionId: otpResult.sessionId,
        expiresIn: otpResult.expiresIn,
        // Include OTP for testing (remove in production)
        testing: {
          otp: otpResult.otpForTesting,
          note: 'OTP included for testing only'
        }
      });

    } catch (error) {
      console.error('Error resending OTP:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Generate mock Aadhaar data for testing
   * In production, this would be actual UIDAI API response
   */
  static generateMockAadhaarData(aadhaar, mobile) {
    const names = ['Rahul Kumar', 'Priya Sharma', 'Amit Singh', 'Sneha Patel', 'Rajesh Gupta'];
    const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Delhi'];
    const cities = ['Mumbai', 'Bangalore', 'Chennai', 'Ahmedabad', 'New Delhi'];
    
    // Generate consistent data based on Aadhaar number
    const hash = parseInt(aadhaar.slice(-4), 10);
    
    return {
      name: names[hash % names.length],
      dateOfBirth: new Date(1990 + (hash % 25), (hash % 12), 1 + (hash % 28)),
      gender: hash % 2 === 0 ? 'Male' : 'Female',
      mobile: mobile,
      address: {
        line1: `House No. ${100 + (hash % 900)}`,
        line2: `Street ${1 + (hash % 20)}`,
        city: cities[hash % cities.length],
        state: states[hash % states.length],
        pincode: `${400000 + (hash % 100000)}`.substring(0, 6)
      }
    };
  }
}

module.exports = AuthController;