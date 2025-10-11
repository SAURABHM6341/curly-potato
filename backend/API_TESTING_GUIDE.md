# Complete API Testing Guide - All Endpoints

## 🌐 Base URL
```
http://localhost:5000
```

## 📋 Headers Required
```http
Content-Type: application/json
```

**Note:** Session-based authentication uses cookies automatically after login. No Authorization headers needed for protected routes.

---

## 🔐 AUTHENTICATION & SIGNUP ROUTES

### 1. Health Check
```http
GET /
```
**Headers:** None required  
**Body:** None  
**Response:** API information and available endpoints

---

### 2. Request Mobile OTP (Signup Step 1)
```http
POST /auth/request-mobile-otp
Content-Type: application/json

{
  "mobile": "+919876543210"
}
```
**Validation:** Mobile must be in format `+91XXXXXXXXXX`  
**Response:** Returns sessionId and OTP (for testing)

---

### 3. Verify Mobile OTP (Signup Step 2)
```http
POST /auth/verify-mobile-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "sessionId": "uuid-from-step-1"
}
```
**Response:** Returns temporary JWT token for next steps

---

### 4. Initiate Aadhaar Verification (Signup Step 3)
```http
POST /auth/aadhaar/initiate
Content-Type: application/json
Authorization: Bearer temp-jwt-token-from-step-2

{
  "aadhaar": "123456789012"
}
```
**Headers:** Authorization with temp token  
**Validation:** 12-digit Aadhaar, not starting with 0 or 1  
**Response:** Aadhaar session ID and OTP

---

### 5. Complete Aadhaar Verification & Create Account (Signup Step 4)
```http
POST /auth/aadhaar/verify
Content-Type: application/json
Authorization: Bearer temp-jwt-token-from-step-3

{
  "aadhaar": "123456789012",
  "otp": "654321",
  "sessionId": "aadhaar-session-id-from-step-3"
}
```
**Headers:** Authorization with temp token  
**Response:** Complete user account with login credentials

---

### 6. Resend OTP
```http
POST /auth/resend-otp
Content-Type: application/json

{
  "type": "mobile",
  "identifier": "+919876543210"
}
```
**Valid types:** `mobile`, `aadhaar`, `login`

---

## 🔑 LOGIN ROUTES

### 7. Initiate Login (OTP Method)
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "123456789012"
}
```
**OR with User ID:**
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "USER_123456"
}
```
**Validation:** Aadhaar (12 digits) or User ID (USER_XXXXXX format)  
**Response:** Login session ID and OTP

---

### 8. Verify Login OTP
```http
POST /auth/verify-login-otp
Content-Type: application/json

{
  "identifier": "123456789012",
  "otp": "123456",
  "sessionId": "login-session-id-from-step-7"
}
```
**Response:** Creates user session, returns user profile

---

### 9. Password Login
```http
POST /auth/login-password
Content-Type: application/json

{
  "loginUserId": "USER_123456",
  "password": "TempPass@789"
}
```
**Validation:** User ID format `USER_XXXXXX`  
**Response:** Creates user session, returns user profile

---

### 10. Authority Login
```http
POST /auth/authority/login
Content-Type: application/json

{
  "designation": "District_Collector_Delhi",
  "password": "Admin@123"
}
```
**Test Credentials:**
- `District_Collector_Delhi` / `Admin@123` (admin)
- `Assistant_Collector_North` / `Reviewer@123` (reviewer)
- `Tehsildar_CP_Zone` / `Tehsil@123` (reviewer)
- `Data_Entry_Operator` / `Operator@123` (viewer)

---

### 11. Get Session Info
```http
GET /auth/session
```
**Authentication:** Session required  
**Response:** Current user or authority session details

---

### 12. Logout
```http
POST /auth/logout
```
**Authentication:** Session required  
**Response:** Destroys session and clears cookies

---

## 👤 USER PROTECTED ROUTES

**Note:** All user routes require active user session (login first)

### 13. Get User Profile
```http
GET /users/profile
```
**Authentication:** User session required  
**Response:** Complete user profile and session info

---

### 14. Update User Profile
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
**Authentication:** User session required  
**Validation:** Only address can be updated, pincode must be 6 digits

---

### 15. Get User Dashboard
```http
GET /users/dashboard
```
**Authentication:** User session required  
**Response:** User dashboard with account summary

---

### 16. Get Account Statistics
```http
GET /users/stats
```
**Authentication:** User session required  
**Response:** Account metrics and verification status

---

### 17. Validate Session
```http
GET /users/validate-session
```
**Authentication:** User session required  
**Response:** Session validation and expiry info

---

### 18. Deactivate Account
```http
POST /users/deactivate
Content-Type: application/json

{
  "confirmation": "DEACTIVATE_ACCOUNT"
}
```
**Authentication:** User session required  
**Validation:** Exact confirmation string required

---

## 🏛️ AUTHORITY PROTECTED ROUTES

**Note:** All authority routes require active authority session

### 19. Authority Login (Alternative)
```http
POST /authority/login
Content-Type: application/json

{
  "designation": "Assistant_Collector_North",
  "password": "Reviewer@123"
}
```
**Same credentials as auth/authority/login**

---

### 20. Authority Dashboard
```http
GET /authority/dashboard
```
**Authentication:** Authority session required  
**Response:** Real application statistics and workload

---

### 21. Get Pending Applications
```http
GET /authority/applications/pending
```
**Authentication:** Authority session required, reviewer+ access  
**Query Parameters:**
- `status` (optional): `under_review`, `pending_documents`, etc.
- `urgency` (optional): `low`, `normal`, `high`, `urgent`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example with filters:**
```http
GET /authority/applications/pending?status=under_review&urgency=high&page=1&limit=10
```

---

### 22. Get Application Details
```http
GET /authority/applications/APP_123456
```
**Authentication:** Authority session required  
**Path Parameter:** Application ID  
**Response:** Complete application details and processing history

---

### 23. Review/Process Application
```http
POST /authority/applications/APP_123456/review
Content-Type: application/json

{
  "action": "approve",
  "comments": "All documents verified and approved"
}
```

**Valid Actions & Required Fields:**

**APPROVE:**
```json
{
  "action": "approve",
  "comments": "Application approved after verification"
}
```

**REJECT:**
```json
{
  "action": "reject",
  "comments": "Missing required documentation"
}
```

**REQUEST DOCUMENTS:**
```json
{
  "action": "request_documents",
  "comments": "Need additional income proof",
  "requiredDocuments": ["income_proof", "address_proof"]
}
```

**FORWARD:**
```json
{
  "action": "forward",
  "comments": "Forwarding to higher authority for final approval",
  "forwardTo": "District_Collector_Delhi"
}
```

**HOLD:**
```json
{
  "action": "hold",
  "comments": "Putting on hold pending clarification"
}
```

**Forwarding Hierarchy:**
- Data_Entry_Operator → Tehsildar_CP_Zone, Assistant_Collector_North
- Tehsildar_CP_Zone → Assistant_Collector_North, District_Collector_Delhi
- Assistant_Collector_North → District_Collector_Delhi

---

### 24. Get Forwarding Options
```http
GET /authority/forwarding-options
```
**Authentication:** Authority session required, reviewer+ access  
**Response:** Valid forwarding targets for current authority

---

### 25. Create Test Application
```http
POST /authority/applications/create-test
```
**Authentication:** Authority session required, admin access  
**Body:** None required  
**Response:** Creates test application with random user data

---

### 26. Create New Authority
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
**Authentication:** Authority session required, admin access  
**Valid Access Levels:** `admin`, `reviewer`, `viewer`  
**Valid Permissions:** `create_authority`, `review_applications`, `approve_applications`, `reject_applications`, `view_all_data`

---

### 27. List All Authorities
```http
GET /authority/list
```
**Authentication:** Authority session required, admin access  
**Response:** All authority accounts (excluding passwords)

---

## 🧪 TESTING WORKFLOW

### Complete User Testing:
1. **Signup Flow:** Request mobile OTP → Verify → Initiate Aadhaar → Complete verification
2. **Login Flow:** Login with credentials → Access user routes
3. **User Operations:** Profile, dashboard, stats, update profile
4. **Logout:** Destroy session

### Authority Testing:
1. **Setup:** Run `node setup-authorities.js` to create test authorities
2. **Login:** Use test credentials to login as authority
3. **Create Test Data:** Create test applications (admin only)
4. **Process Applications:** Review, approve, reject, forward
5. **Track Processing:** View application history and forwarding chain

### Session Testing:
1. **Valid Session:** Access protected routes after login
2. **Invalid Session:** Try accessing without login (should get 401)
3. **Cross-Access:** Try user routes with authority session (should fail)
4. **Session Expiry:** Wait for session timeout and test access

---

## 🔧 Environment Setup

### 1. Start MongoDB
```bash
mongod
```

### 2. Start Backend Server
```bash
cd backend
npm start
```

### 3. Create Test Authorities
```bash
node setup-authorities.js
```

### 4. Test with Tools
- **Postman** (recommended)
- **Thunder Client** (VS Code extension)
- **curl** (command line)
- **REST Client** (VS Code extension)

---

## 🚨 Common Testing Scenarios

### Session Management:
- Login creates session cookie
- All protected routes use session automatically
- Logout destroys session
- Session expires after configured time

### Error Handling:
- Invalid credentials → 401
- Missing fields → 400 with specific field names
- Unauthorized access → 403
- Not found → 404
- Server errors → 500

### Application Forwarding:
- Create test application as admin
- Login as different authority levels
- Forward application through hierarchy
- Track complete processing chain

This comprehensive guide covers all 27 endpoints with exact request formats, required fields, and validation rules!