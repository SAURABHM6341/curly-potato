# 🚀 Quick Start Guide

## Get Started in 3 Minutes!

---

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running on port 5000

---

## ⚡ Quick Setup

### 1. **Install Dependencies**

```bash
cd Frontend
npm install
```

### 2. **Environment Configuration**

The `.env` file is already configured:
```env
REACT_APP_API_BASE=http://localhost:5000
```

If your backend runs on a different port, update this file.

### 3. **Start Development Server**

```bash
npm run dev
```

The app will open at: **http://localhost:5173**

---

## 🧪 Test the Application

### **Option 1: Create New Account (Signup)**

1. Go to **http://localhost:5173/signup**
2. Follow the 4-step signup wizard:
   - Enter mobile number → Verify OTP
   - Enter Aadhaar number → Verify OTP
   - Copy generated credentials
3. Login with the credentials

### **Option 2: Login with Existing Account**

1. Go to **http://localhost:5173/login**
2. Use one of these methods:
   - **Password Tab:** Username + Password
   - **OTP Tab:** Mobile + OTP

---

## 👤 Test User Roles

### **Applicant Flow**

1. **Login as Applicant**
   ```
   Role: applicant
   ```

2. **Navigate to:**
   - `/applicant/dashboard` - View stats
   - `/applicant/schemes` - Browse schemes
   - `/applicant/schemes/:id` - Apply for scheme
   - `/applicant/applications` - View applications
   - `/applicant/applications/:id` - Track status

### **Authority Flow**

1. **Login as Authority**
   ```
   Role: authority
   ```

2. **Navigate to:**
   - `/authority/dashboard` - View pending work
   - `/authority/pending` - See pending applications
   - `/authority/review/:id` - Review application
   - Approve/Reject/Forward applications

---

## 🎨 Available Pages

### **Public Routes**
- `/login` - Login page (dual-tab)
- `/signup` - Multi-step signup wizard
- `/verify-otp` - OTP verification

### **Applicant Routes** (Protected)
- `/applicant/dashboard` - Main dashboard
- `/applicant/schemes` - Browse schemes
- `/applicant/schemes/:schemeId` - Apply for scheme
- `/applicant/applications` - My applications
- `/applicant/applications/:id` - Track application

### **Authority Routes** (Protected)
- `/authority/dashboard` - Authority dashboard
- `/authority/pending` - Pending approvals
- `/authority/review/:id` - Review application
- `/authority/applications` - All applications
- `/authority/history` - Review history

### **Error Routes**
- `/404` or any invalid route - Not Found page

---

## 🎯 Key Features to Test

### **1. Authentication**
- [x] Login with password
- [x] Login with OTP
- [x] Complete signup flow
- [x] OTP auto-focus and paste
- [x] Session persistence
- [x] Logout

### **2. Applicant Features**
- [x] View dashboard stats
- [x] Browse schemes with filters
- [x] Apply for scheme with dynamic form
- [x] Upload documents (drag-drop)
- [x] View all applications
- [x] Track application timeline

### **3. Authority Features**
- [x] View pending applications
- [x] Review application details
- [x] Approve with comments
- [x] Reject with reason
- [x] Forward to higher authority

### **4. UI/UX**
- [x] Toast notifications
- [x] Loading spinners
- [x] Form validation
- [x] Error handling
- [x] Responsive design
- [x] Empty states

---

## 📱 Responsive Testing

Test on different screen sizes:

- **Desktop:** > 1024px (Full sidebar)
- **Tablet:** 768px - 1024px (Collapsible sidebar)
- **Mobile:** < 768px (Hamburger menu)

**Browser DevTools:**
1. Press `F12`
2. Click device toggle (Ctrl+Shift+M)
3. Select different devices

---

## 🔍 Component Showcase

### **Buttons**
```jsx
// Already integrated in pages
<PrimaryButton>Submit</PrimaryButton>
<SecondaryButton>Cancel</SecondaryButton>
<TagButton>Tag</TagButton>
```

### **Inputs**
```jsx
<TextInput placeholder="Enter text" />
<OTPInput length={6} onChange={setOtp} />
<FileUpload onFileSelect={handleFile} />
<SelectInput options={options} />
```

### **Cards**
```jsx
<StatusTag status="approved" />
<ApplicationCard application={app} />
<DocumentCard document={doc} />
```

### **Alerts**
```jsx
const { showToast } = useToast();
showToast('Success message', 'success');
showToast('Error message', 'error');
```

---

## 🐛 Troubleshooting

### **Issue: Backend Connection Failed**
**Solution:**
1. Check if backend is running on port 5000
2. Verify `.env` file has correct API URL
3. Check CORS settings in backend

### **Issue: Login Not Working**
**Solution:**
1. Ensure backend session is configured
2. Check browser cookies are enabled
3. Verify user exists in database

### **Issue: Pages Not Loading**
**Solution:**
1. Check React Router setup in `App.jsx`
2. Verify protected routes allow your role
3. Check browser console for errors

### **Issue: Components Not Rendering**
**Solution:**
1. Check import paths are correct
2. Verify CSS files are imported
3. Check component props are correct

---

## 📦 Build for Production

### **1. Create Production Build**
```bash
npm run build
```

### **2. Preview Production Build**
```bash
npm run preview
```

### **3. Deploy**
The `dist/` folder contains all production files.

**Deployment Options:**
- Vercel: `vercel deploy`
- Netlify: `netlify deploy`
- AWS S3 + CloudFront
- GitHub Pages
- Docker container

---

## 🎓 Learning Path

### **Beginner**
1. Start with Login page
2. Explore component structure
3. Review AuthContext
4. Check API integration

### **Intermediate**
1. Study protected routes
2. Analyze form validation
3. Review state management
4. Understand component composition

### **Advanced**
1. Optimize performance
2. Add new features
3. Implement admin panel
4. Add advanced analytics

---

## 🔗 Quick Links

- **Frontend Guide:** `FRONTEND_GUIDE.md`
- **Roadmap:** `IMPLEMENTATION_ROADMAP.md`
- **Build Summary:** `BUILD_SUMMARY.md`
- **Backend API:** `../backend/API_TESTING_GUIDE.md`

---

## 💡 Pro Tips

1. **Use React DevTools** for debugging state
2. **Check Network Tab** for API calls
3. **Use Console** for error messages
4. **Test Edge Cases** (empty states, long text, large files)
5. **Review Component Code** for implementation examples

---

## ✅ Checklist Before Testing

- [ ] Backend server is running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Dev server started (`npm run dev`)
- [ ] Browser opened to http://localhost:5173
- [ ] Test user accounts created in backend

---

## 🎉 You're Ready!

The frontend is fully functional and ready to test. Start by:

1. Opening http://localhost:5173
2. Creating a new account via Signup
3. Exploring the applicant dashboard
4. Applying for a scheme
5. Logging in as authority to review

---

**Happy Testing! 🚀**
