# AI Agent Knowledge Guide - MERN Multi-Step Signup & Authentication System

## 📋 Project Overview

This is a **backend-only MERN stack prototype** for a **multi-step signup system** with **mobile OTP verification**, **Aadhaar verification**, and **complete login/authority access system** using **session-based authentication**.

### 🎯 Key Features
- ✅ **Multi-step user signup** (Mobile OTP → Aadhaar verification)
- ✅ **Dual login methods** (OTP-based & password-based)
- ✅ **Authority access system** with hierarchy and application forwarding
- ✅ **Session-based authentication** (replaced JWT with express-session)
- ✅ **Real application processing** (no mocked data)
- ✅ **Complete MVC architecture** (models, controllers, routes separation)

---

## 🏗️ Architecture Overview

### **Technology Stack:**
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** express-session with connect-mongo store
- **Security:** bcryptjs, secure cookies, session management
- **OTP System:** otp-generator with console logging for testing
- **Verification:** Mocked Aadhaar system for demonstration

### **MVC Structure:**
```
backend/
├── models/           # Database schemas
│   ├── User.js      # User accounts with login credentials
│   ├── Authority.js # Authority accounts for application processing
│   └── Application.js # Application processing with forwarding chain
├── controllers/      # Business logic
│   ├── authController.js      # Signup, login, session management
│   ├── userController.js      # User profile and operations
│   └── authorityController.js # Application processing and forwarding
├── routes/          # API endpoints
│   ├── auth.js      # Authentication routes
│   ├── users.js     # User routes
│   └── authority.js # Authority routes
├── middleware/      # Security and validation
│   ├── authMiddleware.js # Request validation and legacy JWT
│   └── sessionAuth.js    # Session-based authentication
└── utils/           # Utilities
    ├── otpManager.js     # OTP generation and verification
    ├── cryptoManager.js  # Data encryption and hashing
    └── jwtManager.js     # Legacy JWT (used only for temp tokens)
```

---

## 🔐 Authentication System

### **User Authentication Flow:**
1. **Signup Process (4 steps):**
   - Request mobile OTP → Verify mobile → Initiate Aadhaar → Complete verification
   - **Output:** User account with loginUserId + password

2. **Login Options:**
   - **OTP Method:** Login with Aadhaar/UserID → Verify OTP → Session created
   - **Password Method:** Login with UserID + password → Session created

3. **Session Management:**
   - **Cookie-based sessions** (no Authorization headers needed)
   - **24-hour expiry** for users, **8-hour expiry** for authorities
   - **Automatic session validation** on protected routes

### **Authority Authentication:**
- **Designation-based login** (e.g., District_Collector_Delhi)
- **Hierarchy system:** Admin > Reviewer > Viewer
- **Application forwarding** through authority levels

---

## 🗄️ Database Models

### **User Model** (`models/User.js`)
```javascript
{
  userId: "USER_abc123",           // Unique user identifier
  loginUserId: "USER_123456",      // Login credential
  password: "hashedPassword",      // Generated password
  name: "Generated Name",          // From Aadhaar data
  mobile: "+91-98765-*****",       // Masked mobile
  mobileOriginal: "+919876543210", // Original (encrypted)
  aadhaarHash: "hashedAadhaar",    // Hashed Aadhaar
  isVerified: true,                // Verification status
  isActive: true,                  // Account status
  lastLogin: Date,                 // Login tracking
  loginCount: Number               // Login count
}
```

### **Authority Model** (`models/Authority.js`)
```javascript
{
  authorityId: "AUTH_789123",
  designation: "DISTRICT_COLLECTOR_DELHI", // Login ID
  designationName: "District Collector - Delhi",
  email: "collector.delhi@gov.in",
  department: "Revenue",
  accessLevel: 5,                  // 1-5 hierarchy
  password: "hashedPassword",
  isActive: true
}
```

### **Application Model** (`models/Application.js`)
```javascript
{
  applicationId: "APP_123456",
  userId: "USER_abc123",
  applicantName: "User Name",
  applicationData: {
    purpose: "income_certificate",
    urgency: "normal"
  },
  status: "under_review",          // submitted, under_review, approved, etc.
  currentAuthority: {
    designation: "TEHSILDAR_CP_ZONE",
    assignedAt: Date
  },
  processingChain: [{              // Complete processing history
    designation: "DATA_ENTRY_OPERATOR",
    action: "forwarded",
    comments: "Initial review complete",
    timestamp: Date,
    forwardedTo: "TEHSILDAR_CP_ZONE"
  }],
  documents: [{ type, status, verifiedBy }],
  totalProcessingTime: 48,         // hours
  authorityChanges: 2              // forwarding count
}
```

---

## 🌐 API Endpoints Summary

### **Authentication Routes** (`/auth/*`)
- `POST /auth/request-mobile-otp` - Start signup
- `POST /auth/verify-mobile-otp` - Verify mobile
- `POST /auth/aadhaar/initiate` - Start Aadhaar verification
- `POST /auth/aadhaar/verify` - Complete signup
- `POST /auth/login` - Initiate login (OTP method)
- `POST /auth/verify-login-otp` - Verify login OTP
- `POST /auth/login-password` - Password login
- `POST /auth/authority/login` - Authority login
- `GET /auth/session` - Get session info
- `POST /auth/logout` - Destroy session

### **User Routes** (`/users/*`) - **Session Required**
- `GET /users/profile` - User profile
- `PUT /users/profile` - Update profile (address only)
- `GET /users/dashboard` - User dashboard
- `GET /users/stats` - Account statistics
- `GET /users/validate-session` - Session validation
- `POST /users/deactivate` - Deactivate account

### **Authority Routes** (`/authority/*`) - **Authority Session Required**
- `POST /authority/login` - Alternative authority login
- `GET /authority/dashboard` - Real application statistics
- `GET /authority/applications/pending` - Pending applications
- `GET /authority/applications/:id` - Application details
- `POST /authority/applications/:id/review` - Process applications
- `GET /authority/forwarding-options` - Valid forwarding targets
- `POST /authority/applications/create-test` - Create test application
- `POST /authority/create` - Create new authority (admin only)
- `GET /authority/list` - List authorities (admin only)

---

## 🔄 Application Processing System

### **Authority Hierarchy & Forwarding:**
```
Data_Entry_Operator (Level 1)
    ↓ (can forward to)
Tehsildar_CP_Zone (Level 3) / Assistant_Collector_North (Level 4)
    ↓ (can forward to)
District_Collector_Delhi (Level 5) - Final Authority
```

### **Application Actions:**
- **approve** - Final approval
- **reject** - Reject with comments
- **request_documents** - Request additional documents
- **forward** - Send to higher authority
- **hold** - Put on hold

### **Processing Features:**
- ✅ **Real database operations** (no mocked data)
- ✅ **Complete audit trail** of all actions
- ✅ **Processing time tracking**
- ✅ **Forwarding validation** based on hierarchy
- ✅ **Document management** and verification
- ✅ **Workload analytics** and metrics

---

## 🧪 Testing Setup

### **Environment Setup:**
```powershell
# 1. Start MongoDB
mongod

# 2. Navigate and start server
Set-Location h:\void2\backend
npm start

# 3. Create test authorities
node setup-authorities.js
```

### **Test Authority Credentials:**
```
Designation: DISTRICT_COLLECTOR_DELHI
Password: Admin@123
Access Level: 5 (admin)

Designation: ASSISTANT_COLLECTOR_NORTH  
Password: Reviewer@123
Access Level: 4 (reviewer)

Designation: TEHSILDAR_CP_ZONE
Password: Tehsil@123
Access Level: 3 (reviewer)

Designation: DATA_ENTRY_OPERATOR
Password: Operator@123
Access Level: 1 (viewer)
```

### **Testing Tools:**
- **Postman** (recommended)
- **Thunder Client** (VS Code)
- **curl** (command line)
- **REST Client** (VS Code)

---

## 📝 Request/Response Examples

### **Complete User Signup:**
```http
# Step 1
POST /auth/request-mobile-otp
{ "mobile": "+919876543210" }

# Step 2  
POST /auth/verify-mobile-otp
{ "mobile": "+919876543210", "otp": "123456", "sessionId": "uuid" }

# Step 3
POST /auth/aadhaar/initiate
Authorization: Bearer temp-token
{ "aadhaar": "123456789012" }

# Step 4
POST /auth/aadhaar/verify  
Authorization: Bearer temp-token
{ "aadhaar": "123456789012", "otp": "654321", "sessionId": "uuid" }
```

### **Authority Application Processing:**
```http
# Create test application (admin only)
POST /authority/applications/create-test

# Review application
POST /authority/applications/APP_123456/review
{
  "action": "forward",
  "comments": "Initial review complete, forwarding for approval",
  "forwardTo": "DISTRICT_COLLECTOR_DELHI"
}
```

---

## 🔧 Configuration

### **Environment Variables (.env):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mern_signup_auth

# Session  
SESSION_SECRET=your-super-secret-session-key
SESSION_MAX_AGE=86400000

# App
NODE_ENV=development
PORT=5000

# JWT (temp tokens only)
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=24h
```

### **Session Configuration:**
- **Store:** MongoDB with connect-mongo
- **Cookie:** httpOnly, secure (production), sameSite: strict
- **Name:** pcr_poa_session
- **Duration:** 24h users, 8h authorities
- **Cleanup:** Automatic expired session removal

---

## 🔍 Debugging & Monitoring

### **Console Logging:**
- 📱 **OTP Operations:** Generation, verification, cleanup
- 👤 **User Events:** Signup, login, profile updates
- 🏛️ **Authority Actions:** Login, application processing
- 📋 **Application Flow:** Creation, forwarding, completion
- 🚪 **Session Events:** Creation, validation, destruction
- ❌ **Error Tracking:** Authentication failures, validation errors

### **Common Issues:**
1. **"Session not found"** → User needs to login again
2. **"Access denied"** → Wrong authority level for operation  
3. **"Invalid credentials"** → Check designation/password spelling
4. **"User not found"** → Complete signup process first
5. **"Cannot forward"** → Check authority hierarchy rules

---

## 🚀 Production Considerations

### **Security Checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS for secure cookies
- [ ] Set up MongoDB authentication
- [ ] Remove test OTP logging
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Configure CORS for specific domains

### **Performance Optimizations:**
- [ ] Enable MongoDB indexing
- [ ] Set up session cleanup jobs
- [ ] Implement connection pooling
- [ ] Add response compression
- [ ] Set up load balancing
- [ ] Configure caching strategies

---

## 📚 Key Files to Understand

### **Critical Files:**
1. **`index.js`** - Main server configuration
2. **`models/User.js`** - User schema and methods
3. **`models/Application.js`** - Application processing logic
4. **`controllers/authController.js`** - Authentication business logic
5. **`middleware/sessionAuth.js`** - Session validation
6. **`setup-authorities.js`** - Test data creation

### **Configuration Files:**
- **`.env`** - Environment variables
- **`package.json`** - Dependencies and scripts
- **`API_TESTING_GUIDE.md`** - Complete testing reference
- **`TESTING_GUIDE.md`** - User testing workflows

---

## 🎯 Project Goals Achieved

✅ **Multi-step signup system** with OTP and Aadhaar verification  
✅ **Complete authentication system** with multiple login methods  
✅ **Session-based security** replacing JWT tokens  
✅ **Authority hierarchy system** with real application processing  
✅ **Application forwarding chain** between authority levels  
✅ **Proper MVC architecture** with clean separation of concerns  
✅ **Real database operations** with no mocked data  
✅ **Comprehensive testing setup** with detailed guides  
✅ **Production-ready structure** with security considerations  

This system demonstrates **government-grade authentication** and **application processing workflows** suitable for official document verification and approval systems.

---

**Usage:** This guide provides AI agents with complete context about the project's architecture, features, testing procedures, and codebase structure for effective assistance and development.