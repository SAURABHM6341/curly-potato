# MERN Multi-Step Signup & Login System - Testing Guide

## Complete Authentication System with Session Management

This backend now includes a comprehensive authentication system with both user signup/login and authority access management using session-based authentication.

---

## 🚀 Quick Start

### 1. Start the Server
```bash
cd backend
npm start
```

### 2. Create Test Authority Accounts
```bash
node setup-authorities.js
```

### 3. Test the API
Use tools like Postman, Thunder Client, or curl to test the endpoints.

---

## 🔐 Authentication Flows

### A. USER SIGNUP FLOW

#### Step 1: Request Mobile OTP
```http
POST /auth/request-mobile-otp
Content-Type: application/json

{
  "mobile": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to +91-98765-43210",
  "sessionId": "uuid-string",
  "expiresIn": 300,
  "testing": {
    "otp": "123456",
    "note": "OTP included for testing only"
  }
}
```

#### Step 2: Verify Mobile OTP
```http
POST /auth/verify-mobile-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "sessionId": "uuid-from-step1"
}
```

#### Step 3: Initiate Aadhaar Verification
```http
POST /auth/aadhaar/initiate
Content-Type: application/json
Authorization: Bearer temp-jwt-token-from-step2

{
  "aadhaar": "123456789012"
}
```

#### Step 4: Complete Aadhaar Verification & Create Account
```http
POST /auth/aadhaar/verify
Content-Type: application/json
Authorization: Bearer temp-jwt-token-from-step3

{
  "aadhaar": "123456789012",
  "otp": "654321",
  "sessionId": "aadhaar-session-id"
}
```

**Response:** Account created with login credentials
```json
{
  "success": true,
  "message": "User account created successfully",
  "user": { ... },
  "credentials": {
    "loginUserId": "USER_123456",
    "password": "TempPass@789",
    "note": "Use these credentials for future logins"
  }
}
```

---

### B. USER LOGIN FLOWS

#### Option 1: Login with OTP (Aadhaar or User ID)

**Step 1: Initiate Login**
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "123456789012"
}
```
OR
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "USER_123456"
}
```

**Step 2: Verify Login OTP**
```http
POST /auth/verify-login-otp
Content-Type: application/json

{
  "identifier": "123456789012",
  "otp": "123456",
  "sessionId": "login-session-id"
}
```

#### Option 2: Login with Password (User ID only)

```http
POST /auth/login-password
Content-Type: application/json

{
  "loginUserId": "USER_123456",
  "password": "TempPass@789"
}
```

---

### C. AUTHORITY LOGIN

```http
POST /auth/authority/login
Content-Type: application/json

{
  "designation": "District_Collector_Delhi",
  "password": "Admin@123"
}
```

**Alternative endpoint:**
```http
POST /authority/login
Content-Type: application/json

{
  "designation": "Assistant_Collector_North",
  "password": "Reviewer@123"
}
```

---

## 🔒 Session Management

### Get Current Session Info
```http
GET /auth/session
```

### Logout (Destroys Session)
```http
POST /auth/logout
```

---

## 👤 User Protected Routes

All user routes require active session (automatic cookie-based authentication):

### Get User Profile
```http
GET /users/profile
```

### Update User Profile
```http
PUT /users/profile
Content-Type: application/json

{
  "address": {
    "line1": "123 Main Street",
    "city": "Delhi",
    "state": "Delhi",
    "pincode": "110001"
  }
}
```

### Get Dashboard
```http
GET /users/dashboard
```

### Get Account Stats
```http
GET /users/stats
```

### Validate Session
```http
GET /users/validate-session
```

### Deactivate Account
```http
POST /users/deactivate
Content-Type: application/json

{
  "confirmation": "DEACTIVATE_ACCOUNT"
}
```

---

## 🏛️ Authority Protected Routes

All authority routes require authority session and work with **real application data**:

### Authority Dashboard (Real Data)
```http
GET /authority/dashboard
```

**Response includes:**
- Real application statistics
- Actual pending applications count
- Processing metrics
- Workload analysis

### Get Pending Applications (Real Data)
```http
GET /authority/applications/pending?status=under_review&urgency=high&page=1&limit=10
```

**Query Parameters:**
- `status`: Filter by application status
- `urgency`: Filter by urgency level
- `page`: Pagination page number
- `limit`: Items per page

### Get Application Details & History
```http
GET /authority/applications/APP_123456
```

**Response includes:**
- Complete application data
- Full processing history
- Document verification status
- Authority forwarding chain

### Review/Forward Application
```http
POST /authority/applications/APP_123456/review
Content-Type: application/json

{
  "action": "forward",
  "comments": "Forwarding to higher authority for final approval",
  "forwardTo": "District_Collector_Delhi"
}
```

**Valid Actions:**
- `approve` - Final approval
- `reject` - Reject application
- `request_documents` - Request additional documents
- `forward` - Forward to higher authority
- `hold` - Put application on hold

**For Forward Action:**
- `forwardTo` - Target authority designation (required)
- Follows hierarchy: Data Entry → Tehsildar → Assistant Collector → District Collector

**For Request Documents:**
```http
POST /authority/applications/APP_123456/review
Content-Type: application/json

{
  "action": "request_documents",
  "comments": "Need additional income proof",
  "requiredDocuments": ["income_proof", "address_proof"]
}
```

### Get Forwarding Options
```http
GET /authority/forwarding-options
```

**Response shows valid forwarding targets based on authority hierarchy**

### Create Test Application (Admin Only)
```http
POST /authority/applications/create-test
```

**Creates a test application with real user data for demonstration**

### Create New Authority (Admin Only)
```http
POST /authority/create
Content-Type: application/json

{
  "designation": "New_Officer_Name",
  "department": "Revenue",
  "accessLevel": "reviewer",
  "password": "NewOff@123",
  "permissions": ["review_applications", "approve_applications"]
}
```

### List All Authorities (Admin Only)
```http
GET /authority/list
```

---

## 🧪 Test Authority Accounts

After running `node setup-authorities.js`, use these accounts:

| Designation | Password | Access Level | Permissions |
|-------------|----------|--------------|-------------|
| District_Collector_Delhi | Admin@123 | admin | All permissions |
| Assistant_Collector_North | Reviewer@123 | reviewer | Review & approve |
| Tehsildar_CP_Zone | Tehsil@123 | reviewer | Review & request docs |
| Data_Entry_Operator | Operator@123 | viewer | View only |

---

## 🔧 Session Configuration

- **Session Duration:** 24 hours for users, 8 hours for authorities
- **Cookie Name:** `pcr_poa_session`
- **Security:** httpOnly, secure (HTTPS in production), sameSite: strict
- **Storage:** MongoDB with automatic cleanup

---

## 🧪 Testing Workflow

### Complete User Journey:
1. **Signup:** Mobile OTP → Aadhaar verification → Account creation
2. **Login:** Get credentials → Login with password or OTP
3. **Use App:** Access protected routes with session
4. **Logout:** Destroy session

### Authority Operations with Real Application Flow:
1. **Login:** Use test credentials
2. **Create Test Data:** Create test applications (admin only)
3. **Dashboard:** View real application statistics
4. **Review Applications:** View actual pending applications
5. **Process Applications:** 
   - Approve applications
   - Reject with comments
   - Request additional documents
   - **Forward to higher authority** (key feature)
6. **Track Processing:** View complete application history
7. **Admin Tasks:** Create new authorities, view all authorities
8. **Logout:** Destroy session

### Application Forwarding Hierarchy:
```
Data_Entry_Operator
    ↓ (can forward to)
Tehsildar_CP_Zone / Assistant_Collector_North
    ↓ (can forward to)
District_Collector_Delhi (final authority)
```

### Testing Application Forwarding:
1. **Create Test Application:** (Admin) `POST /authority/applications/create-test`
2. **Login as Data Entry:** Use `Data_Entry_Operator` / `Operator@123`
3. **View Application:** `GET /authority/applications/pending`
4. **Forward Application:** 
   ```json
   {
     "action": "forward",
     "comments": "Initial review complete, forwarding for approval",
     "forwardTo": "Tehsildar_CP_Zone"
   }
   ```
5. **Login as Tehsildar:** Use `Tehsildar_CP_Zone` / `Tehsil@123`
6. **View Forwarded App:** Check dashboard and pending applications
7. **Forward Again:** Forward to `Assistant_Collector_North` or approve
8. **Track History:** `GET /authority/applications/:id` to see full chain

### Session Testing:
1. **Valid Session:** Access protected routes
2. **Expired Session:** Get 401 unauthorized
3. **Cross-User Access:** User cannot access authority routes
4. **Session Info:** Check current session details

---

## 🐛 Common Issues & Solutions

### Issue: "Session not found"
- **Solution:** Login again to create a new session
- **Cause:** Session expired or never created

### Issue: "Access denied" for authority routes
- **Solution:** Login with authority credentials
- **Cause:** Using user session for authority routes

### Issue: "Invalid credentials"
- **Solution:** Check designation and password spelling
- **Cause:** Typo in credentials or authority not created

### Issue: "User not found" during login
- **Solution:** Complete signup process first
- **Cause:** Trying to login without completing signup

---

## 🔍 Monitoring & Logs

The server logs all important events:
- 📱 OTP generation and verification
- 👤 User signup and login
- 🏛️ Authority login and operations
- 📋 Application reviews
- 🚪 Session creation and destruction
- ❌ Authentication failures

---

## 🌐 Environment Configuration

Create `.env` file in backend directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mern_signup_auth

# Session
SESSION_SECRET=your-super-secret-session-key
SESSION_MAX_AGE=86400000

# App
NODE_ENV=development
PORT=5000

# Optional: JWT (for temp tokens during signup)
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=24h
```

---

## 🚀 Production Deployment

### Security Checklist:
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `SESSION_SECRET`
- [ ] Enable HTTPS for secure cookies
- [ ] Set up MongoDB with authentication
- [ ] Remove test OTP logging
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Enable CORS for specific domains only

### Performance:
- [ ] Enable MongoDB indexing
- [ ] Set up session cleanup
- [ ] Implement connection pooling
- [ ] Add response compression
- [ ] Set up load balancing

---

This comprehensive system provides government-grade security with session-based authentication, multi-factor verification, and proper access control for different authority levels.