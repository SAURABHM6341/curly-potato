# PCR PoA DBT Government Portal - Frontend

## 🎯 Project Status

### ✅ Completed Components
- **Utilities & Configuration**
  - API utilities with Axios interceptors
  - Constants and configuration
  - Custom hooks (useFetch)
  - AuthContext for authentication management

- **Reusable UI Components**
  - Button components (Primary, Secondary, Tag)
  - Input components (Text, OTP, File, Select)
  - Toast notifications
  - Loading spinner
  - Confirmation modal
  - Empty state component

- **Data Management**
  - Schemes data with 5 government schemes
  - Dynamic form field system

### 🚧 Remaining Components to Build

#### Layout Components
- `Navbar.jsx` - Top navigation bar
- `Sidebar.jsx` - Role-based sidebar navigation
- `Footer.jsx` - Page footer

#### Card Components
- `ApplicationCard.jsx` - Display application summary
- `DocumentCard.jsx` - Display uploaded documents
- `StatusTag.jsx` - Color-coded status badges

#### Authentication Pages
- `Login.jsx` - Main login page with tabs
- `Signup.jsx` - Multi-step signup wizard
- `OTPVerify.jsx` - OTP verification page
- `PasswordLogin.jsx` - Password login form

#### Applicant Pages
- `Dashboard.jsx` - Applicant dashboard
- `SchemeList.jsx` - Browse available schemes
- `SchemeForm.jsx` - Dynamic scheme application form
- `UploadDocuments.jsx` - Document upload interface
- `TrackStatus.jsx` - Track application status

#### Authority Pages
- `Dashboard.jsx` - Authority dashboard
- `PendingApprovals.jsx` - List of pending applications
- `ReviewApplication.jsx` - Application review interface

#### Admin Pages
- `Dashboard.jsx` - Admin dashboard
- `ManageSchemes.jsx` - Scheme management
- `ManageUsers.jsx` - User management
- `Reports.jsx` - Analytics and reports

#### Routing & Error Handling
- `App.jsx` - Main app component with routing
- `ProtectedRoute.jsx` - Route protection wrapper
- `NotFound.jsx` - 404 error page

#### Global Styles
- `App.css` - Global application styles
- `index.css` - CSS reset and design system

## 🚀 Installation

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies
npm install

# Additional packages needed
npm install react-router-dom axios

# Start development server
npm run dev
```

## 📦 Required npm Packages

Add to `package.json`:

```json
"dependencies": {
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^6.22.0",
  "axios": "^1.6.7"
}
```

## 🔧 Configuration

Create `.env` file:

```env
REACT_APP_API_BASE=http://localhost:5000
REACT_APP_ENV=development
```

## 🎨 Design System

### Colors
- **Background**: `#FFFFFF`
- **Primary Text**: `#000000`
- **Primary Blue**: `#0056D2`
- **Hover Blue**: `#0041A8`
- **Secondary Gray**: `#F5F6F7`
- **Success Green**: `#0F9D58`
- **Warning Yellow**: `#F4B400`
- **Error Red**: `#D93025`

### Typography
- **Font Family**: `'Inter', sans-serif`
- **Sizes**: 12px - 32px (4px scale)

### Spacing
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px

### Shadows
- **Light**: `0 1px 4px rgba(0,0,0,0.1)`
- **Medium**: `0 2px 8px rgba(0,0,0,0.15)`
- **Heavy**: `0 4px 12px rgba(0,0,0,0.2)`

### Border Radius
- **Standard**: `8px`
- **Large**: `12px`

## 📂 Project Structure

```
src/
├── components/          ✅ COMPLETED
│   ├── Button/
│   │   ├── PrimaryButton.jsx
│   │   ├── SecondaryButton.jsx
│   │   ├── TagButton.jsx
│   │   └── Button.css
│   ├── Input/
│   │   ├── TextInput.jsx
│   │   ├── OTPInput.jsx
│   │   ├── FileUpload.jsx
│   │   ├── SelectInput.jsx
│   │   └── Input.css
│   ├── Alerts/
│   │   ├── Toast.jsx
│   │   └── Toast.css
│   ├── Loader/
│   │   ├── Spinner.jsx
│   │   └── Spinner.css
│   ├── Modal/
│   │   ├── ConfirmModal.jsx
│   │   └── Modal.css
│   └── EmptyState/
│       ├── NoData.jsx
│       └── EmptyState.css
│
├── data/               ✅ COMPLETED
│   └── schemes.js
│
├── context/            ✅ COMPLETED
│   └── AuthContext.jsx
│
├── utils/              ✅ COMPLETED
│   ├── api.js
│   ├── constants.js
│   └── useFetch.js
│
├── pages/              🚧 TO BE BUILT
│   ├── Auth/
│   ├── Applicant/
│   ├── Authority/
│   ├── Admin/
│   └── Error/
│
├── App.jsx             🚧 TO BE BUILT
├── App.css             🚧 TO BE BUILT
└── main.jsx            ✅ EXISTS
```

## 🔐 Authentication Flow

### Session-Based (Current Backend Implementation)
1. User logs in (OTP or password)
2. Backend creates session with cookie
3. Frontend stores user data in localStorage
4. Cookie automatically sent with each request
5. No need for Authorization headers

### API Integration Example

```javascript
import { authAPI } from './utils/api';

// Login with password
const response = await authAPI.loginPassword({
  loginUserId: 'USER_123456',
  password: 'password123'
});

// Session cookie automatically stored by browser
// User data stored in context/localStorage
```

## 🛣️ Routing Structure

```
/                          → Home/Landing
/login                     → Login page
/signup                    → Signup wizard
/otp-verify                → OTP verification
/password-login            → Password login

/applicant/dashboard       → Applicant dashboard
/applicant/schemes         → Browse schemes
/applicant/schemes/:id/apply → Apply for scheme
/applicant/applications    → My applications
/applicant/documents       → Upload documents
/applicant/track           → Track status

/authority/dashboard       → Authority dashboard
/authority/pending         → Pending approvals
/authority/review/:id      → Review application

/admin/dashboard           → Admin dashboard
/admin/schemes             → Manage schemes
/admin/users               → Manage users
/admin/reports             → Reports & analytics
```

## 🎯 Next Steps for Developer

### Immediate Tasks:
1. **Install dependencies**: `npm install react-router-dom axios`
2. **Create Layout components**: Navbar, Sidebar, Footer
3. **Build Authentication pages**: Start with Login.jsx
4. **Create Card components**: For displaying data
5. **Implement routing**: Set up React Router in App.jsx
6. **Add global styles**: Create App.css with design system
7. **Build Applicant pages**: Dashboard and scheme pages
8. **Build Authority pages**: Application review interface
9. **Build Admin pages**: Management interfaces
10. **Test integration**: Connect with backend API

### Development Guidelines:
- ✅ Use existing reusable components
- ✅ Follow design system colors and spacing
- ✅ Ensure responsive design (mobile-first)
- ✅ Add proper loading states
- ✅ Implement error handling
- ✅ Use Toast notifications for feedback
- ✅ Add accessibility features (ARIA labels, keyboard nav)
- ✅ Test with real backend API

## 📝 Component Usage Examples

### Button Example
```jsx
import PrimaryButton from './components/Button/PrimaryButton';

<PrimaryButton
  onClick={handleSubmit}
  loading={isLoading}
  fullWidth
>
  Submit Application
</PrimaryButton>
```

### Input Example
```jsx
import TextInput from './components/Input/TextInput';

<TextInput
  label="Full Name"
  name="name"
  value={formData.name}
  onChange={(e) => setFormData({...formData, name: e.target.value})}
  required
  error={errors.name}
/>
```

### OTP Input Example
```jsx
import OTPInput from './components/Input/OTPInput';

<OTPInput
  value={otp}
  onChange={setOtp}
  length={6}
  error={otpError}
/>
```

### Toast Example
```jsx
import Toast from './components/Alerts/Toast';

const [toast, setToast] = useState(null);

{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}

// Show toast
setToast({ message: 'Login successful!', type: 'success' });
```

## 🔗 Backend Integration

Backend is running on: `http://localhost:5000`

### Key API Endpoints:
- **Auth**: `/auth/*`
- **User**: `/users/*`
- **Authority**: `/authority/*`

All endpoints use **session-based authentication** with **cookies**.

## 📚 Resources

- Backend Documentation: `backend/AI_AGENT_KNOWLEDGE_GUIDE.md`
- API Testing Guide: `backend/API_TESTING_GUIDE.md`
- React Router Docs: https://reactrouter.com
- Axios Docs: https://axios-http.com

## ⚡ Quick Start After Setup

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd Frontend
npm run dev

# Access application at http://localhost:5173
```

## 🎨 UI/UX Principles

1. **Clean & Minimal**: Government portal aesthetic
2. **Accessibility First**: WCAG 2.1 AA compliant
3. **Mobile Responsive**: Works on all devices
4. **Clear Feedback**: Loading states, success/error messages
5. **Intuitive Navigation**: Easy to understand flow
6. **Data Security**: Sensitive data masked/protected

---

**Status**: Foundation Complete ✅ | Pages In Progress 🚧

**Next Milestone**: Complete all page components and routing
