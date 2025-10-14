# 📚 SYSTEM DOCUMENTATION
## PCR Portal - Comprehensive System Documentation

> **Version:** 1.0.0  
> **Last Updated:** October 14, 2025  
> **For:** Developers, System Administrators, and Technical Users

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema](#4-database-schema)
5. [Authentication & Security](#5-authentication--security)
6. [Authority Hierarchy](#6-authority-hierarchy)
7. [Application Lifecycle](#7-application-lifecycle)
8. [API Reference](#8-api-reference)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Deployment Guide](#10-deployment-guide)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. System Overview

### 1.1 What is PCR Portal?

The **PCR Portal** (Public Certificate Request Portal) is a full-stack MERN application designed to streamline the process of applying for government certificates (income, residence, caste, character certificates, etc.) and manage their verification through a hierarchical authority system.

### 1.2 Key Features

- ✅ **Multi-Step User Registration** with Mobile & Aadhaar OTP verification
- ✅ **Session-Based Authentication** for both applicants and authorities
- ✅ **Role-Based Access Control** (Applicant, Data Entry Operator, Tehsildar, Assistant Collector, District Collector)
- ✅ **Hierarchical Application Processing** with automatic forwarding
- ✅ **Real-Time Status Tracking** for applicants
- ✅ **Data Verification System** before authority review
- ✅ **Document Management** with upload and verification
- ✅ **Admin Dashboard** for District Collector to monitor all applications
- ✅ **Reports & Analytics** for authority users

### 1.3 User Roles

| Role | Access Level | Capabilities |
|------|--------------|--------------|
| **Applicant** | N/A | Submit applications, upload documents, track status |
| **Data Entry Operator** | Level 1 | Verify data completeness, escalate to reviewers |
| **Tehsildar** | Level 3 | Review applications, approve/reject, forward to higher authority |
| **Assistant Collector** | Level 4 | Review forwarded applications, approve/reject, forward to District Collector |
| **District Collector** | Level 5 | Final approval authority, admin view of all applications, forward to Banking Section |

---

## 2. Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ React UI │  │  Router  │  │ Context  │  │   API    │   │
│  │Components│  │  (RRD)   │  │ (State)  │  │  Client  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                            ↓ HTTP Requests                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────┴───────────────────────────────┐
│                         BACKEND                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Express  │→ │  Routes  │→ │Controller│→ │  Models  │   │
│  │  Server  │  │          │  │          │  │ (Mongoose)│   │
│  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘   │
│       ↕                                           │          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐       │          │
│  │Middleware│  │  Session │  │  Utils   │       │          │
│  │  (Auth)  │  │  Store   │  │ (Crypto) │       │          │
│  └──────────┘  └──────────┘  └──────────┘       │          │
└─────────────────────────────────────────────────┼──────────┘
                                                    │
                                                    ↓
┌─────────────────────────────────────────────────┴──────────┐
│                      DATABASE                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │Authorities│  │Applications│ │ Sessions │   │
│  │Collection│  │Collection │  │ Collection │ │Collection│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                     MongoDB Atlas                            │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

#### 2.2.1 Applicant Flow
```
User Registration → Mobile OTP → Aadhaar Verification → Account Created
         ↓
    Login (OTP/Password) → Session Created → Dashboard Access
         ↓
  Apply for Scheme → Submit Application → Upload Documents
         ↓
  Track Status → View Processing Chain → Download Certificate
```

#### 2.2.2 Authority Flow
```
Authority Login → Session Created → Authority Dashboard
         ↓
View Pending Applications → Select Application → Review Details
         ↓
Decision: Approve/Reject/Forward/Request Documents
         ↓
Application Status Updated → Applicant Notified
```

### 2.3 Data Flow

```
┌──────────────┐
│  Application │ (Submitted by User)
│   Created    │
└──────┬───────┘
       ↓
┌──────────────────────────────────────────────────────┐
│  Data Verification (Level 1 - Data Entry Operator)   │
│  • Check completeness                                 │
│  • Verify required fields                             │
│  • Mark missing documents                             │
└──────┬─────────────────────────────┬─────────────────┘
       │ Complete                    │ Incomplete
       ↓                             ↓
┌──────────────┐            ┌──────────────────┐
│ Auto-Forward │            │ Send Back to User│
│ to Tehsildar │            │ (Pending Docs)   │
└──────┬───────┘            └──────────────────┘
       ↓
┌──────────────────────────────────────────────────────┐
│  Review (Level 3 - Tehsildar)                        │
│  • Review application details                         │
│  • Verify documents                                   │
│  • Decision: Approve/Reject/Forward                   │
└──────┬─────────────────────────────┬─────────────────┘
       │ Forward                     │ Approve/Reject
       ↓                             ↓
┌──────────────────────┐      ┌──────────────┐
│ Assistant Collector  │      │   Complete   │
│    (Level 4)         │      └──────────────┘
└──────┬───────────────┘
       ↓
┌──────────────────────────────────────────────────────┐
│  Final Review (Level 5 - District Collector)         │
│  • Final approval authority                           │
│  • Can see all applications (Admin view)              │
│  • Decision: Accept/Reject                            │
└──────┬─────────────────────────────┬─────────────────┘
       │ Accept                      │ Reject
       ↓                             ↓
┌──────────────┐            ┌──────────────────┐
│Forward to    │            │   Application    │
│Banking Section│            │    Rejected      │
└──────────────┘            └──────────────────┘
```

---

## 3. Technology Stack

### 3.1 Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 5.1.0 | Web application framework |
| **MongoDB** | 8.x | NoSQL database |
| **Mongoose** | 8.19.1 | ODM for MongoDB |
| **express-session** | 1.18.2 | Session management |
| **connect-mongo** | 5.1.0 | MongoDB session store |
| **bcryptjs** | 3.0.2 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT token generation (temporary tokens) |
| **crypto** | Built-in | Data encryption |
| **otp-generator** | 4.0.1 | OTP generation |
| **uuid** | 13.0.0 | Unique ID generation |
| **cors** | 2.8.5 | Cross-origin resource sharing |
| **dotenv** | 17.2.3 | Environment variables |

### 3.2 Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library |
| **React DOM** | 19.1.1 | React rendering |
| **React Router DOM** | 6.22.0 | Client-side routing |
| **Axios** | 1.6.7 | HTTP client |
| **Vite** | 7.1.7 | Build tool & dev server |
| **ESLint** | 9.36.0 | Code linting |

### 3.3 Development Tools

- **Nodemon** - Auto-restart server on changes
- **Vite Dev Server** - Fast HMR for frontend
- **MongoDB Compass** - Database GUI (optional)
- **Postman** - API testing (optional)

---

## 4. Database Schema

### 4.1 Users Collection

**Purpose:** Store registered applicant information after Aadhaar verification

```javascript
{
  userId: String (UUID, unique, required),
  loginUserId: String (unique, required, indexed) // e.g., "USER_123456",
  password: String (hashed, required, select: false),
  
  // Personal Information
  name: String (required, max 100 chars),
  dateOfBirth: Date (required),
  gender: String (enum: ['Male', 'Female', 'Other']),
  
  // Contact
  mobile: String (masked: "******7890", unique),
  mobileOriginal: String (encrypted, select: false),
  
  // Address
  address: {
    line1: String (required, max 200 chars),
    line2: String (max 200 chars),
    city: String (required, max 100 chars),
    state: String (required, max 100 chars),
    pincode: String (required, pattern: /^[1-9][0-9]{5}$/)
  },
  
  // Security
  aadhaarHash: String (hashed, unique, select: false),
  
  // Status
  isVerified: Boolean (default: true),
  isActive: Boolean (default: true),
  
  // Timestamps
  mobileVerifiedAt: Date (required),
  aadhaarVerifiedAt: Date (required),
  lastLogin: Date,
  loginCount: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `userId` (unique)
- `loginUserId` (unique)
- `mobile` (unique)
- `aadhaarHash` (unique)
- `createdAt` (descending)

**Virtual Fields:**
- `age` - Calculated from dateOfBirth
- `aadhaarMasked` - Always returns "XXXX-XXXX-****"

### 4.2 Authorities Collection

**Purpose:** Store designation-based authority accounts for application verification

```javascript
{
  authorityId: String (UUID, unique, required),
  designation: String (uppercase, unique, required, indexed),
  designationName: String (required, max 100 chars),
  email: String (lowercase, required, validated),
  password: String (hashed, required, select: false),
  
  // Access Control
  accessLevel: Number (1-5, required, default: 1),
  department: String (required, max 100 chars),
  office: String (required, max 100 chars),
  jurisdiction: String (required, max 100 chars),
  
  // Form Management
  assignedForms: [ObjectId] (ref: 'Form'),
  verifiedForms: [ObjectId] (ref: 'Form'),
  rejectedForms: [ObjectId] (ref: 'Form'),
  
  // Status
  isActive: Boolean (default: true),
  
  // Tracking
  lastLogin: Date,
  loginCount: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `designation` (unique)
- `accessLevel`
- `department`
- `isActive`
- `createdAt` (descending)

**Access Levels:**
- **Level 1:** Data Entry Operator
- **Level 2:** Field Verifier
- **Level 3:** Tehsildar / Block Development Officer
- **Level 4:** Assistant Collector / Sub-Divisional Magistrate
- **Level 5:** District Collector / District Magistrate

### 4.3 Applications Collection

**Purpose:** Track user applications and their processing through authority levels

```javascript
{
  applicationId: String (pattern: "APP_XXXXXX", unique, required),
  
  // User Reference
  userId: String (required, ref: 'User'),
  applicantName: String (required),
  applicantMobile: String (required),
  
  // Application Details
  applicationData: {
    purpose: String (enum: ['income_certificate', 'residence_certificate', 
                            'caste_certificate', 'character_certificate', 'other']),
    description: String,
    urgency: String (enum: ['low', 'normal', 'high', 'urgent'], default: 'normal')
  },
  
  // Documents
  documents: [{
    type: String (enum: ['aadhaar', 'mobile_verification', 'address_proof', 
                         'income_proof', 'other']),
    status: String (enum: ['submitted', 'verified', 'rejected', 'pending']),
    verifiedBy: String,
    verifiedAt: Date,
    comments: String
  }],
  
  // Status
  status: String (enum: ['submitted', 'data_verification', 'under_review', 
                         'pending_documents', 'forwarded', 'approved', 
                         'accepted', 'rejected', 'on_hold'],
                 default: 'data_verification'),
  
  // Data Verification (Level 1)
  dataVerification: {
    isComplete: Boolean (default: null),
    verifiedBy: String (designation),
    verifiedAt: Date,
    missingFields: [String],
    comments: String,
    action: String (enum: ['pending', 'verified_complete', 'incomplete', 'escalated'])
  },
  
  // Processing Chain (History)
  processingChain: [{
    authorityId: String,
    designation: String,
    department: String,
    action: String (enum: ['review_started', 'approved', 'rejected', 
                           'forwarded', 'requested_docs', 'on_hold']),
    comments: String,
    timestamp: Date (default: now),
    forwardedTo: String (next authority designation)
  }],
  
  // Current Authority
  currentAuthority: {
    designation: String,
    department: String,
    assignedAt: Date (default: now)
  },
  
  // Timestamps
  submittedAt: Date (default: now),
  lastUpdated: Date (default: now),
  completedAt: Date,
  
  // Metrics
  totalProcessingTime: Number (in hours),
  authorityChanges: Number (default: 0)
}
```

**Indexes:**
- `applicationId` (unique)
- `userId`
- `status`
- `currentAuthority.designation`
- `submittedAt` (descending)

**Status Flow:**
```
submitted → data_verification → under_review → approved/accepted/rejected
                    ↓
              pending_documents (if incomplete)
```

### 4.4 Sessions Collection

**Purpose:** Store Express session data with MongoDB

```javascript
{
  _id: String (session ID),
  expires: Date (TTL index),
  session: {
    cookie: Object,
    // User Session
    user: {
      userId: String,
      loginUserId: String,
      name: String,
      mobile: String,
      isVerified: Boolean
    },
    // OR Authority Session
    authority: {
      authorityId: String,
      designation: String,
      designationName: String,
      accessLevel: Number,
      department: String
    }
  }
}
```

**TTL:** 24 hours (configurable via `SESSION_MAX_AGE`)

---

## 5. Authentication & Security

### 5.1 Multi-Step User Registration

The user registration process consists of 3 main steps:

#### Step 1: Mobile OTP Verification
```
POST /auth/request-mobile-otp
Body: { mobile: "+91XXXXXXXXXX" }
Response: { success: true, message: "OTP sent", expiresIn: 300 }

POST /auth/verify-mobile-otp
Body: { mobile: "+91XXXXXXXXXX", otp: "123456" }
Response: { success: true, tempToken: "jwt_token", expiresIn: 600 }
```

**Security Measures:**
- OTP valid for 5 minutes
- Rate limiting: Max 3 OTP requests per 10 minutes per mobile
- Temporary JWT token valid for 10 minutes

#### Step 2: Aadhaar Verification (Mocked)
```
POST /auth/aadhaar/initiate
Headers: { Authorization: "Bearer <tempToken>" }
Body: { aadhaarNumber: "XXXXXXXXXXXX" }
Response: { success: true, transactionId: "uuid", message: "OTP sent to Aadhaar" }

POST /auth/aadhaar/verify
Headers: { Authorization: "Bearer <tempToken>" }
Body: { transactionId: "uuid", otp: "123456", aadhaarData: {...} }
Response: { success: true, user: {...}, loginCredentials: {...} }
```

**Security Measures:**
- Aadhaar number hashed with SHA-256 + salt
- Never stored in plain text
- Aadhaar OTP valid for 10 minutes
- Transaction ID expires after 15 minutes

#### Step 3: Account Creation
- System generates unique `loginUserId` (e.g., USER_123456)
- System generates random 8-character password
- Password hashed with bcrypt (12 rounds)
- Mobile number masked (******7890)
- Session created automatically

### 5.2 User Login

**Two Methods:**

**Method 1: OTP Login**
```
POST /auth/login
Body: { loginUserId: "USER_123456", useOTP: true }
Response: { success: true, message: "OTP sent" }

POST /auth/verify-login-otp
Body: { loginUserId: "USER_123456", otp: "123456" }
Response: { success: true, user: {...} }
```

**Method 2: Password Login**
```
POST /auth/login-password
Body: { loginUserId: "USER_123456", password: "password123" }
Response: { success: true, user: {...} }
```

### 5.3 Authority Login

```
POST /auth/authority/login
Body: { designation: "DISTRICT_COLLECTOR_DELHI", password: "password123" }
Response: { success: true, authority: {...} }
```

**Default Authorities:**
- DATA_ENTRY_OPERATOR (Level 1)
- TEHSILDAR_CP_ZONE (Level 3)
- ASSISTANT_COLLECTOR_NORTH (Level 4)
- DISTRICT_COLLECTOR_DELHI (Level 5)

### 5.4 Session Management

**Session Configuration:**
- **Storage:** MongoDB (connect-mongo)
- **Duration:** 24 hours (configurable)
- **Cookie Settings:**
  - `httpOnly: true` (XSS protection)
  - `secure: true` (HTTPS only in production)
  - `sameSite: 'strict'` (CSRF protection)
  - Custom name: `pcr_poa_session`

**Session Validation:**
```
GET /auth/session
Response: { 
  success: true, 
  sessionType: "user" | "authority",
  user: {...} | authority: {...}
}
```

### 5.5 Security Best Practices

✅ **Implemented:**
- Password hashing with bcrypt (12 rounds)
- Aadhaar hashing with SHA-256
- Session-based authentication (no JWT in localStorage)
- CORS configuration with credentials
- Mobile number masking
- Sensitive fields excluded from queries (`select: false`)
- Input validation with Mongoose schemas
- HTTP-only cookies
- Rate limiting on OTP endpoints

⚠️ **Production Recommendations:**
- Enable HTTPS (Let's Encrypt)
- Add Helmet.js for security headers
- Implement rate limiting middleware
- Add request logging (Morgan)
- Enable MongoDB encryption at rest
- Use environment-specific secrets
- Implement 2FA for authority accounts
- Add CAPTCHA for login forms
- Monitor for brute force attacks

---

## 6. Authority Hierarchy

### 6.1 Authority Levels & Responsibilities

```
Level 5: District Collector (DISTRICT_COLLECTOR_DELHI)
         └─ Final approval authority
         └─ Admin view (sees ALL applications)
         └─ Forwards to Banking Section
         └─ Marks applications as 'accepted'
                    ↑
                    │
Level 4: Assistant Collector (ASSISTANT_COLLECTOR_NORTH)
         └─ Reviews applications from Tehsildar
         └─ Can approve, reject, or forward to District Collector
         └─ Has regional authority
                    ↑
                    │
Level 3: Tehsildar (TEHSILDAR_CP_ZONE)
         └─ Reviews applications after data verification
         └─ First-level decision maker
         └─ Can approve, reject, or forward
                    ↑
                    │
Level 1: Data Entry Operator (DATA_ENTRY_OPERATOR)
         └─ Verifies data completeness
         └─ Checks for missing documents
         └─ Auto-escalates complete applications to Tehsildar
         └─ Sends incomplete applications back to user
```

### 6.2 Forwarding Rules (Auto-Forward on Approve)

When an authority approves an application, it automatically forwards to the next level:

```javascript
const forwardingRules = {
  'TEHSILDAR_CP_ZONE': 'Assistant_Collector_North',
  'ASSISTANT_COLLECTOR_NORTH': 'District_Collector_Delhi',
  'DISTRICT_COLLECTOR_DELHI': 'Banking_Section' // Final step
};
```

**Important:** All designations are stored in **UPPERCASE** in the database to ensure case-insensitive matching.

### 6.3 Authority Permissions

| Permission | Level 1 | Level 3 | Level 4 | Level 5 |
|------------|---------|---------|---------|---------|
| View Assigned Applications | ✅ | ✅ | ✅ | ✅ |
| View ALL Applications | ❌ | ❌ | ❌ | ✅ (Admin) |
| Verify Data Completeness | ✅ | ❌ | ❌ | ❌ |
| Approve Applications | ❌ | ✅ | ✅ | ✅ |
| Reject Applications | ❌ | ✅ | ✅ | ✅ |
| Forward Manually | ❌ | ✅ | ✅ | ✅ |
| Request Documents | ❌ | ✅ | ✅ | ✅ |
| Mark as On Hold | ❌ | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Export Data | ❌ | ❌ | ❌ | ✅ |

---

## 7. Application Lifecycle

### 7.1 Complete Lifecycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ STAGE 1: Application Submission (Applicant)                 │
├─────────────────────────────────────────────────────────────┤
│ • User logs in                                              │
│ • Selects scheme (Income/Residence/Caste/Character Cert)   │
│ • Fills application form                                    │
│ • Uploads required documents                                │
│ • Submits application                                       │
│ • Status: data_verification                                 │
│ • Current Authority: DATA_ENTRY_OPERATOR                    │
└─────────────────┬───────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────────────────┐
│ STAGE 2: Data Verification (Level 1)                        │
├─────────────────────────────────────────────────────────────┤
│ • Data Entry Operator reviews application                   │
│ • Checks for missing fields/documents                       │
│ • Decision:                                                  │
│   → Complete: Auto-escalate to Tehsildar                    │
│   → Incomplete: Send back to user (pending_documents)       │
└─────────────────┬───────────────────────────────────────────┘
                  ↓ (if complete)
┌─────────────────────────────────────────────────────────────┐
│ STAGE 3: Tehsildar Review (Level 3)                         │
├─────────────────────────────────────────────────────────────┤
│ • Tehsildar reviews application details                     │
│ • Verifies documents                                         │
│ • Decision:                                                  │
│   → Approve: Auto-forward to Assistant Collector            │
│   → Reject: Application ends (status: rejected)             │
│   → Request Docs: Send to user (pending_documents)          │
│   → On Hold: Temporarily pause (status: on_hold)            │
└─────────────────┬───────────────────────────────────────────┘
                  ↓ (if approved)
┌─────────────────────────────────────────────────────────────┐
│ STAGE 4: Assistant Collector Review (Level 4)               │
├─────────────────────────────────────────────────────────────┤
│ • Assistant Collector reviews forwarded application         │
│ • Decision:                                                  │
│   → Approve: Auto-forward to District Collector             │
│   → Reject: Application ends (status: rejected)             │
│   → Forward Manually: Send to specific authority            │
└─────────────────┬───────────────────────────────────────────┘
                  ↓ (if approved)
┌─────────────────────────────────────────────────────────────┐
│ STAGE 5: District Collector Final Approval (Level 5)        │
├─────────────────────────────────────────────────────────────┤
│ • District Collector (final authority) reviews              │
│ • Decision:                                                  │
│   → Accept: Forward to Banking Section (status: accepted)   │
│   → Reject: Application ends (status: rejected)             │
│ • Status changes to 'accepted'                              │
│ • completedAt timestamp recorded                            │
└─────────────────┬───────────────────────────────────────────┘
                  ↓ (if accepted)
┌─────────────────────────────────────────────────────────────┐
│ STAGE 6: Banking Section Processing                         │
├─────────────────────────────────────────────────────────────┤
│ • Application forwarded to Banking Section                  │
│ • Current Authority: BANKING_SECTION                        │
│ • User can download certificate                             │
│ • Processing complete                                        │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Status Transitions

| From Status | To Status | Trigger | Who Can Do |
|-------------|-----------|---------|------------|
| `data_verification` | `under_review` | Data verification complete | Data Entry Operator |
| `data_verification` | `pending_documents` | Data incomplete | Data Entry Operator |
| `under_review` | `approved` | Application approved | Tehsildar, Assistant Collector |
| `under_review` | `accepted` | Final approval | District Collector |
| `under_review` | `rejected` | Application rejected | Any reviewer (Level 3+) |
| `under_review` | `pending_documents` | More docs needed | Any reviewer (Level 3+) |
| `under_review` | `on_hold` | Temporarily pause | Any reviewer (Level 3+) |
| `pending_documents` | `under_review` | User uploads docs | System (auto) |
| `on_hold` | `under_review` | Resume processing | Same authority |

### 7.3 Processing Chain Example

```javascript
// Example: Application processed from submission to acceptance
{
  applicationId: "APP_123456",
  status: "accepted",
  processingChain: [
    {
      action: "review_started",
      timestamp: "2025-10-01T10:00:00Z",
      comments: "Application submitted"
    },
    {
      designation: "DATA_ENTRY_OPERATOR",
      department: "IT",
      action: "approved",
      comments: "Data verification complete",
      timestamp: "2025-10-01T11:00:00Z"
    },
    {
      designation: "DATA_ENTRY_OPERATOR",
      department: "IT",
      action: "forwarded",
      comments: "Automatically escalated to TEHSILDAR_CP_ZONE",
      timestamp: "2025-10-01T11:00:00Z",
      forwardedTo: "TEHSILDAR_CP_ZONE"
    },
    {
      designation: "TEHSILDAR_CP_ZONE",
      department: "Revenue",
      action: "approved",
      comments: "Application verified and approved",
      timestamp: "2025-10-02T14:30:00Z"
    },
    {
      designation: "TEHSILDAR_CP_ZONE",
      department: "Revenue",
      action: "forwarded",
      comments: "Auto-forwarded to ASSISTANT_COLLECTOR_NORTH",
      timestamp: "2025-10-02T14:30:00Z",
      forwardedTo: "ASSISTANT_COLLECTOR_NORTH"
    },
    {
      designation: "ASSISTANT_COLLECTOR_NORTH",
      department: "Revenue",
      action: "approved",
      comments: "Approved after review",
      timestamp: "2025-10-03T16:00:00Z"
    },
    {
      designation: "ASSISTANT_COLLECTOR_NORTH",
      department: "Revenue",
      action: "forwarded",
      comments: "Auto-forwarded to DISTRICT_COLLECTOR_DELHI",
      timestamp: "2025-10-03T16:00:00Z",
      forwardedTo: "DISTRICT_COLLECTOR_DELHI"
    },
    {
      designation: "DISTRICT_COLLECTOR_DELHI",
      department: "Revenue",
      action: "forwarded",
      comments: "Accepted and forwarded to Banking Section",
      timestamp: "2025-10-04T10:00:00Z",
      forwardedTo: "BANKING_SECTION"
    }
  ],
  currentAuthority: {
    designation: "BANKING_SECTION",
    department: "Banking",
    assignedAt: "2025-10-04T10:00:00Z"
  },
  completedAt: "2025-10-04T10:00:00Z",
  totalProcessingTime: 72 // hours
}
```

---

## 8. API Reference

### 8.1 Authentication Endpoints

#### POST /auth/request-mobile-otp
Request OTP for mobile verification during signup.

**Request:**
```json
{
  "mobile": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to mobile",
  "expiresIn": 300
}
```

#### POST /auth/verify-mobile-otp
Verify mobile OTP and get temporary token.

**Request:**
```json
{
  "mobile": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 600,
  "message": "Mobile verified successfully"
}
```

#### POST /auth/aadhaar/initiate
Initiate Aadhaar verification (requires tempToken).

**Headers:**
```
Authorization: Bearer <tempToken>
```

**Request:**
```json
{
  "aadhaarNumber": "123456789012"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "uuid-transaction-id",
  "message": "OTP sent to Aadhaar-linked mobile",
  "expiresIn": 600
}
```

#### POST /auth/aadhaar/verify
Verify Aadhaar OTP and complete registration.

**Headers:**
```
Authorization: Bearer <tempToken>
```

**Request:**
```json
{
  "transactionId": "uuid-transaction-id",
  "otp": "123456",
  "aadhaarData": {
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "address": {
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "New Delhi",
      "state": "Delhi",
      "pincode": "110001"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "userId": "uuid",
    "loginUserId": "USER_123456",
    "name": "John Doe",
    "mobile": "******3210"
  },
  "loginCredentials": {
    "loginUserId": "USER_123456",
    "password": "TempPass123"
  }
}
```

#### POST /auth/login
User login (OTP or Password).

**Request (OTP):**
```json
{
  "loginUserId": "USER_123456",
  "useOTP": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to registered mobile",
  "expiresIn": 300
}
```

#### POST /auth/verify-login-otp
Verify login OTP.

**Request:**
```json
{
  "loginUserId": "USER_123456",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "uuid",
    "loginUserId": "USER_123456",
    "name": "John Doe",
    "mobile": "******3210",
    "isVerified": true
  }
}
```

#### POST /auth/login-password
User login with password.

**Request:**
```json
{
  "loginUserId": "USER_123456",
  "password": "TempPass123"
}
```

**Response:**
```json
{
  "success": true,
  "user": { /* user object */ }
}
```

#### POST /auth/authority/login
Authority login.

**Request:**
```json
{
  "designation": "DISTRICT_COLLECTOR_DELHI",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "authority": {
    "authorityId": "uuid",
    "designation": "DISTRICT_COLLECTOR_DELHI",
    "designationName": "District Collector - Delhi",
    "accessLevel": 5,
    "department": "Revenue"
  }
}
```

#### GET /auth/session
Get current session information.

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "sessionType": "user",
  "user": { /* user object */ }
}
```

#### POST /auth/logout
Logout current user/authority.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 8.2 Application Endpoints

#### POST /applications/submit
Submit a new application (User only).

**Request:**
```json
{
  "applicationData": {
    "purpose": "income_certificate",
    "description": "Need income certificate for scholarship",
    "urgency": "normal"
  },
  "documents": [
    {
      "type": "aadhaar",
      "status": "submitted"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "applicationId": "APP_123456",
    "status": "data_verification",
    "submittedAt": "2025-10-01T10:00:00Z"
  }
}
```

#### GET /applications/user/:userId
Get all applications for a specific user.

**Response:**
```json
{
  "success": true,
  "applications": [
    {
      "applicationId": "APP_123456",
      "status": "under_review",
      "purpose": "income_certificate",
      "submittedAt": "2025-10-01T10:00:00Z",
      "currentAuthority": {
        "designation": "TEHSILDAR_CP_ZONE"
      }
    }
  ]
}
```

#### GET /applications/:applicationId
Get application details by ID.

**Response:**
```json
{
  "success": true,
  "application": {
    "applicationId": "APP_123456",
    "applicantName": "John Doe",
    "status": "under_review",
    "applicationData": { /* application data */ },
    "processingChain": [ /* processing history */ ],
    "currentAuthority": { /* current authority */ }
  }
}
```

#### POST /applications/:applicationId/upload-document
Upload additional document.

**Request (multipart/form-data):**
```
document: <file>
documentType: "address_proof"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully"
}
```

### 8.3 Authority Endpoints

#### GET /authority/dashboard
Get authority dashboard data.

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "authority": {
      "designation": "TEHSILDAR_CP_ZONE",
      "accessLevel": 3,
      "isAdmin": false
    },
    "statistics": {
      "pendingApplications": 5,
      "processedToday": 2,
      "totalApplications": 15,
      "byStatus": {
        "under_review": 5,
        "approved": 8,
        "rejected": 2
      }
    },
    "recentApplications": [ /* recent apps */ ]
  }
}
```

#### GET /authority/pending
Get pending applications for authority.

**Query Parameters:**
- `status` (optional): Filter by status (empty = pending only, "all" = all apps)

**Response:**
```json
{
  "success": true,
  "applications": [ /* array of applications */ ],
  "authority": {
    "isAdmin": false
  }
}
```

#### POST /authority/review/:applicationId
Review and take action on application.

**Request:**
```json
{
  "action": "approve",
  "comments": "Application verified and approved"
}
```

**Actions:** `approve`, `reject`, `forward`, `request_docs`, `on_hold`

**Response:**
```json
{
  "success": true,
  "message": "Application approved successfully",
  "application": { /* updated application */ }
}
```

#### POST /authority/forward/:applicationId
Manually forward application to specific authority.

**Request:**
```json
{
  "targetAuthority": "ASSISTANT_COLLECTOR_NORTH",
  "comments": "Forwarding for higher-level review"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application forwarded successfully"
}
```

#### GET /authority/forwarding-options
Get available authorities to forward to.

**Response:**
```json
{
  "success": true,
  "options": [
    {
      "designation": "ASSISTANT_COLLECTOR_NORTH",
      "name": "Assistant Collector - North Delhi",
      "level": 4,
      "department": "Revenue"
    }
  ]
}
```

#### POST /authority/data-verification/:applicationId
Verify data completeness (Level 1 only).

**Request:**
```json
{
  "isComplete": true,
  "missingFields": [],
  "comments": "All data verified"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data verification complete. Application escalated to Tehsildar.",
  "application": { /* updated application */ }
}
```

### 8.4 User Profile Endpoints

#### GET /users/profile
Get user profile.

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": "uuid",
    "loginUserId": "USER_123456",
    "name": "John Doe",
    "mobile": "******3210",
    "address": { /* address object */ },
    "age": 33
  }
}
```

#### PUT /users/profile
Update user profile.

**Request:**
```json
{
  "address": {
    "line1": "456 New Street",
    "city": "New Delhi"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user */ }
}
```

---

*Continued in SYSTEM_DOCUMENTATION_PART2.md...*
