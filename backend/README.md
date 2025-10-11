# MERN Multi-Step Signup Backend

A comprehensive Node.js/Express backend for a multi-step user signup system with mobile OTP and Aadhaar verification.

## 🚀 Features

### Multi-Step Signup Flow
1. **Mobile Number Verification** - OTP-based mobile verification
2. **Temporary JWT Token** - Secure session management between steps
3. **Aadhaar Verification** - Mocked UIDAI integration with OTP
4. **User Account Creation** - Secure user profile creation
5. **Permanent JWT Token** - Dashboard access authentication

### Security Features
- ✅ JWT-based authentication (temporary & permanent tokens)
- ✅ OTP generation and validation with expiry
- ✅ Aadhaar number hashing (never store plain Aadhaar)
- ✅ Mobile number masking for privacy
- ✅ In-memory OTP storage (easily replaceable with Redis)
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Error handling and logging

## 📋 API Endpoints

### Authentication Routes (`/auth`)

#### 1. Request Mobile OTP
```http
POST /auth/request-mobile-otp
Content-Type: application/json

{
  "mobile": "+919876543210"
}
```

#### 2. Verify Mobile OTP
```http
POST /auth/verify-mobile-otp
Content-Type: application/json

{
  "mobile": "+919876543210",
  "otp": "123456",
  "sessionId": "uuid-session-id"
}
```

#### 3. Initiate Aadhaar Verification
```http
POST /auth/aadhaar/initiate
Authorization: Bearer <temporary-jwt-token>
Content-Type: application/json

{
  "aadhaar": "234567891234"
}
```

#### 4. Verify Aadhaar OTP
```http
POST /auth/aadhaar/verify
Authorization: Bearer <temporary-jwt-token>
Content-Type: application/json

{
  "aadhaar": "234567891234",
  "otp": "654321",
  "sessionId": "uuid-session-id"
}
```

#### 5. Resend OTP
```http
POST /auth/resend-otp
Content-Type: application/json

{
  "type": "mobile",
  "identifier": "+919876543210"
}
```

### User Routes (`/users`)

#### 1. Get User Profile
```http
GET /users/profile
Authorization: Bearer <permanent-jwt-token>
```

#### 2. Update User Profile
```http
PUT /users/profile
Authorization: Bearer <permanent-jwt-token>
Content-Type: application/json

{
  "address": {
    "line1": "New Address Line 1",
    "line2": "New Address Line 2",
    "city": "New City",
    "state": "New State",
    "pincode": "123456"
  }
}
```

#### 3. Get Dashboard Data
```http
GET /users/dashboard
Authorization: Bearer <permanent-jwt-token>
```

#### 4. Get Account Statistics
```http
GET /users/stats
Authorization: Bearer <permanent-jwt-token>
```

#### 5. Validate Token
```http
GET /users/validate-token
Authorization: Bearer <permanent-jwt-token>
```

#### 6. Deactivate Account
```http
POST /users/deactivate
Authorization: Bearer <permanent-jwt-token>
Content-Type: application/json

{
  "confirmation": "DEACTIVATE_ACCOUNT"
}
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### 1. Clone and Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.template` to `.env` and update the values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mern_signup_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-at-least-32-characters-long
JWT_TEMP_SECRET=your-temporary-jwt-secret-for-aadhaar-verification
JWT_TEMP_EXPIRES_IN=15m
JWT_PERMANENT_EXPIRES_IN=7d

# OTP Configuration
OTP_EXPIRY_MINUTES=5

# Security
BCRYPT_SALT_ROUNDS=12
```

### 3. Start the Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── config/
│   ├── index.js          # Environment configuration
│   └── database.js       # MongoDB connection utility
├── models/
│   └── User.js           # MongoDB User schema
├── routes/
│   ├── auth.js           # Authentication endpoints
│   └── users.js          # User management endpoints
├── utils/
│   ├── otpManager.js     # OTP generation and validation
│   ├── jwtManager.js     # JWT token management
│   └── cryptoManager.js  # Encryption and hashing utilities
├── .env.template         # Environment variables template
├── .env                  # Environment variables (create from template)
├── index.js              # Main server file
└── package.json          # Dependencies and scripts
```

## 🧪 Testing the Flow

### Complete Signup Flow Example

1. **Request Mobile OTP**:
```bash
curl -X POST http://localhost:3000/auth/request-mobile-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210"}'
```

2. **Verify Mobile OTP** (check console for OTP):
```bash
curl -X POST http://localhost:3000/auth/verify-mobile-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "+919876543210", "otp": "123456", "sessionId": "session-id-from-step1"}'
```

3. **Initiate Aadhaar Verification** (use temp token from step 2):
```bash
curl -X POST http://localhost:3000/auth/aadhaar/initiate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <temp-token>" \
  -d '{"aadhaar": "234567891234"}'
```

4. **Verify Aadhaar OTP** (check console for OTP):
```bash
curl -X POST http://localhost:3000/auth/aadhaar/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <temp-token>" \
  -d '{"aadhaar": "234567891234", "otp": "654321", "sessionId": "session-id-from-step3"}'
```

5. **Access Dashboard** (use permanent token from step 4):
```bash
curl -X GET http://localhost:3000/users/dashboard \
  -H "Authorization: Bearer <permanent-token>"
```

## 🔐 Security Notes

### Data Protection
- **Aadhaar numbers** are never stored in plain text - only SHA-256 hashes
- **Mobile numbers** are masked in the database (`******7890`)
- **OTPs** expire after 5 minutes and are limited to 3 attempts
- **JWT tokens** have appropriate expiry times (15m for temp, 7d for permanent)

### Mock Implementation
- **Aadhaar verification** is fully mocked - no real UIDAI integration
- **OTPs** are logged to console for testing purposes
- **User data** is generated based on Aadhaar number for consistency

### Production Considerations
- Replace in-memory OTP storage with Redis
- Implement real SMS gateway for OTP delivery
- Add rate limiting for API endpoints
- Implement proper logging and monitoring
- Add input sanitization middleware
- Use HTTPS in production
- Implement proper error tracking

## 🎯 Key Features

### OTP Management
- 6-digit numeric OTPs
- Configurable expiry time (default 5 minutes)
- Maximum 3 attempts per OTP
- Automatic cleanup of expired OTPs
- Resend functionality

### JWT Token Management
- Temporary tokens for multi-step flow
- Permanent tokens for dashboard access
- Proper token validation and error handling
- Token metadata and expiry tracking

### User Model
- Comprehensive user schema with validation
- Virtual fields for age calculation
- Instance methods for profile management
- Static methods for user creation
- Proper indexing for performance

### Error Handling
- Comprehensive error responses
- Proper HTTP status codes
- Detailed error logging
- Graceful error degradation

## 📊 Database Schema

### User Collection
```javascript
{
  userId: "uuid",
  name: "John Doe",
  dateOfBirth: "1990-01-01",
  gender: "Male",
  mobile: "******7890",           // Masked
  mobileOriginal: "encrypted",    // Encrypted original
  address: {
    line1: "House No. 123",
    line2: "Street 1",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001"
  },
  aadhaarHash: "sha256-hash",     // Never plain Aadhaar
  isVerified: true,
  isActive: true,
  mobileVerifiedAt: "2023-01-01T00:00:00Z",
  aadhaarVerifiedAt: "2023-01-01T00:00:00Z",
  lastLogin: "2023-01-01T00:00:00Z",
  loginCount: 5,
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-01-01T00:00:00Z"
}
```

## 🚀 Deployment

### Environment Variables for Production
Ensure all environment variables are properly set in production:

- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong secret key (256-bit recommended)
- `JWT_TEMP_SECRET` - Different secret for temporary tokens
- `NODE_ENV=production`

### Health Check
The server provides a health check endpoint at `GET /` that returns:
- Server status
- Database connection status
- Available endpoints
- Configuration status

## 📝 License

ISC License

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: This is a prototype implementation with mocked Aadhaar verification. For production use, integrate with actual UIDAI APIs and implement proper security measures.