# 🚀 QUICK REFERENCE GUIDE
## PCR Portal - Developer Cheat Sheet

---

## 📋 Common Commands

### Backend

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start               # Start production server

# Setup
node setup-authorities.js  # Create default authorities

# Database
mongo                    # Open MongoDB shell
mongodump --db pcr_portal  # Backup database
mongorestore --db pcr_portal dump/  # Restore database

# Process Management (Production)
pm2 start index.js --name pcr-backend
pm2 restart pcr-backend
pm2 logs pcr-backend
pm2 stop pcr-backend
```

### Frontend

```bash
# Development
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Linting
npm run lint            # Run ESLint
```

---

## 🔑 Quick Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend Dev | http://localhost:5173 | N/A |
| Backend API | http://localhost:3000/api | N/A |
| MongoDB Local | mongodb://localhost:27017/pcr_portal | N/A |
| Data Entry Login | /login | `DATA_ENTRY_OPERATOR` / `password123` |
| Tehsildar Login | /login | `TEHSILDAR_CP_ZONE` / `password123` |
| Asst. Collector Login | /login | `ASSISTANT_COLLECTOR_NORTH` / `password123` |
| District Collector Login | /login | `DISTRICT_COLLECTOR_DELHI` / `password123` |

---

## 📊 Database Queries Cheatsheet

### Applications

```javascript
// Find all applications
db.applications.find({})

// Find by status
db.applications.find({ status: "under_review" })

// Find by authority
db.applications.find({ "currentAuthority.designation": "TEHSILDAR_CP_ZONE" })

// Find with specific ID
db.applications.findOne({ applicationId: "APP_123456" })

// Count by status
db.applications.countDocuments({ status: "approved" })

// Get recent applications
db.applications.find({}).sort({ submittedAt: -1 }).limit(10)

// Update application status
db.applications.updateOne(
  { applicationId: "APP_123456" },
  { $set: { status: "approved" } }
)

// Delete test applications
db.applications.deleteMany({ applicantName: /^Test/i })
```

### Users

```javascript
// Find all users
db.users.find({})

// Find by loginUserId
db.users.findOne({ loginUserId: "USER_123456" })

// Find by mobile (masked)
db.users.find({ mobile: /7890$/ })

// Count total users
db.users.countDocuments()

// Delete specific user
db.users.deleteOne({ loginUserId: "USER_123456" })
```

### Authorities

```javascript
// Find all authorities
db.authorities.find({})

// Find by designation
db.authorities.findOne({ designation: "TEHSILDAR_CP_ZONE" })

// Find by access level
db.authorities.find({ accessLevel: { $gte: 3 } })

// Update authority password (use bcrypt hash)
db.authorities.updateOne(
  { designation: "TEHSILDAR_CP_ZONE" },
  { $set: { password: "$2a$12$..." } }
)
```

### Sessions

```javascript
// View all active sessions
db.sessions.find({})

// Clear expired sessions
db.sessions.deleteMany({ expires: { $lt: new Date() } })

// Clear all sessions (force logout all users)
db.sessions.deleteMany({})
```

---

## 🔄 Common Workflows

### Reset Application to Previous State

```javascript
// Scenario: Approved application needs to go back to Tehsildar
db.applications.updateOne(
  { applicationId: "APP_123456" },
  {
    $set: {
      status: "under_review",
      "currentAuthority.designation": "TEHSILDAR_CP_ZONE",
      "currentAuthority.assignedAt": new Date()
    },
    $pop: { processingChain: 1 }  // Remove last action
  }
)
```

### Manually Forward Application

```javascript
// Forward to specific authority
db.applications.updateOne(
  { applicationId: "APP_123456" },
  {
    $set: {
      "currentAuthority.designation": "DISTRICT_COLLECTOR_DELHI",
      "currentAuthority.assignedAt": new Date()
    },
    $push: {
      processingChain: {
        designation: "ASSISTANT_COLLECTOR_NORTH",
        action: "forwarded",
        forwardedTo: "DISTRICT_COLLECTOR_DELHI",
        timestamp: new Date(),
        comments: "Manual forward"
      }
    },
    $inc: { authorityChanges: 1 }
  }
)
```

### Fix Case Sensitivity Issues

```javascript
// Convert all currentAuthority designations to uppercase
db.applications.find({}).forEach(function(doc) {
  if (doc.currentAuthority && doc.currentAuthority.designation) {
    db.applications.updateOne(
      { _id: doc._id },
      { $set: { 
        "currentAuthority.designation": doc.currentAuthority.designation.toUpperCase() 
      }}
    );
  }
});
```

---

## 🐛 Debugging Tips

### Backend Debugging

```javascript
// Enable detailed logging
// Add to index.js
app.use((req, res, next) => {
  console.log('📍', req.method, req.path);
  console.log('📦 Body:', req.body);
  console.log('🔐 Session:', req.session);
  next();
});

// Log MongoDB queries
mongoose.set('debug', true);

// Check if session exists
console.log('Session ID:', req.sessionID);
console.log('Session Data:', req.session);
```

### Frontend Debugging

```javascript
// In browser console
localStorage.getItem('user')  // Check stored user
document.cookie  // Check cookies

// In component
console.log('Auth State:', useAuth());
console.log('User:', user);
console.log('Is Authenticated:', isAuthenticated);

// Network tab
// Check request headers, response data, status codes
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --eval "db.adminCommand('ping')"
```

---

## ⚡ Performance Tips

### Backend Optimization

```javascript
// Add indexes
db.applications.createIndex({ "currentAuthority.designation": 1 })
db.applications.createIndex({ status: 1 })
db.applications.createIndex({ submittedAt: -1 })
db.users.createIndex({ loginUserId: 1 })

// Use lean() for read-only queries
Application.find({}).lean();

// Use select() to limit fields
Application.find({}).select('applicationId status submittedAt');

// Use pagination
Application.find({})
  .skip(page * limit)
  .limit(limit);
```

### Frontend Optimization

```javascript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Memoize expensive computations
const filteredApps = useMemo(() => 
  applications.filter(app => app.status === 'pending'),
  [applications]
);

// Debounce search input
const debouncedSearch = useCallback(
  debounce((value) => setSearchTerm(value), 300),
  []
);
```

---

## 🔒 Security Checklist

### Before Production

- [ ] Change all default passwords
- [ ] Use strong SESSION_SECRET (min 32 chars)
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with specific origin
- [ ] Enable rate limiting
- [ ] Add Helmet.js for security headers
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Disable error stack traces in production
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Review and update dependencies

---

## 📝 Code Snippets

### Create New Authority

```javascript
const Authority = require('./models/Authority');

const newAuthority = await Authority.createAuthority({
  designation: 'SUB_REGISTRAR_DELHI',
  designationName: 'Sub Registrar - Delhi',
  email: 'subregistrar@delhi.gov.in',
  password: 'SecurePass123!',
  accessLevel: 2,
  department: 'Registration',
  office: 'Delhi Registration Office',
  jurisdiction: 'Delhi'
});
```

### Send Toast Notification

```javascript
import { useToast } from '../context/ToastContext';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleAction = async () => {
    try {
      await api.doSomething();
      showToast('Success! Action completed', 'success');
    } catch (error) {
      showToast('Error: ' + error.message, 'error');
    }
  };
};
```

### Protected API Route

```javascript
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/protected', requireAuth, (req, res) => {
  res.json({ 
    message: 'Access granted',
    user: req.session.user 
  });
});
```

### Authority-Only Route

```javascript
const { requireAuthority } = require('../middleware/authMiddleware');

router.post('/review/:id', requireAuthority, async (req, res) => {
  // Only authorities can access this
  const authority = req.session.authority;
  // ... review logic
});
```

---

## 🎨 UI Component Examples

### Application Card

```jsx
<ApplicationCard 
  application={{
    applicationId: "APP_123456",
    applicantName: "John Doe",
    status: "under_review",
    submittedAt: new Date(),
    applicationData: {
      purpose: "income_certificate"
    }
  }}
  onAction={(app) => navigate(`/review/${app.applicationId}`)}
  showCurrentAuthority={true}
/>
```

### Status Tag

```jsx
<StatusTag status="approved" />
<StatusTag status="rejected" />
<StatusTag status="under_review" />
<StatusTag status="pending_documents" />
```

### Form with Validation

```jsx
const [formData, setFormData] = useState({
  name: '',
  email: ''
});
const [errors, setErrors] = useState({});

const validate = () => {
  const newErrors = {};
  if (!formData.name) newErrors.name = 'Name is required';
  if (!formData.email) newErrors.email = 'Email is required';
  return newErrors;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = validate();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  // Submit form
};
```

---

## 📞 Emergency Procedures

### Application Stuck in Processing

1. Find the application in database
2. Check `currentAuthority.designation`
3. Verify authority exists and is active
4. Check `processingChain` for last action
5. Manually update if needed (see workflows above)

### Mass Password Reset for Authorities

```javascript
const bcrypt = require('bcryptjs');

// Generate new password hash
const newPassword = 'NewSecure123!';
const hash = await bcrypt.hash(newPassword, 12);

// Update all authorities
db.authorities.updateMany(
  {},
  { $set: { password: hash } }
);
```

### Clear All Test Data

```javascript
// ⚠️ DANGEROUS - Use with caution
db.applications.deleteMany({ applicantName: /test/i });
db.users.deleteMany({ name: /test/i });
db.sessions.deleteMany({});
```

---

## 📚 Useful Resources

### Documentation
- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Mongoose Docs: https://mongoosejs.com

### Tools
- MongoDB Compass: https://www.mongodb.com/products/compass
- Postman: https://www.postman.com
- VS Code: https://code.visualstudio.com

### Learning
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
- React Patterns: https://reactpatterns.com

---

**Last Updated:** October 14, 2025  
**Maintained By:** PCR Portal Development Team
