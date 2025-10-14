# 📚 SYSTEM DOCUMENTATION - PART 2
## PCR Portal - Comprehensive System Documentation (Continued)

---

## 9. Frontend Architecture

### 9.1 Project Structure

```
Frontend/
├── public/                  # Static assets
├── src/
│   ├── assets/             # Images, icons, fonts
│   ├── components/         # Reusable UI components
│   │   ├── Alerts/         # Toast notifications
│   │   │   ├── Toast.jsx
│   │   │   └── Toast.css
│   │   ├── Button/         # Button components
│   │   │   ├── PrimaryButton.jsx
│   │   │   ├── SecondaryButton.jsx
│   │   │   └── TagButton.jsx
│   │   ├── Cards/          # Card components
│   │   │   ├── ApplicationCard.jsx
│   │   │   ├── DocumentCard.jsx
│   │   │   ├── StatusTag.jsx
│   │   │   └── Cards.css
│   │   ├── EmptyState/     # No data states
│   │   │   ├── NoData.jsx
│   │   │   └── EmptyState.css
│   │   ├── Input/          # Form inputs
│   │   │   ├── TextInput.jsx
│   │   │   ├── SelectInput.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── OTPInput.jsx
│   │   │   └── Input.css
│   │   ├── Layout/         # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.css
│   │   ├── Loader/         # Loading states
│   │   │   ├── Spinner.jsx
│   │   │   └── Spinner.css
│   │   ├── Modal/          # Modal dialogs
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── context/            # React Context providers
│   │   ├── AuthContext.jsx     # Authentication state
│   │   └── ToastContext.jsx    # Toast notifications
│   ├── data/               # Static data
│   │   └── schemes.js          # Scheme definitions
│   ├── pages/              # Page components
│   │   ├── Applicant/      # Applicant pages
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SchemeList.jsx
│   │   │   ├── SchemeForm.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── TrackStatus.jsx
│   │   │   └── Documents.jsx
│   │   ├── Authority/      # Authority pages
│   │   │   ├── AuthorityDashboard.jsx
│   │   │   ├── PendingApprovals.jsx
│   │   │   ├── AllApplications.jsx
│   │   │   ├── ReviewApplication.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── DataVerificationList.jsx
│   │   │   └── DataVerificationForm.jsx
│   │   ├── Auth/           # Authentication pages
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── OTPVerify.jsx
│   │   ├── NotFound.jsx    # 404 page
│   │   ├── Unauthorized.jsx # 403 page
│   │   └── Profile.jsx     # User/Authority profile
│   ├── utils/              # Utility functions
│   │   ├── api.js              # API client (Axios)
│   │   ├── constants.js        # App constants
│   │   └── useFetch.js         # Custom hooks
│   ├── App.jsx             # Main app component
│   ├── App.css             # Global styles
│   ├── main.jsx            # Entry point
│   └── index.css           # Base styles
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── eslint.config.js        # ESLint configuration
```

### 9.2 State Management

#### 9.2.1 AuthContext

**Purpose:** Manage authentication state globally

**State:**
```javascript
{
  user: {
    userId: String,
    loginUserId: String,
    name: String,
    role: 'applicant' | 'authority',
    isAuthority: Boolean,
    // ... other user/authority fields
  },
  isAuthenticated: Boolean,
  loading: Boolean
}
```

**Methods:**
- `login(userData, tempToken)` - Set user and session
- `logout()` - Clear session and redirect
- `checkAuth()` - Validate session with backend
- `updateUser(userData)` - Update user profile

**Usage:**
```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

#### 9.2.2 ToastContext

**Purpose:** Display toast notifications globally

**Methods:**
- `showToast(message, type)` - Show toast (type: 'success', 'error', 'warning', 'info')

**Usage:**
```javascript
import { useToast } from '../context/ToastContext';

function MyComponent() {
  const { showToast } = useToast();
  
  const handleSubmit = async () => {
    try {
      await api.submitForm(data);
      showToast('Form submitted successfully!', 'success');
    } catch (error) {
      showToast('Failed to submit form', 'error');
    }
  };
}
```

### 9.3 Routing

#### 9.3.1 Route Structure

```javascript
// Public Routes
/login                          // Login page
/signup                         // Registration page
/verify-otp                     // OTP verification

// Applicant Routes (Protected)
/applicant/dashboard            // Applicant dashboard
/applicant/schemes              // Browse schemes
/applicant/schemes/:schemeId    // Apply for scheme
/applicant/applications         // My applications list
/applicant/applications/:id     // Track application status
/applicant/documents            // Manage documents
/applicant/profile              // User profile

// Authority Routes (Protected)
/authority/dashboard            // Authority dashboard
/authority/pending              // Pending approvals (assigned only)
/authority/applications         // All applications (admin view)
/authority/review/:id           // Review specific application
/authority/data-verification    // Data verification list (Level 1)
/authority/data-verification/:id // Verify specific application
/authority/reports              // Reports & analytics
/authority/profile              // Authority profile

// Error Routes
/unauthorized                   // 403 Forbidden
/*                              // 404 Not Found
```

#### 9.3.2 Protected Routes

```javascript
<ProtectedRoute allowedRoles={['applicant', 'authority']}>
  <ComponentName />
</ProtectedRoute>
```

**ProtectedRoute Component:**
- Checks authentication status
- Validates user role
- Redirects to login if not authenticated
- Redirects to unauthorized if wrong role

### 9.4 API Integration

#### 9.4.1 API Client Configuration

**Base Configuration:**
```javascript
const API = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 30000,
  withCredentials: true, // Enable cookies for sessions
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**Interceptors:**
- **Request:** Add Authorization header for temporary tokens
- **Response:** Handle 401 (logout), 403 (unauthorized), 500 (server error)

#### 9.4.2 API Modules

```javascript
// Auth API
export const authAPI = {
  requestMobileOTP: (mobile) => API.post('/auth/request-mobile-otp', { mobile }),
  verifyMobileOTP: (data) => API.post('/auth/verify-mobile-otp', data),
  initiateAadhaar: (data) => API.post('/auth/aadhaar/initiate', data),
  verifyAadhaar: (data) => API.post('/auth/aadhaar/verify', data),
  login: (data) => API.post('/auth/login', data),
  verifyLoginOTP: (data) => API.post('/auth/verify-login-otp', data),
  loginPassword: (data) => API.post('/auth/login-password', data),
  authorityLogin: (data) => API.post('/auth/authority/login', data),
  getSession: () => API.get('/auth/session'),
  logout: () => API.post('/auth/logout')
};

// Application API
export const applicationAPI = {
  submit: (data) => API.post('/applications/submit', data),
  getUserApplications: (userId) => API.get(`/applications/user/${userId}`),
  getById: (id) => API.get(`/applications/${id}`),
  uploadDocument: (id, formData) => API.post(`/applications/${id}/upload-document`, formData)
};

// Authority API
export const authorityAPI = {
  getDashboard: () => API.get('/authority/dashboard'),
  getPendingApplications: (params) => API.get('/authority/pending', { params }),
  review: (id, data) => API.post(`/authority/review/${id}`, data),
  forward: (id, data) => API.post(`/authority/forward/${id}`, data),
  getForwardingOptions: () => API.get('/authority/forwarding-options'),
  verifyData: (id, data) => API.post(`/authority/data-verification/${id}`, data)
};

// User API
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  getDashboard: () => API.get('/users/dashboard')
};
```

### 9.5 Component Library

#### 9.5.1 Key Components

**ApplicationCard**
```javascript
<ApplicationCard 
  application={app}
  onAction={(app) => navigate(`/authority/review/${app.applicationId}`)}
  showCurrentAuthority={true}
/>
```

**StatusTag**
```javascript
<StatusTag status="under_review" />
// Displays colored badge with status
```

**TextInput**
```javascript
<TextInput
  label="Full Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  placeholder="Enter your full name"
  required
  icon="👤"
/>
```

**SelectInput**
```javascript
<SelectInput
  label="Select Scheme"
  value={scheme}
  onChange={(e) => setScheme(e.target.value)}
  options={[
    { value: 'income', label: 'Income Certificate' },
    { value: 'residence', label: 'Residence Certificate' }
  ]}
/>
```

**FileUpload**
```javascript
<FileUpload
  label="Upload Document"
  onChange={(file) => setDocument(file)}
  accept=".pdf,.jpg,.png"
  maxSize={5} // MB
/>
```

**PrimaryButton**
```javascript
<PrimaryButton onClick={handleSubmit} loading={isLoading}>
  Submit Application
</PrimaryButton>
```

**NoData (Empty State)**
```javascript
<NoData
  message="No applications found"
  description="You haven't submitted any applications yet"
  icon="📄"
/>
```

#### 9.5.2 Layout Components

**Navbar**
- Displays user/authority info
- Profile dropdown
- Logout button
- Notifications (if any)

**Sidebar**
- Navigation menu
- Role-based menu items
- Active route highlighting

**Footer**
- Copyright info
- Links to policies
- Contact information

### 9.6 User Flows

#### 9.6.1 Applicant Registration Flow

```
1. User visits /signup
2. Enters mobile number → Clicks "Send OTP"
3. Backend sends OTP via SMS (mocked)
4. User enters OTP → Clicks "Verify"
5. Backend verifies OTP → Issues tempToken
6. User enters Aadhaar number → Clicks "Verify Aadhaar"
7. Backend sends Aadhaar OTP (mocked)
8. User enters Aadhaar OTP → Clicks "Complete Registration"
9. Backend creates user account → Returns login credentials
10. User automatically logged in → Redirected to dashboard
```

#### 9.6.2 Application Submission Flow

```
1. User logs in → Navigates to /applicant/schemes
2. Selects scheme (e.g., Income Certificate)
3. Fills application form with required details
4. Uploads supporting documents
5. Reviews application summary
6. Clicks "Submit Application"
7. Backend creates application → Status: data_verification
8. User redirected to /applicant/applications
9. Can track status in real-time
```

#### 9.6.3 Authority Review Flow

```
1. Authority logs in → Navigates to dashboard
2. Sees pending applications count
3. Clicks "Pending Approvals"
4. Views list of applications assigned to them
5. Clicks on application to review
6. Reviews application details & documents
7. Makes decision:
   - Approve → Auto-forwards to next authority
   - Reject → Application ends
   - Request Docs → Sends back to user
   - Forward → Manually forwards to specific authority
8. Adds comments → Submits decision
9. Application status updated → User notified
```

#### 9.6.4 District Collector Admin Flow

```
1. District Collector logs in
2. Dashboard shows ALL applications (admin view)
3. Can filter by:
   - Status (Pending, Accepted, Rejected, All)
   - Date range
   - Applicant name/ID
4. Clicks "All Applications" in sidebar
5. Sees complete list with current authority badges
6. Can click any application to review
7. Makes final decision (Accept/Reject)
8. If accepted → Forwards to Banking Section
9. Application marked as "accepted" → Processing complete
```

---

## 10. Deployment Guide

### 10.1 Prerequisites

- **Node.js:** v18 or higher
- **MongoDB:** v6 or higher (or MongoDB Atlas account)
- **npm:** v9 or higher
- **Git:** For version control

### 10.2 Environment Configuration

#### 10.2.1 Backend Environment Variables

Create `.env` file in `backend/` directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production
API_VERSION=v1

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcr_portal?retryWrites=true&w=majority
DB_NAME=pcr_portal

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-chars
SESSION_MAX_AGE=86400000

# JWT (for temporary tokens)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=10m

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY=300
OTP_MAX_ATTEMPTS=3

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key
ENCRYPTION_ALGORITHM=aes-256-cbc

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (Optional - for OTP)
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=PCPORT
```

#### 10.2.2 Frontend Environment Variables

Create `.env` file in `Frontend/` directory:

```bash
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_APP_NAME=PCR Portal
VITE_APP_VERSION=1.0.0
```

### 10.3 Local Development Setup

#### 10.3.1 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your configuration
nano .env

# Setup default authorities
node setup-authorities.js

# Start development server
npm run dev
```

Server will run on `http://localhost:3000`

#### 10.3.2 Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 10.4 Production Deployment

#### 10.4.1 Backend Deployment (Node.js Server)

**Option 1: Traditional Server (VPS/Dedicated)**

```bash
# On server
git clone https://github.com/your-repo/pcr-portal.git
cd pcr-portal/backend

# Install dependencies
npm install --production

# Setup environment
nano .env # Configure production settings

# Setup authorities
node setup-authorities.js

# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start index.js --name pcr-backend

# Setup PM2 to start on boot
pm2 startup
pm2 save

# Monitor logs
pm2 logs pcr-backend
```

**Option 2: Docker**

Create `Dockerfile` in backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

Build and run:

```bash
docker build -t pcr-backend .
docker run -d -p 3000:3000 --env-file .env pcr-backend
```

**Option 3: Cloud Platforms**

- **Heroku:** `git push heroku main`
- **Railway:** Connect GitHub repo
- **Render:** Connect GitHub repo
- **AWS Elastic Beanstalk:** Deploy via EB CLI

#### 10.4.2 Frontend Deployment

**Build for Production:**

```bash
cd Frontend

# Build
npm run build

# Output in dist/ directory
```

**Option 1: Static Hosting (Netlify/Vercel)**

```bash
# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod
```

**Option 2: Traditional Server (Nginx)**

```bash
# Copy build files to server
scp -r dist/* user@server:/var/www/pcr-portal/

# Nginx configuration
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/pcr-portal;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Option 3: Docker**

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 10.5 Database Setup

#### 10.5.1 MongoDB Atlas (Recommended)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Create database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Update `MONGODB_URI` in `.env`

#### 10.5.2 Self-Hosted MongoDB

```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Create database and user
mongo
> use pcr_portal
> db.createUser({
    user: "pcr_admin",
    pwd: "secure_password",
    roles: ["readWrite", "dbAdmin"]
  })
```

### 10.6 Security Checklist

✅ **Pre-Deployment:**
- [ ] Change all default passwords
- [ ] Use strong SESSION_SECRET and JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with specific origins
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Disable console.log in production
- [ ] Set up proper error handling
- [ ] Enable rate limiting

✅ **Post-Deployment:**
- [ ] Monitor server logs
- [ ] Set up automated backups
- [ ] Configure firewall rules
- [ ] Set up monitoring (UptimeRobot, New Relic)
- [ ] Enable database encryption at rest
- [ ] Set up SSL/TLS for MongoDB connection
- [ ] Configure CDN for static assets
- [ ] Set up log rotation
- [ ] Enable 2FA for admin accounts

### 10.7 Monitoring & Maintenance

#### 10.7.1 Logging

**Backend Logging:**
```javascript
// Use Winston or Morgan
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

#### 10.7.2 Performance Monitoring

- **Backend:** PM2 monitoring, New Relic, Datadog
- **Frontend:** Google Analytics, Sentry (error tracking)
- **Database:** MongoDB Atlas monitoring

#### 10.7.3 Backup Strategy

**Automated MongoDB Backups:**
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="pcr_portal"

mongodump --uri="mongodb+srv://..." --db=$DB_NAME --out=$BACKUP_DIR/$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

**Cron job:**
```bash
0 2 * * * /path/to/backup-mongodb.sh
```

---

## 11. Troubleshooting

### 11.1 Common Issues

#### Issue: "CORS Error" in Frontend

**Symptom:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
1. Check backend CORS configuration in `index.js`
2. Ensure `withCredentials: true` in frontend API client
3. Verify `CORS_ORIGIN` includes frontend URL
4. Check if credentials are allowed: `credentials: true` in CORS config

#### Issue: "Session not found" or "Unauthorized"

**Symptom:**
- User logged out unexpectedly
- API returns 401 Unauthorized

**Solution:**
1. Check if MongoDB session store is connected
2. Verify `SESSION_SECRET` is set correctly
3. Check cookie settings (httpOnly, secure, sameSite)
4. Clear browser cookies and localStorage
5. Verify session TTL hasn't expired

#### Issue: Applications not appearing in Authority Dashboard

**Symptom:**
- Authority logs in but sees no applications
- "No pending applications" even though applications exist

**Solution:**
1. Check `currentAuthority.designation` format (must be UPPERCASE)
2. Verify authority designation matches exactly (case-sensitive in queries)
3. Check application status (only shows pending by default)
4. For District Collector, ensure `isAdmin` flag is set
5. Run database query to inspect:
```javascript
db.applications.find({ 
  'currentAuthority.designation': 'TEHSILDAR_CP_ZONE' 
})
```

#### Issue: Auto-forwarding not working

**Symptom:**
- Application approved but not forwarded to next authority
- Processing chain shows approval but no forwarding

**Solution:**
1. Check forwarding rules in `authorityController.js`
2. Ensure designations are UPPERCASE in rules object
3. Verify `forwardTo()` method normalizes target designation
4. Check if `reviewApplication()` calls forwarding after approval
5. Inspect processing chain for forwarding action

#### Issue: Reports page showing "No data"

**Symptom:**
- Dashboard shows applications but Reports page is empty
- Status charts not rendering

**Solution:**
1. Check if `byStatus` is array vs object mismatch
2. Verify API response structure in browser console
3. Ensure Reports page converts array to object for rendering
4. Check if `status: 'all'` parameter is passed to API
5. Inspect network tab for API response format

#### Issue: OTP not working

**Symptom:**
- OTP not received
- OTP verification fails

**Solution:**
1. Check OTP expiry time (default 5 minutes)
2. Verify OTP stored in session/memory (mock implementation)
3. Check console logs for generated OTP (development)
4. Ensure mobile number format is correct (+91XXXXXXXXXX)
5. For production, configure SMS gateway API

#### Issue: File upload fails

**Symptom:**
- Document upload returns error
- "File too large" error

**Solution:**
1. Check Express body parser limits: `express.json({ limit: '10mb' })`
2. Verify file size in frontend validation
3. Check file type restrictions
4. Ensure multipart/form-data encoding
5. Check server disk space

### 11.2 Debug Mode

**Enable Debug Logging:**

Backend:
```javascript
// In index.js
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('📝 Request:', req.method, req.path, req.body);
    next();
  });
}
```

Frontend:
```javascript
// In api.js
API.interceptors.request.use(config => {
  console.log('🔵 API Request:', config.method, config.url, config.data);
  return config;
});

API.interceptors.response.use(
  response => {
    console.log('🟢 API Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('🔴 API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);
```

### 11.3 Database Queries for Debugging

**Check all applications:**
```javascript
db.applications.find({}).pretty()
```

**Check applications by status:**
```javascript
db.applications.find({ status: 'under_review' }).pretty()
```

**Check applications by authority:**
```javascript
db.applications.find({ 
  'currentAuthority.designation': 'TEHSILDAR_CP_ZONE' 
}).pretty()
```

**Check processing chain:**
```javascript
db.applications.find({}, { 
  applicationId: 1, 
  status: 1, 
  processingChain: 1 
}).pretty()
```

**Check authorities:**
```javascript
db.authorities.find({}, { 
  designation: 1, 
  accessLevel: 1, 
  isActive: 1 
}).pretty()
```

**Check sessions:**
```javascript
db.sessions.find({}).pretty()
```

### 11.4 Performance Optimization

**Backend:**
- Add database indexes on frequently queried fields
- Use aggregation pipelines for complex queries
- Enable MongoDB query profiling
- Implement caching with Redis
- Use connection pooling

**Frontend:**
- Code splitting with React.lazy()
- Optimize images (compress, WebP format)
- Use virtual scrolling for long lists
- Implement pagination
- Cache API responses
- Use CDN for static assets

### 11.5 Getting Help

**Documentation:**
- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Vite Docs: https://vitejs.dev

**Community:**
- Stack Overflow: Tag with `mern`, `mongodb`, `express`, `react`
- GitHub Issues: Report bugs in project repository
- Discord/Slack: Join MERN stack communities

---

## 12. API Error Codes

| Code | Error | Description | Solution |
|------|-------|-------------|----------|
| 400 | Bad Request | Invalid request data | Check request payload format |
| 401 | Unauthorized | Not authenticated | Login required |
| 403 | Forbidden | Insufficient permissions | Check user role |
| 404 | Not Found | Resource not found | Verify ID/route |
| 409 | Conflict | Duplicate entry | Check unique fields |
| 422 | Unprocessable Entity | Validation failed | Check required fields |
| 429 | Too Many Requests | Rate limit exceeded | Wait and retry |
| 500 | Internal Server Error | Server error | Check logs |
| 503 | Service Unavailable | Database/service down | Check connections |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **Aadhaar** | 12-digit unique identity number issued by Government of India |
| **Authority** | Government official with power to review and approve applications |
| **Application** | Request submitted by user for a certificate |
| **Data Verification** | Initial check of application completeness by Data Entry Operator |
| **Escalation** | Forwarding application to higher authority level |
| **Forwarding** | Transferring application to another authority |
| **OTP** | One-Time Password for verification |
| **Processing Chain** | History of all actions taken on an application |
| **Session** | Server-side storage of user authentication state |
| **Status** | Current state of application (e.g., under_review, approved) |
| **Tehsildar** | Revenue officer at tehsil/taluka level |
| **Temptoken** | Temporary JWT token used during registration |
| **District Collector** | Chief administrative officer of a district |

---

## 14. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-10-14 | Initial release |
| | | - Multi-step registration |
| | | - Authority hierarchy system |
| | | - Auto-forwarding on approve |
| | | - District Collector admin view |
| | | - Status filtering |
| | | - Reports & analytics |

---

## 15. License

This project is proprietary software. All rights reserved.

---

## 16. Contributors

- **Backend Development:** Node.js, Express, MongoDB
- **Frontend Development:** React, Vite, React Router
- **Authentication:** JWT, bcrypt, session management
- **Database Design:** MongoDB schema design
- **API Design:** RESTful API architecture

---

**End of System Documentation**

For questions or support, contact: [your-email@domain.com]

Last Updated: October 14, 2025
