# 🏛️ PCR Portal - Public Certificate Request Portal

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-61DAFB.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)

**A comprehensive MERN stack application for government certificate application and processing**

[Features](#-features) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[API Reference](#-api-reference) •
[Contributing](#-contributing)

</div>

---

## 📖 Overview

The **PCR Portal** is a full-stack web application built on the MERN stack that digitizes and streamlines the process of applying for government certificates. It features a robust multi-step user registration system with Aadhaar verification, hierarchical authority management, and real-time application tracking.

### 🎯 Problem Statement

Traditional government certificate application processes involve:
- ❌ Multiple physical visits to government offices
- ❌ Manual document verification at each level
- ❌ Lack of transparency in application status
- ❌ Slow processing due to paper-based workflows
- ❌ No centralized tracking system

### ✅ Our Solution

PCR Portal provides:
- ✅ **100% Digital Process** - Apply from anywhere, anytime
- ✅ **Aadhaar Integration** - Secure identity verification
- ✅ **Hierarchical Processing** - Automated workflow through authority levels
- ✅ **Real-Time Tracking** - Know your application status instantly
- ✅ **Document Management** - Upload and verify documents digitally
- ✅ **Admin Dashboard** - Complete oversight for district administrators

---

## ✨ Features

### For Applicants

- 📱 **Multi-Step Registration**
  - Mobile OTP verification
  - Aadhaar authentication
  - Automated account creation

- 📝 **Application Management**
  - Apply for multiple certificate types (Income, Residence, Caste, Character)
  - Upload supporting documents
  - Track application status in real-time
  - View complete processing history

- 🔔 **Notifications**
  - Real-time status updates
  - Document request alerts
  - Approval/rejection notifications

### For Authorities

- 🏢 **Hierarchical Processing**
  - **Level 1 (Data Entry):** Verify data completeness
  - **Level 3 (Tehsildar):** Review and approve/reject
  - **Level 4 (Assistant Collector):** Second-level review
  - **Level 5 (District Collector):** Final approval authority

- ⚡ **Smart Workflows**
  - Auto-forwarding on approval
  - Manual forwarding options
  - Document request capability
  - Application hold/resume

- 📊 **Analytics Dashboard**
  - Real-time statistics
  - Performance metrics
  - Status distribution charts
  - Processing time analytics

- 🔍 **Admin View** (District Collector)
  - See ALL applications across jurisdiction
  - Filter by status, date, applicant
  - Export reports
  - Monitor authority performance

---

## 🛠️ Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **Express.js** | 5.1.0 | Web framework |
| **MongoDB** | 8.x | NoSQL database |
| **Mongoose** | 8.19.1 | ODM for MongoDB |
| **Express Session** | 1.18.2 | Session management |
| **bcryptjs** | 3.0.2 | Password hashing |
| **JWT** | 9.0.2 | Token generation |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library |
| **React Router** | 6.22.0 | Client-side routing |
| **Axios** | 1.6.7 | HTTP client |
| **Vite** | 7.1.7 | Build tool |

### DevOps & Tools

- **MongoDB Atlas** - Cloud database
- **PM2** - Process manager
- **Nginx** - Reverse proxy
- **Git** - Version control

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

```bash
node -v  # v18.0.0 or higher
npm -v   # v9.0.0 or higher
```

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/abhishukla0204/curly-potato.git
cd curly-potato
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Setup default authorities
node setup-authorities.js

# Start development server
npm run dev
```

Backend will run on **http://localhost:3000**

#### 3. Frontend Setup

```bash
# Navigate to frontend
cd ../Frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_BASE_URL=http://localhost:3000/api" > .env

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Server
PORT=3000
NODE_ENV=development
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/pcr_portal
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pcr_portal

# Session
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
SESSION_MAX_AGE=86400000

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=10m

# OTP
OTP_LENGTH=6
OTP_EXPIRY=300
OTP_MAX_ATTEMPTS=3

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key!!!
ENCRYPTION_ALGORITHM=aes-256-cbc

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend Environment Variables

Create a `.env` file in the `Frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=PCR Portal
VITE_APP_VERSION=1.0.0
```

---

## 🗂️ Project Structure

```
curly-potato/
├── backend/                    # Backend (Node.js + Express)
│   ├── config/                 # Configuration files
│   │   ├── database.js        # MongoDB connection
│   │   └── index.js           # App config
│   ├── controllers/           # Business logic
│   │   ├── authController.js  # Authentication
│   │   ├── userController.js  # User management
│   │   ├── authorityController.js
│   │   └── applicationController.js
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.js  # Auth verification
│   │   └── sessionAuth.js     # Session validation
│   ├── models/                # Mongoose schemas
│   │   ├── User.js           # User model
│   │   ├── Authority.js      # Authority model
│   │   └── Application.js    # Application model
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── authority.js
│   │   └── applications.js
│   ├── utils/                 # Utility functions
│   │   ├── cryptoManager.js  # Encryption
│   │   ├── jwtManager.js     # JWT handling
│   │   └── otpManager.js     # OTP generation
│   ├── index.js              # Entry point
│   ├── setup-authorities.js  # Authority setup script
│   └── package.json
│
├── Frontend/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── assets/           # Images, icons
│   │   ├── components/       # Reusable components
│   │   │   ├── Alerts/       # Toast notifications
│   │   │   ├── Button/       # Button components
│   │   │   ├── Cards/        # Card components
│   │   │   ├── Input/        # Form inputs
│   │   │   ├── Layout/       # Layout components
│   │   │   └── Loader/       # Loading states
│   │   ├── context/          # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── data/             # Static data
│   │   │   └── schemes.js    # Certificate schemes
│   │   ├── pages/            # Page components
│   │   │   ├── Applicant/    # Applicant pages
│   │   │   ├── Authority/    # Authority pages
│   │   │   └── Auth/         # Auth pages
│   │   ├── utils/            # Utilities
│   │   │   ├── api.js        # API client
│   │   │   └── constants.js  # Constants
│   │   ├── App.jsx          # Main app
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── SYSTEM_DOCUMENTATION.md    # Complete system docs
├── SYSTEM_DOCUMENTATION_PART2.md
├── README.md                  # This file
└── LICENSE
```

---

## 📚 Documentation

Comprehensive documentation is available:

- **[System Documentation](./SYSTEM_DOCUMENTATION.md)** - Complete technical documentation
  - Architecture overview
  - Database schemas
  - API reference
  - Security features
  - Deployment guide

- **[System Documentation Part 2](./SYSTEM_DOCUMENTATION_PART2.md)** - Extended documentation
  - Frontend architecture
  - Component library
  - User flows
  - Troubleshooting
  - Performance optimization

---

## 🔐 Default Login Credentials

### Authorities

After running `setup-authorities.js`, use these credentials:

| Authority | Designation | Password | Access Level |
|-----------|-------------|----------|--------------|
| Data Entry Operator | `DATA_ENTRY_OPERATOR` | `password123` | Level 1 |
| Tehsildar | `TEHSILDAR_CP_ZONE` | `password123` | Level 3 |
| Assistant Collector | `ASSISTANT_COLLECTOR_NORTH` | `password123` | Level 4 |
| District Collector | `DISTRICT_COLLECTOR_DELHI` | `password123` | Level 5 |

⚠️ **Important:** Change these passwords in production!

### Applicants

- Register through the signup flow
- Login credentials will be provided after Aadhaar verification

---

## 🎯 Usage Examples

### User Registration Flow

```javascript
// 1. Request Mobile OTP
POST /api/auth/request-mobile-otp
{
  "mobile": "+919876543210"
}

// 2. Verify Mobile OTP
POST /api/auth/verify-mobile-otp
{
  "mobile": "+919876543210",
  "otp": "123456"
}
// Returns: { tempToken: "..." }

// 3. Initiate Aadhaar Verification
POST /api/auth/aadhaar/initiate
Headers: { Authorization: "Bearer <tempToken>" }
{
  "aadhaarNumber": "123456789012"
}

// 4. Complete Registration
POST /api/auth/aadhaar/verify
{
  "transactionId": "...",
  "otp": "123456",
  "aadhaarData": { ... }
}
// Returns: { user: {...}, loginCredentials: {...} }
```

### Submit Application

```javascript
POST /api/applications/submit
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

### Authority Review

```javascript
// Approve Application
POST /api/authority/review/:applicationId
{
  "action": "approve",
  "comments": "Application verified and approved"
}

// Auto-forwards to next authority level
```

---

## 🔄 Application Workflow

```
User Submits Application
         ↓
Data Entry Operator (Level 1)
├─ Verify completeness
├─ If Complete → Auto-forward to Tehsildar
└─ If Incomplete → Send back to user
         ↓
Tehsildar (Level 3)
├─ Review application
├─ If Approve → Auto-forward to Assistant Collector
└─ If Reject → End process
         ↓
Assistant Collector (Level 4)
├─ Second-level review
├─ If Approve → Auto-forward to District Collector
└─ If Reject → End process
         ↓
District Collector (Level 5)
├─ Final approval
├─ If Accept → Forward to Banking Section
└─ If Reject → End process
         ↓
Banking Section
└─ Certificate issued
```

---

## 🧪 Testing

### Backend API Testing

```bash
# Install dev dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

### Frontend Testing

```bash
# Install testing library
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

### Manual Testing Checklist

- [ ] User registration flow (Mobile OTP → Aadhaar)
- [ ] User login (OTP and Password methods)
- [ ] Authority login
- [ ] Application submission
- [ ] Document upload
- [ ] Data verification (Level 1)
- [ ] Application review (Level 3, 4, 5)
- [ ] Auto-forwarding on approve
- [ ] Status tracking
- [ ] Reports generation
- [ ] Admin view (District Collector)

---

## 📊 API Reference

### Base URL

```
Development: http://localhost:3000/api
Production: https://api.your-domain.com/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/request-mobile-otp` | Request OTP for mobile |
| POST | `/auth/verify-mobile-otp` | Verify mobile OTP |
| POST | `/auth/aadhaar/initiate` | Initiate Aadhaar verification |
| POST | `/auth/aadhaar/verify` | Verify Aadhaar OTP |
| POST | `/auth/login` | User login |
| POST | `/auth/verify-login-otp` | Verify login OTP |
| POST | `/auth/login-password` | Password login |
| POST | `/auth/authority/login` | Authority login |
| GET | `/auth/session` | Get session info |
| POST | `/auth/logout` | Logout |

### Application Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications/submit` | Submit new application |
| GET | `/applications/user/:userId` | Get user applications |
| GET | `/applications/:id` | Get application details |
| POST | `/applications/:id/upload-document` | Upload document |

### Authority Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/authority/dashboard` | Get dashboard data |
| GET | `/authority/pending` | Get pending applications |
| POST | `/authority/review/:id` | Review application |
| POST | `/authority/forward/:id` | Forward application |
| GET | `/authority/forwarding-options` | Get forwarding options |
| POST | `/authority/data-verification/:id` | Verify data |

For complete API documentation, see [SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md#8-api-reference)

---

## 🚢 Deployment

### Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong secrets (SESSION_SECRET, JWT_SECRET)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Set up CORS with specific origins
- [ ] Enable rate limiting
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure automated backups
- [ ] Set up error logging (Sentry)
- [ ] Enable database encryption
- [ ] Review security headers

### Quick Deploy

**Backend (PM2):**
```bash
npm install -g pm2
pm2 start index.js --name pcr-backend
pm2 startup
pm2 save
```

**Frontend (Netlify):**
```bash
npm run build
netlify deploy --prod --dir=dist
```

For detailed deployment instructions, see [SYSTEM_DOCUMENTATION_PART2.md](./SYSTEM_DOCUMENTATION_PART2.md#10-deployment-guide)

---

## 🔧 Troubleshooting

### Common Issues

#### CORS Error
```bash
# Backend: Check CORS_ORIGIN in .env
# Frontend: Ensure withCredentials: true in API client
```

#### Session Not Found
```bash
# Check MongoDB connection
# Verify SESSION_SECRET is set
# Clear browser cookies
```

#### Applications Not Showing
```bash
# Check currentAuthority.designation format (must be UPPERCASE)
# Verify authority designation matches exactly
# Check application status filter
```

For more troubleshooting tips, see [SYSTEM_DOCUMENTATION_PART2.md](./SYSTEM_DOCUMENTATION_PART2.md#11-troubleshooting)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/curly-potato.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Commit your changes**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create a Pull Request**

### Commit Message Convention

```
Type: Brief description

- Add: New feature
- Fix: Bug fix
- Update: Existing feature modification
- Refactor: Code restructuring
- Docs: Documentation changes
- Style: Code formatting
- Test: Test additions/modifications
```

### Code Style

- Use **ESLint** configuration provided
- Follow **Prettier** formatting
- Write **meaningful variable names**
- Add **JSDoc comments** for functions
- Keep functions **small and focused**

---

## 🐛 Bug Reports

Found a bug? Please report it!

1. Check if the bug is already reported in [Issues](https://github.com/abhishukla0204/curly-potato/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, Node version, browser)

---

## 💡 Feature Requests

Have an idea? We'd love to hear it!

1. Check [existing feature requests](https://github.com/abhishukla0204/curly-potato/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)
2. Create a new issue with label `enhancement`
3. Describe:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered
   - Additional context

---

## 📈 Roadmap

### Version 1.1.0 (Planned)

- [ ] Email notifications
- [ ] SMS integration for real OTP
- [ ] PDF certificate generation
- [ ] Digital signature integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Advanced analytics dashboard
- [ ] Export to Excel/CSV
- [ ] Audit log system

### Version 2.0.0 (Future)

- [ ] AI-powered document verification
- [ ] Blockchain for certificate authenticity
- [ ] Video call verification
- [ ] Biometric authentication
- [ ] Chatbot support
- [ ] Integration with other government portals

---

## 📄 License

This project is **proprietary software**. All rights reserved.

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited without explicit written permission from the copyright holder.

---

## 👥 Team

### Core Developers

- **Backend Lead:** Node.js, Express, MongoDB architecture
- **Frontend Lead:** React, UI/UX implementation
- **DevOps:** Deployment, monitoring, CI/CD
- **QA:** Testing, quality assurance

---

## 🙏 Acknowledgments

### Technologies Used

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

### Inspiration

This project was inspired by the need to digitize government services and make them more accessible to citizens.

---

## 📞 Contact & Support

### For Technical Issues

- 📧 **Email:** support@pcr-portal.gov.in
- 💬 **GitHub Issues:** [Create an issue](https://github.com/abhishukla0204/curly-potato/issues)

### For General Inquiries

- 🌐 **Website:** https://pcr-portal.gov.in
- 📱 **Helpline:** +91-XXXX-XXXXXX

---

## 📊 Statistics

![GitHub Stars](https://img.shields.io/github/stars/abhishukla0204/curly-potato?style=social)
![GitHub Forks](https://img.shields.io/github/forks/abhishukla0204/curly-potato?style=social)
![GitHub Issues](https://img.shields.io/github/issues/abhishukla0204/curly-potato)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/abhishukla0204/curly-potato)

---

<div align="center">

**Made with ❤️ for Digital India**

[⬆ Back to Top](#-pcr-portal---public-certificate-request-portal)

</div>
