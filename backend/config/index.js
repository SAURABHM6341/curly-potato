/**
 * Configuration module to manage environment variables and app settings
 * Loads and validates all required environment variables
 */

require('dotenv').config();

const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mern_signup_db',
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    tempSecret: process.env.JWT_TEMP_SECRET || 'fallback-temp-secret',
    tempExpiresIn: process.env.JWT_TEMP_EXPIRES_IN || '15m',
    permanentExpiresIn: process.env.JWT_PERMANENT_EXPIRES_IN || '7d',
  },
  
  // OTP configuration
  otp: {
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 5,
    length: 6, // 6-digit OTP
  },
  
  // Security configuration
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
  },
  
  // App configuration
  app: {
    name: process.env.APP_NAME || 'MERN Multi-Step Signup',
    apiVersion: process.env.API_VERSION || 'v1',
  }
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_TEMP_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('   Using fallback values for development. Update .env file for production.');
}

module.exports = config;