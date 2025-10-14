# 🔌 API Endpoints Reference

> Complete API endpoint documentation for frontend integration

---

## 🌐 Base Configuration

```javascript
// .env
REACT_APP_API_BASE=http://localhost:5000

// Axios configuration (utils/api.js)
axios.defaults.withCredentials = true; // Required for session cookies
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

---

## 🔐 Authentication Endpoints

### **POST** `/api/auth/signup/initiate`
Start signup process with mobile number

**Request:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "tempToken": "jwt_token_here"
}
```

---

### **POST** `/api/auth/signup/verify-mobile`
Verify mobile OTP

**Request:**
```json
{
  "tempToken": "jwt_token_from_initiate",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Mobile verified",
  "tempToken": "updated_jwt_token"
}
```

---

### **POST** `/api/auth/signup/aadhaar-initiate`
Submit Aadhaar for verification

**Request:**
```json
{
  "tempToken": "jwt_token_from_verify_mobile",
  "aadhaarNumber": "123456789012"
}
```

**Response:**
```json
{
  "message": "Aadhaar OTP sent",
  "tempToken": "updated_jwt_token"
}
```

---

### **POST** `/api/auth/signup/aadhaar-verify`
Complete signup with Aadhaar OTP

**Request:**
```json
{
  "tempToken": "jwt_token_from_aadhaar_initiate",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "credentials": {
    "username": "USER123456",
    "password": "random_generated_password"
  }
}
```

---

### **POST** `/api/auth/login`
Login with username and password

**Request:**
```json
{
  "username": "USER123456",
  "password": "password_here"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "username": "USER123456",
    "role": "applicant",
    "name": "John Doe",
    "mobileNumber": "9876543210"
  }
}
```

---

### **POST** `/api/auth/login-otp/request`
Request OTP for login

**Request:**
```json
{
  "mobileNumber": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully"
}
```

---

### **POST** `/api/auth/login-otp/verify`
Login with OTP

**Request:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "username": "USER123456",
    "role": "applicant",
    "name": "John Doe"
  }
}
```

---

### **POST** `/api/auth/logout`
Logout current user

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## 👤 User Endpoints

### **GET** `/api/users/profile`
Get current user profile

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "username": "USER123456",
    "role": "applicant",
    "name": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "aadhaarVerified": true
  }
}
```

---

### **PUT** `/api/users/profile`
Update user profile

**Request:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

**Response:**
```json
{
  "message": "Profile updated",
  "user": { /* updated user object */ }
}
```

---

### **GET** `/api/users/dashboard`
Get applicant dashboard data

**Response:**
```json
{
  "stats": {
    "total": 10,
    "pending": 3,
    "approved": 5,
    "rejected": 2
  },
  "recentApplications": [
    {
      "applicationId": "APP123456",
      "schemeName": "Education Grant",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## 📝 Application Endpoints

### **POST** `/api/applications`
Create new application

**Request:**
```json
{
  "schemeName": "Education Grant",
  "applicationData": {
    "studentName": "John Doe",
    "course": "Engineering",
    "institution": "ABC University",
    "feeAmount": "50000"
  }
}
```

**Response:**
```json
{
  "message": "Application created",
  "applicationId": "APP123456",
  "application": { /* full application object */ }
}
```

---

### **GET** `/api/applications/my-applications`
Get all applications for current user

**Response:**
```json
{
  "applications": [
    {
      "applicationId": "APP123456",
      "schemeName": "Education Grant",
      "status": "pending",
      "applicantName": "John Doe",
      "submittedAt": "2024-01-15T10:30:00Z",
      "lastUpdated": "2024-01-16T14:20:00Z",
      "currentAuthority": {
        "designation": "Block Officer",
        "level": 1
      }
    }
  ]
}
```

---

### **GET** `/api/applications/:applicationId/status`
Get application status and timeline

**Response:**
```json
{
  "application": {
    "applicationId": "APP123456",
    "schemeName": "Education Grant",
    "status": "approved",
    "applicantName": "John Doe",
    "applicationData": {
      "studentName": "John Doe",
      "course": "Engineering"
    },
    "timeline": [
      {
        "action": "submitted",
        "timestamp": "2024-01-15T10:30:00Z",
        "by": {
          "name": "John Doe"
        }
      },
      {
        "action": "approved",
        "timestamp": "2024-01-16T14:20:00Z",
        "by": {
          "designation": "Block Officer",
          "level": 1
        },
        "comments": "All documents verified"
      }
    ],
    "documents": [
      {
        "fileName": "aadhaar.pdf",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "status": "verified"
      }
    ]
  }
}
```

---

## 👨‍💼 Authority Endpoints

### **GET** `/api/authority/dashboard`
Get authority dashboard data

**Response:**
```json
{
  "stats": {
    "pendingCount": 5,
    "reviewedCount": 12,
    "totalProcessed": 50,
    "avgProcessingTime": "2h"
  },
  "pendingApplications": [
    {
      "applicationId": "APP123456",
      "schemeName": "Education Grant",
      "applicantName": "John Doe",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### **GET** `/api/authority/pending-applications`
Get all pending applications

**Response:**
```json
{
  "applications": [
    {
      "applicationId": "APP123456",
      "schemeName": "Education Grant",
      "applicantName": "John Doe",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00Z",
      "applicationData": {
        "urgency": "normal"
      }
    }
  ]
}
```

---

### **GET** `/api/authority/applications/:applicationId`
Get application details for review

**Response:**
```json
{
  "application": {
    "applicationId": "APP123456",
    "schemeName": "Education Grant",
    "applicantName": "John Doe",
    "status": "pending",
    "applicationData": {
      "studentName": "John Doe",
      "course": "Engineering",
      "urgency": "normal"
    },
    "documents": [ /* document list */ ],
    "timeline": [ /* timeline events */ ]
  }
}
```

---

### **POST** `/api/authority/applications/:applicationId/approve`
Approve application

**Request:**
```json
{
  "comments": "All requirements met. Approved."
}
```

**Response:**
```json
{
  "message": "Application approved",
  "application": { /* updated application */ }
}
```

---

### **POST** `/api/authority/applications/:applicationId/reject`
Reject application

**Request:**
```json
{
  "comments": "Incomplete documentation. Rejected."
}
```

**Response:**
```json
{
  "message": "Application rejected",
  "application": { /* updated application */ }
}
```

---

### **POST** `/api/authority/applications/:applicationId/forward`
Forward application to higher authority

**Request:**
```json
{
  "forwardTo": "authority_id_here",
  "comments": "Requires higher level approval"
}
```

**Response:**
```json
{
  "message": "Application forwarded",
  "application": { /* updated application */ }
}
```

---

### **GET** `/api/authority/higher-authorities`
Get list of higher level authorities

**Response:**
```json
{
  "authorities": [
    {
      "_id": "authority_id",
      "designation": "District Officer",
      "level": 2,
      "email": "district@example.com"
    }
  ]
}
```

---

## 🔄 Error Responses

### **400 Bad Request**
```json
{
  "message": "Validation error",
  "errors": {
    "field": "Field is required"
  }
}
```

### **401 Unauthorized**
```json
{
  "message": "Unauthorized. Please login."
}
```

### **403 Forbidden**
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### **404 Not Found**
```json
{
  "message": "Resource not found"
}
```

### **500 Server Error**
```json
{
  "message": "Internal server error"
}
```

---

## 📊 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

---

## 🍪 Session Management

### **Cookie Name:** `connect.sid`

**Properties:**
- `httpOnly: true` (cannot be accessed via JavaScript)
- `secure: true` (HTTPS only in production)
- `sameSite: 'lax'` (CSRF protection)
- `maxAge: 24h` (for applicants) or `8h` (for authorities)

**Usage in Frontend:**
```javascript
// Axios automatically handles cookies
axios.defaults.withCredentials = true;

// No need to manually set Authorization headers
// Session cookie is sent automatically
```

---

## 🧪 Testing with Postman/curl

### **Login Example**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"USER123456","password":"password"}' \
  --cookie-jar cookies.txt
```

### **Get Profile (with session)**
```bash
curl -X GET http://localhost:5000/api/users/profile \
  --cookie cookies.txt
```

---

## 💡 Integration Tips

### **1. Handle Session Expiry**
```javascript
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### **2. Loading States**
```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await api.getData();
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

### **3. Error Handling**
```javascript
try {
  await api.submitForm(data);
  showToast('Success!', 'success');
} catch (error) {
  const message = error.response?.data?.message || 'Failed';
  showToast(message, 'error');
}
```

---

## 📝 Notes

1. **All requests require session cookie** (except public auth endpoints)
2. **No Bearer tokens** - Session-based authentication only
3. **CORS must be configured** in backend to allow credentials
4. **Session expires** after inactivity period
5. **Logout clears session** on server side

---

## 🔗 Related Documentation

- **Frontend Guide:** [FRONTEND_GUIDE.md](FRONTEND_GUIDE.md)
- **Backend API Testing:** `../backend/API_TESTING_GUIDE.md`
- **Quick Start:** [QUICK_START.md](QUICK_START.md)

---

**Last Updated:** January 2024
