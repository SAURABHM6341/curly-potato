/**
 * Database Setup Script
 * Creates initial authority accounts for testing
 * Run this once to set up test data
 */

const mongoose = require('mongoose');
const config = require('./config');
const Authority = require('./models/Authority');

async function createTestAuthorities() {
  try {
    // Connect to database
    await mongoose.connect(config.database.mongoUri);
    console.log('🔌 Connected to MongoDB for setup');

    // Check if authorities already exist
    const existingAuthorities = await Authority.find({});
    if (existingAuthorities.length > 0) {
      console.log('🔍 Found existing authorities:', existingAuthorities.length);
      existingAuthorities.forEach(auth => {
        console.log(`   - ${auth.designation} (${auth.department}) - ${auth.accessLevel}`);
      });
      
      console.log('\n✅ Authorities already exist. Setup complete.');
      process.exit(0);
    }

    // Create test authorities
    const testAuthorities = [
      {
        designation: 'District_Collector_Delhi',
        designationName: 'District Collector - Delhi',
        email: 'collector.delhi@gov.in',
        department: 'Revenue',
        office: 'District Collector Office Delhi',
        jurisdiction: 'Delhi',
        accessLevel: 5,
        password: 'Admin@123'
      },
      {
        designation: 'Assistant_Collector_North',
        designationName: 'Assistant Collector - North Delhi',
        email: 'acollector.north@gov.in',
        department: 'Revenue',
        office: 'Assistant Collector Office North',
        jurisdiction: 'North Delhi',
        accessLevel: 4,
        password: 'Reviewer@123'
      },
      {
        designation: 'Tehsildar_CP_Zone',
        designationName: 'Tehsildar - Central Delhi Zone',
        email: 'tehsildar.cp@gov.in',
        department: 'Revenue',
        office: 'Tehsildar Office CP',
        jurisdiction: 'Central Delhi',
        accessLevel: 3,
        password: 'Tehsil@123'
      },
      {
        designation: 'Data_Entry_Operator',
        designationName: 'Data Entry Operator',
        email: 'dataentry@gov.in',
        department: 'IT',
        office: 'Data Processing Center',
        jurisdiction: 'Delhi',
        accessLevel: 1,
        password: 'Operator@123'
      }
    ];

    console.log('🏗️ Creating test authorities...\n');

    for (const authorityData of testAuthorities) {
      try {
        const authority = await Authority.createAuthority(authorityData);
        console.log(`✅ Created: ${authority.designation}`);
        console.log(`   Name: ${authority.designationName}`);
        console.log(`   Department: ${authority.department}`);
        console.log(`   Access Level: ${authority.accessLevel}`);
        console.log(`   Authority ID: ${authority.authorityId}`);
        console.log(`   Email: ${authority.email}`);
        console.log(`   Password: ${authorityData.password}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Failed to create ${authorityData.designation}:`, error.message);
      }
    }

    console.log('🎉 Test authorities created successfully!');
    console.log('📋 Login Credentials:');
    console.log('='.repeat(50));
    testAuthorities.forEach(auth => {
      console.log(`Designation: ${auth.designation}`);
      console.log(`Name: ${auth.designationName}`);
      console.log(`Email: ${auth.email}`);
      console.log(`Password: ${auth.password}`);
      console.log(`Access Level: ${auth.accessLevel}`);
      console.log(`Department: ${auth.department}`);
      console.log('-'.repeat(30));
    });

    console.log('\n🧪 Test these credentials at:');
    console.log('POST /auth/authority/login');
    console.log('POST /authority/login');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  createTestAuthorities();
}

module.exports = createTestAuthorities;