# 🏛️ Government Portal - Frontend

> A modern, full-featured React frontend for the Government Application Processing System

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Overview

A production-ready government portal frontend built with **React 19**, **Vite**, and **custom CSS**. Features role-based access control, dynamic form generation, document management, and a complete application processing workflow.

### **Key Features**

✨ **100% Custom CSS** - No UI libraries, complete design control  
🔐 **Multi-Step Authentication** - Mobile + Aadhaar OTP verification  
📋 **Dynamic Forms** - Scheme-based form generation  
📊 **Role-Based Dashboards** - Applicant & Authority views  
🎨 **Government Design System** - Professional, accessible UI  
📱 **Fully Responsive** - Mobile-first approach  
⚡ **Production Ready** - Error handling, loading states, validation  

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:5173
```

**See [QUICK_START.md](QUICK_START.md) for detailed setup instructions.**

---

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Alerts/         # Toast notifications
│   │   ├── Button/         # Button variants
│   │   ├── Cards/          # Status tags, Application/Document cards
│   │   ├── EmptyState/     # No data states
│   │   ├── Input/          # Form inputs (Text, OTP, File, Select)
│   │   ├── Layout/         # Navbar, Sidebar, Footer
│   │   ├── Loader/         # Spinner component
│   │   └── Modal/          # Confirmation modals
│   │
│   ├── context/            # Global state management
│   │   └── AuthContext.jsx # Authentication state
│   │
│   ├── data/               # Static data
│   │   └── schemes.js      # Government schemes (5 schemes)
│   │
│   ├── pages/              # Application pages
│   │   ├── Auth/           # Login, Signup, OTP Verify
│   │   ├── Applicant/      # Dashboard, Schemes, Applications, Track
│   │   ├── Authority/      # Dashboard, Pending, Review
│   │   └── NotFound.jsx    # 404 page
│   │
│   ├── utils/              # Utilities
│   │   ├── api.js          # API integration (Axios)
│   │   ├── constants.js    # App constants
│   │   └── useFetch.js     # Custom hook
│   │
│   ├── App.jsx             # Main app with routing
│   ├── App.css             # Global app styles
│   ├── index.css           # CSS reset & variables
│   └── main.jsx            # React entry point
│
├── public/                 # Static assets
├── .env                    # Environment config
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
│
└── Documentation/
    ├── QUICK_START.md      # Quick setup guide
    ├── BUILD_SUMMARY.md    # Complete build details
    ├── FRONTEND_GUIDE.md   # Development guide
    └── IMPLEMENTATION_ROADMAP.md  # Feature roadmap
```

---

## 🎨 Design System

### **Colors**
- **Primary:** `#0056D2` (Government Blue)
- **Success:** `#0F9D58` (Green)
- **Warning:** `#F4B400` (Yellow)
- **Error:** `#D93025` (Red)
- **Text:** `#000000` / `#5F6368`
- **Background:** `#F5F6F7`

### **Typography**
- **Font:** Inter
- **Base Size:** 14px
- **Scale:** 12px → 14px → 16px → 18px → 20px → 24px → 32px

### **Spacing**
- **Scale:** 4px base (4, 8, 12, 16, 20, 24, 32, 48, 64)
- **Border Radius:** 6px, 8px, 12px, 16px

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 5173)

# Production
npm run build            # Create production build
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
```

---

## 📱 Application Features

### **1. Authentication System**

#### **Login Page** (`/login`)
- Dual-tab interface (Password / OTP)
- Session-based authentication
- Remember me functionality
- Role-based redirect

#### **Signup Wizard** (`/signup`)
- **Step 1:** Mobile number entry
- **Step 2:** Mobile OTP verification
- **Step 3:** Aadhaar number entry
- **Step 4:** Aadhaar OTP verification
- Auto-generated credentials with copy-to-clipboard

#### **OTP Verification** (`/verify-otp`)
- 6-digit auto-focus input
- Paste support
- 30-second resend timer
- Session validation

---

### **2. Applicant Portal**

#### **Dashboard** (`/applicant/dashboard`)
- Application statistics
- Quick action buttons
- Recent applications list
- Empty state handling

#### **Scheme List** (`/applicant/schemes`)
- Browse available schemes
- Search functionality
- Category filters
- Scheme details cards

#### **Scheme Form** (`/applicant/schemes/:id`)
- Dynamic form generation
- Field validation
- Required documents list
- Multi-field types support

#### **My Applications** (`/applicant/applications`)
- View all applications
- Filter by status
- Search by ID/scheme
- Statistics overview

#### **Track Status** (`/applicant/applications/:id`)
- Visual timeline
- Application details
- Document status
- Authority comments

---

### **3. Authority Portal**

#### **Dashboard** (`/authority/dashboard`)
- Pending applications count
- Review statistics
- Quick actions
- Authority details

#### **Pending Approvals** (`/authority/pending`)
- List pending applications
- Sort by date/urgency
- Search functionality
- Quick review access

#### **Review Application** (`/authority/review/:id`)
- Complete application view
- Document verification
- Approve/Reject/Forward actions
- Add review comments
- Forward to higher authority

---

## 🔐 Authentication Flow

```
1. User enters credentials (Login page)
   ↓
2. Backend validates and creates session
   ↓
3. Session cookie stored in browser
   ↓
4. AuthContext updates user state
   ↓
5. User redirected to role-based dashboard
   ↓
6. Protected routes check user role
   ↓
7. Authorized access granted
```

---

## 📦 Dependencies

### **Core**
- `react` (19.1.1) - UI library
- `react-dom` (19.1.1) - React DOM renderer
- `react-router-dom` (6.22.0) - Routing

### **HTTP & Data**
- `axios` (1.6.7) - HTTP client

### **Development**
- `vite` (7.1.7) - Build tool
- `@vitejs/plugin-react` (4.3.4) - Vite React plugin
- `eslint` (9.17.0) - Linting

---

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 3 minutes
- **[BUILD_SUMMARY.md](BUILD_SUMMARY.md)** - Complete build details
- **[FRONTEND_GUIDE.md](FRONTEND_GUIDE.md)** - Development guide
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - Feature roadmap

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, Vite, and Custom CSS**
