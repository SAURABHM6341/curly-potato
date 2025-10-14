# 🏛️ PCR Portal - Protection of Civil Rights Portal

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-61DAFB.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)

**A comprehensive MERN stack application for Direct Benefit Transfer (DBT) under PCR/PoA Scheme**

[Features](#-features) •
[Quick Start](#-quick-start) •
[Documentation](#-documentation) •
[API Reference](#-api-reference) •
[Contributing](#-contributing)

</div>

---

## 📖 Overview

The **PCR Portal** is a full-stack web application built on the MERN stack that implements Direct Benefit Transfer (DBT) under the Protection of Civil Rights (PCR) Act, 1955 and the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989. It facilitates timely delivery of relief and assistance to victims of caste-based discrimination and atrocities, ensuring transparency, accountability, and efficient fund disbursement.

### 🎯 Problem Statement

The Protection of Civil Rights (PCR) Act, 1955 and the Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989 are landmark legislations aimed at ensuring justice and dignity for historically marginalized communities. However, the current implementation faces several challenges:

- ❌ **Manual Process** - Disbursement of monetary reliefs is largely manual and time-consuming
- ❌ **Procedural Delays** - Manual processes are prone to delays and misallocation of funds
- ❌ **Lack of Transparency** - No real-time tracking of fund sanction and disbursement
- ❌ **Data Security Issues** - Privacy and security concerns for victim data
- ❌ **Limited Accessibility** - Difficulty for beneficiaries in remote, rural, and tribal areas
- ❌ **No Integration** - Lack of integration with national databases (Aadhaar, DigiLocker, eCourts, CCTNS)

### ✅ Our Solution

PCR Portal provides a smart, tech-enabled solution for effective DBT implementation:

- ✅ **Digital DBT System** - Complete digitization of benefit transfer process
- ✅ **Victim Verification** - Accurate identification and verification of victims
- ✅ **Real-Time Tracking** - Track sanction, disbursement, and utilization of funds
- ✅ **Data Security** - Robust privacy and security measures for victim data
- ✅ **Transparency & Accountability** - Complete transparency in financial assistance transfer
- ✅ **National Database Integration** - Seamless integration with Aadhaar, DigiLocker, eCourts, CCTNS
- ✅ **Grievance Redressal** - Comprehensive feedback and complaint management system

---

## ✨ Features

### For Victims/Beneficiaries

- 📱 **Secure Registration**
  - Mobile OTP verification
  - Aadhaar authentication with victim privacy protection
  - Secure profile creation

- � **Relief & Assistance Management**
  - Apply for monetary relief under PCR/PoA Acts
  - Apply for inter-caste marriage incentives
  - Upload supporting documents securely
  - Track relief status in real-time
  - View complete processing and disbursement history

- 🔔 **Notifications & Updates**
  - Real-time status updates on relief applications
  - Document request alerts
  - Disbursement notifications
  - Grievance status updates

- 📱 **Grievance Redressal**
  - Submit complaints and feedback
  - Track grievance resolution
  - Direct communication with authorities

### For Authorities

- 🏢 **Hierarchical Processing**
  - **District Authorities:** Initial verification and processing
  - **Social Welfare Departments:** Review and approval
  - **Financial Institutions:** Fund disbursement
  - **State/UT Administration:** Oversight and monitoring

- ⚡ **Smart DBT Workflows**
  - Victim identification and verification
  - Auto-calculation of relief amounts as per Act provisions
  - Real-time fund tracking
  - Automated disbursement triggers
  - Integration with banking systems

- 📊 **Comprehensive Dashboard**
  - Real-time DBT statistics
  - Fund utilization analytics
  - Victim demographics and case analysis
  - Performance metrics across departments
  - Compliance monitoring

- 🔍 **Administrative Controls**
  - Monitor all relief applications
  - Track fund allocation and disbursement
  - Generate compliance reports
  - Audit trail for all transactions
  - Integration with CCTNS for case tracking

### System Integration

- 🔗 **National Database Integration**
  - **Aadhaar:** Victim identity verification
  - **DigiLocker:** Document verification
  - **eCourts:** Case status integration
  - **CCTNS:** Crime tracking integration
  - **Banking APIs:** Direct fund transfer

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
| District Magistrate | `DISTRICT_MAGISTRATE` | `password123` | District Authority |
| Social Welfare Officer | `SOCIAL_WELFARE_OFFICER` | `password123` | Relief Review |
| Financial Institution | `FINANCIAL_INSTITUTION` | `password123` | DBT Processing |
| State Administrator | `STATE_ADMINISTRATOR` | `password123` | Monitoring |

⚠️ **Important:** Change these passwords in production!

### Victims/Beneficiaries

- Register through the signup flow with mobile OTP
- Identity verification through Aadhaar (with privacy protection)
- Login credentials provided after successful verification

---

## 🎯 Usage Examples

### Victim Registration Flow

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

// 3. Initiate Aadhaar Verification (with privacy protection)
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
  "aadhaarData": { ... },
  "victimDetails": { ... }
}
// Returns: { user: {...}, loginCredentials: {...} }
```

### Apply for Relief/Assistance

```javascript
POST /api/relief/apply
{
  "reliefType": "monetary_relief", // or "inter_caste_marriage"
  "caseDetails": {
    "crimeType": "atrocity_under_poa_act",
    "firNumber": "FIR/2024/123",
    "policeStation": "Central Police Station",
    "incidentDate": "2024-01-15"
  },
  "documents": [
    {
      "type": "fir_copy",
      "status": "submitted"
    },
    {
      "type": "medical_certificate",
      "status": "submitted"
    }
  ],
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "accountHolder": "Victim Name"
  }
}
```

### Authority Review & DBT Processing

```javascript
// Verify and Approve Relief
POST /api/authority/review-relief/:applicationId
{
  "action": "approve",
  "reliefAmount": 50000,
  "comments": "Case verified, relief approved as per PCR Act provisions",
  "disbursementSchedule": "immediate"
}

// Initiate DBT
POST /api/dbt/initiate/:applicationId
{
  "amount": 50000,
  "beneficiaryAccount": "1234567890",
  "purpose": "Relief under PCR Act - Case FIR/2024/123"
}
// Auto-transfers funds and updates tracking
```

---

## 🔄 Relief & DBT Workflow

```
Victim Applies for Relief
         ↓
District Authority (Initial Verification)
├─ Verify victim identity (Aadhaar + case details)
├─ Validate supporting documents (FIR, medical reports, etc.)
├─ If Complete → Forward to Social Welfare Department
└─ If Incomplete → Request additional documents
         ↓
Social Welfare Department (Review & Approval)
├─ Review case as per PCR/PoA Act provisions
├─ Calculate relief amount based on Act guidelines
├─ If Approve → Forward to Financial Institution
└─ If Reject → Notify victim with reasons
         ↓
Financial Institution (DBT Processing)
├─ Validate beneficiary bank details
├─ Initiate Direct Benefit Transfer (DBT)
├─ If Success → Update disbursement status
└─ If Failed → Retry or manual intervention
         ↓
State/UT Administration (Monitoring)
├─ Monitor fund utilization
├─ Generate compliance reports
├─ Track overall scheme performance
└─ Update central government dashboard
         ↓
Relief Disbursed to Victim
```

### Inter-Caste Marriage Incentive Flow

```
Couple Applies for Incentive
         ↓
District Authority
├─ Verify marriage certificate
├─ Validate caste certificates
├─ Check eligibility criteria
└─ Forward if eligible
         ↓
Social Welfare Department
├─ Final verification
├─ Approve incentive amount
└─ Initiate DBT
         ↓
Financial Institution
└─ Disburse incentive to couple's account
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

- [ ] Victim registration flow (Mobile OTP → Aadhaar)
- [ ] Victim login (OTP and Password methods)
- [ ] Authority login
- [ ] Relief application submission
- [ ] Document upload (FIR, medical certificates, etc.)
- [ ] Victim identity verification
- [ ] Relief review and approval
- [ ] DBT initiation and processing
- [ ] Real-time fund tracking
- [ ] Grievance submission and tracking
- [ ] Inter-caste marriage incentive application
- [ ] Integration with national databases
- [ ] Reports generation
- [ ] Admin dashboard (monitoring view)

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

### Relief & DBT Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/relief/apply` | Apply for relief/assistance |
| GET | `/relief/victim/:victimId` | Get victim's relief applications |
| GET | `/relief/:id` | Get relief application details |
| POST | `/relief/:id/upload-document` | Upload supporting documents |

### DBT Processing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/dbt/initiate/:applicationId` | Initiate direct benefit transfer |
| GET | `/dbt/status/:transactionId` | Get DBT transaction status |
| GET | `/dbt/track/:applicationId` | Track fund disbursement |
| POST | `/dbt/callback` | Bank callback for transaction status |

### Authority Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/authority/dashboard` | Get dashboard with DBT statistics |
| GET | `/authority/pending-relief` | Get pending relief applications |
| POST | `/authority/review-relief/:id` | Review relief application |
| POST | `/authority/approve-dbt/:id` | Approve DBT transfer |
| GET | `/authority/fund-utilization` | Get fund utilization reports |

### Grievance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/grievance/submit` | Submit new grievance |
| GET | `/grievance/victim/:victimId` | Get victim's grievances |
| GET | `/grievance/:id` | Get grievance details |
| POST | `/grievance/:id/respond` | Authority response to grievance |

### Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/integration/aadhaar/verify` | Aadhaar verification with privacy |
| GET | `/integration/digilocker/documents` | Fetch documents from DigiLocker |
| GET | `/integration/ecourts/case/:caseId` | Get case details from eCourts |
| GET | `/integration/cctns/fir/:firNumber` | Get FIR details from CCTNS |

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

- [ ] Real-time SMS notifications for DBT status
- [ ] Email notifications for relief application updates
- [ ] Enhanced integration with more banks for DBT
- [ ] Digital signature for relief certificates
- [ ] Mobile app for victims (React Native)
- [ ] Advanced analytics for fund utilization
- [ ] Integration with more state databases
- [ ] Automated compliance reporting
- [ ] Export relief data to Excel/CSV
- [ ] Enhanced audit log system
- [ ] Multi-language support for regional languages

### Version 2.0.0 (Future)

- [ ] AI-powered fraud detection for relief claims
- [ ] Blockchain for transparent fund tracking
- [ ] Biometric authentication for victims
- [ ] Video call verification for remote areas
- [ ] Chatbot support for grievance queries
- [ ] Integration with Jan Aushadhi for medical relief
- [ ] Predictive analytics for case outcomes
- [ ] Real-time crime pattern analysis
- [ ] Advanced victim protection measures
- [ ] Integration with more national databases (PFMS, DBT Portal)

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

### Legal Framework

This solution is built to support the implementation of:
- **Protection of Civil Rights (PCR) Act, 1955** - Ensuring justice for marginalized communities
- **Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989** - Preventing atrocities and providing relief

### Technologies Used

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool

### National Integration Partners

- **Aadhaar (UIDAI)** - Identity verification with privacy protection
- **DigiLocker** - Document verification and storage
- **eCourts** - Case status and legal proceedings
- **CCTNS** - Crime tracking and FIR integration
- **Banking APIs** - Direct Benefit Transfer implementation

### Inspiration

This project was inspired by the need to digitize relief and assistance under the PCR and PoA Acts, ensuring timely delivery of justice and support to victims of caste-based discrimination and atrocities.

---

## 📞 Contact & Support

### For Technical Issues

- 📧 **Email:** saurabhmishra6341@gmail.com
- 💬 **GitHub Issues:** [Create an issue](https://github.com/SAURABHM6341/curly-potato/issues)

### For Relief & Assistance Queries

- 🌐 **Website:** https://pcr-portal.gov.in
- 📱 **Helpline:** 1800-XXX-XXXX (PCR Relief Helpline)
- 📧 **Grievance Email:** grievance@pcr-portal.gov.in

### Legal Support

- 📞 **National SC/ST Helpline:** 1800-180-6127
- 🏛️ **National Commission for SC:** ncsc.gov.in
- 🏛️ **National Commission for ST:** ncst.gov.in

---

## 📊 Statistics

![GitHub Stars](https://img.shields.io/github/stars/abhishukla0204/curly-potato?style=social)
![GitHub Forks](https://img.shields.io/github/forks/abhishukla0204/curly-potato?style=social)
![GitHub Issues](https://img.shields.io/github/issues/abhishukla0204/curly-potato)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/abhishukla0204/curly-potato)

---

<div align="center">

**Made with ❤️ by Team VOID**

[⬆ Back to Top](#-pcr-portal---public-certificate-request-portal)

</div>
