/**
 * Database connection utility for MongoDB
 * Handles connection, disconnection, and error management
 */

const mongoose = require('mongoose');
const config = require('./index');

class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB database
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      // MongoDB connection options
      const options = {
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds
        bufferCommands: false, // Disable mongoose buffering
      };

      console.log('🔄 Connecting to MongoDB...');
      
      this.connection = await mongoose.connect(config.database.mongoUri, options);
      
      console.log('✅ MongoDB connected successfully');
      console.log(`📍 Database: ${this.connection.connection.name}`);
      console.log(`🌐 Host: ${this.connection.connection.host}`);
      
      // Handle connection events
      this.setupEventListeners();
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Setup mongoose event listeners for connection monitoring
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ Mongoose connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📴 Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB connection:', error.message);
    }
  }

  /**
   * Get connection status
   * @returns {string} Connection status
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[mongoose.connection.readyState] || 'unknown';
  }

  /**
   * Check if database is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Export singleton instance
const database = new Database();
module.exports = database;