/**
 * User Controller
 * Handles all user-related business logic
 * Separated from routes for better code organization
 * Updated for session-based authentication
 */

const User = require('../models/User');

class UserController {
  /**
   * Get User Profile
   * GET /users/profile
   */
  static async getProfile(req, res) {
    try {
      const { userId } = req.session.user;

      // Find user by userId
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Update last login
      await user.recordLogin();

      return res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        user: user.getProfile(),
        session: {
          loginUserId: req.session.user.loginUserId,
          loginMethod: req.session.user.loginMethod,
          loginAt: req.session.user.loginAt,
          expiresAt: req.session.user.expiresAt
        }
      });

    } catch (error) {
      console.error('Error retrieving user profile:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Update User Profile (Limited fields)
   * PUT /users/profile
   */
  static async updateProfile(req, res) {
    try {
      const { userId } = req.session.user;
      const allowedUpdates = ['address']; // Only address can be updated
      const updates = {};

      // Filter allowed updates
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No valid fields to update',
          allowedFields: allowedUpdates,
          code: 'NO_VALID_UPDATES'
        });
      }

      // Validate address format if provided
      if (updates.address) {
        const { line1, city, state, pincode } = updates.address;
        
        if (!line1 || !city || !state || !pincode) {
          return res.status(400).json({
            success: false,
            error: 'Address must include line1, city, state, and pincode',
            code: 'INVALID_ADDRESS_FORMAT'
          });
        }

        if (!/^[1-9][0-9]{5}$/.test(pincode)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid pincode format',
            code: 'INVALID_PINCODE'
          });
        }
      }

      // Find and update user
      const user = await User.findOneAndUpdate(
        { userId },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: user.getProfile(),
        updatedFields: Object.keys(updates)
      });

    } catch (error) {
      console.error('Error updating user profile:', error);
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.message,
          code: 'VALIDATION_ERROR'
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Get Dashboard Data
   * GET /users/dashboard
   */
  static async getDashboard(req, res) {
    try {
      const { userId } = req.session.user;

      // Find user
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Update last login
      await user.recordLogin();

      // Dashboard data
      const dashboardData = {
        welcome: {
          name: user.name,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
          memberSince: user.createdAt
        },
        account: {
          status: user.isActive ? 'Active' : 'Inactive',
          verified: user.isVerified,
          userId: user.userId,
          verificationDetails: {
            mobileVerified: user.mobileVerifiedAt,
            aadhaarVerified: user.aadhaarVerifiedAt
          }
        },
        profile: {
          name: user.name,
          age: user.age,
          gender: user.gender,
          mobile: user.mobile, // Already masked
          address: user.address
        },
        security: {
          aadhaarLinked: true, // Always true for verified users
          mobileLinked: true,
          lastSecurityUpdate: user.updatedAt
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        dashboard: dashboardData,
        systemTime: new Date()
      });

    } catch (error) {
      console.error('Error retrieving dashboard data:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Deactivate Account
   * POST /users/deactivate
   */
  static async deactivateAccount(req, res) {
    try {
      const { userId } = req.session.user;
      const { confirmation } = req.body;

      // Require explicit confirmation
      if (confirmation !== 'DEACTIVATE_ACCOUNT') {
        return res.status(400).json({
          success: false,
          error: 'Account deactivation requires confirmation',
          requiredConfirmation: 'DEACTIVATE_ACCOUNT',
          code: 'CONFIRMATION_REQUIRED'
        });
      }

      // Find and deactivate user
      const user = await User.findOneAndUpdate(
        { userId },
        { 
          $set: { 
            isActive: false,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      console.log('🚫 ACCOUNT DEACTIVATED:', {
        userId: user.userId,
        name: user.name,
        mobile: user.mobile,
        deactivatedAt: new Date()
      });

      return res.status(200).json({
        success: true,
        message: 'Account deactivated successfully',
        accountStatus: {
          isActive: user.isActive,
          deactivatedAt: user.updatedAt,
          userId: user.userId
        },
        note: 'Your account has been deactivated. Contact support to reactivate.'
      });

    } catch (error) {
      console.error('Error deactivating account:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Get Account Statistics
   * GET /users/stats
   */
  static async getStats(req, res) {
    try {
      const { userId } = req.session.user;

      // Find user
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      // Calculate statistics
      const now = new Date();
      const accountAge = Math.floor((now - user.createdAt) / (1000 * 60 * 60 * 24)); // days
      const timeSinceLastLogin = user.lastLogin ? 
        Math.floor((now - user.lastLogin) / (1000 * 60)) : null; // minutes

      const stats = {
        account: {
          ageInDays: accountAge,
          totalLogins: user.loginCount,
          lastLoginMinutesAgo: timeSinceLastLogin,
          verificationComplete: user.isVerified,
          accountActive: user.isActive
        },
        verification: {
          mobileVerified: true,
          aadhaarVerified: true,
          mobileVerificationDate: user.mobileVerifiedAt,
          aadhaarVerificationDate: user.aadhaarVerifiedAt
        },
        security: {
          dataEncrypted: true,
          aadhaarHashed: true,
          mobilePartiallyMasked: true,
          lastSecurityUpdate: user.updatedAt
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Account statistics retrieved successfully',
        stats,
        generatedAt: now
      });

    } catch (error) {
      console.error('Error retrieving account stats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Validate Session (Health Check)
   * GET /users/validate-session
   */
  static validateSession(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Session is valid',
      session: {
        userId: req.session.user.userId,
        loginUserId: req.session.user.loginUserId,
        mobile: req.session.user.mobile,
        name: req.session.user.name,
        loginMethod: req.session.user.loginMethod,
        loginAt: req.session.user.loginAt,
        expiresAt: req.session.user.expiresAt,
        isVerified: req.session.user.isVerified,
        isActive: req.session.user.isActive
      },
      validatedAt: new Date()
    });
  }
}

module.exports = UserController;