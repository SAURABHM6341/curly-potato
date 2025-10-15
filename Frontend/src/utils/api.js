/**
 * API Utility - Axios Configuration
 * Centralized API calls with interceptors for authentication
 */

import axios from 'axios';
import { API_BASE_URL } from './constants';

// Create axios instance
const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Important: Enable cookies for session-based auth
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token only for temporary tokens (signup flow)
API.interceptors.request.use(
  (config) => {
    // Only add Authorization header for temporary tokens during signup
    const tempToken = localStorage.getItem('tempToken');
    if (tempToken && (config.url.includes('/aadhaar/') || config.url.includes('/verify'))) {
      config.headers.Authorization = `Bearer ${tempToken}`;
    }
    
    // Log request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error for debugging
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response) {
      // Handle 401 Unauthorized - Let AuthContext handle logout/redirect
      // Don't force redirect here - just let the error propagate
      if (error.response.status === 401) {
        // AuthContext will handle this via checkAuth()
        console.log('401 Unauthorized - Session may be expired');
      }
      
      // Handle other common errors
      if (error.response.status === 403) {
        console.error('Access denied - insufficient permissions');
      }
      
      if (error.response.status >= 500) {
        console.error('Server error - please try again later');
      }
    }
    
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION APIs =====

export const authAPI = {
  // Signup flow (4-step process)
  requestMobileOTP: (mobile) => API.post('/auth/request-mobile-otp', { mobile }),
  verifyMobileOTP: (data) => API.post('/auth/verify-mobile-otp', data),
  initiateAadhaar: (aadhaar) => API.post('/auth/aadhaar/initiate', { aadhaar }),
  verifyAadhaar: (data) => API.post('/auth/aadhaar/verify', data),
  
  // Login flow (dual methods)
  login: (identifier) => API.post('/auth/login', { identifier }),
  verifyLoginOTP: (data) => API.post('/auth/verify-login-otp', data),
  loginPassword: (data) => API.post('/auth/login-password', data),
  
  // Authority authentication
  authorityLogin: (data) => API.post('/auth/authority/login', data),
  
  // Session management (no tokens needed - cookies only)
  getSession: () => API.get('/auth/session'),
  logout: () => API.post('/auth/logout'),
  
  // OTP management
  resendOTP: (data) => API.post('/auth/resend-otp', data)
};

// ===== USER APIs =====

export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  getDashboard: () => API.get('/users/dashboard'),
  getStats: () => API.get('/users/stats'),
  validateSession: () => API.get('/users/validate-session'),
  deactivate: () => API.post('/users/deactivate')
};

// ===== APPLICATION APIs =====
// Note: Application creation/management APIs would be implemented in future phases
// Currently focusing on authentication and authority system

export const applicationAPI = {
  // These endpoints would be added when application creation is implemented
  createApplication: (data) => API.post('/applications', data),
  getMyApplications: () => API.get('/applications/my-applications'),
  getApplicationStatus: (id) => API.get(`/applications/${id}/status`),
  updateApplication: (id, data) => API.put(`/applications/${id}`, data),
  deleteApplication: (id) => API.delete(`/applications/${id}`),
  uploadDocuments: (id, data) => API.post(`/applications/${id}/documents`, data),
  getDocuments: (id) => API.get(`/applications/${id}/documents`)
};

// ===== AUTHORITY APIs =====

export const authorityAPI = {
  // Alternative authority login endpoint
  login: (data) => API.post('/authority/login', data),
  
  // Dashboard and overview
  getDashboard: () => API.get('/authority/dashboard'),
  
  // Application management (matches backend routes exactly)
  getPendingApplications: (params) => API.get('/authority/applications/pending', { params }),
  getApplication: (id) => API.get(`/authority/applications/${id}`),
  reviewApplication: (id, data) => API.post(`/authority/applications/${id}/review`, data),
  getForwardingOptions: () => API.get('/authority/forwarding-options'),
  
  // Test and admin functions
  createTestApplication: () => API.post('/authority/applications/create-test'),
  createAuthority: (data) => API.post('/authority/create', data),
  listAuthorities: () => API.get('/authority/list'),
  
  // Legacy methods (for backward compatibility)
  approveApplication: (id, data) => API.post(`/authority/applications/${id}/review`, {
    ...data, 
    action: 'approve'
  }),
  rejectApplication: (id, data) => API.post(`/authority/applications/${id}/review`, {
    ...data,
    action: 'reject'
  }),
  forwardApplication: (id, data) => API.post(`/authority/applications/${id}/review`, {
    ...data,
    action: 'forward'
  }),
  
  // Data Verification APIs (for Data Entry Operators)
  getPendingDataVerification: (params) => API.get('/authority/data-verification/pending', { params }),
  getApplicationForVerification: (applicationId) => API.get(`/authority/data-verification/${applicationId}`),
  verifyAndEscalateApplication: (applicationId, data) => API.post(`/authority/data-verification/${applicationId}/verify`, data),
  getEscalationOptions: () => API.get('/authority/data-verification/escalation-options')
};

// ===== DOCUMENT API =====

export const documentAPI = {
  // Upload new document
  upload: (formData) => API.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Get user's documents
  getMyDocuments: (params) => API.get('/documents/my-documents', { params }),
  
  // Get documents for specific application
  getApplicationDocuments: (applicationId) => API.get(`/documents/application/${applicationId}`),
  
  // Link existing document to application
  linkToApplication: (documentId, applicationId, data) => 
    API.post(`/documents/${documentId}/link/${applicationId}`, data),
  
  // Get reusable documents (verified documents)
  getReusableDocuments: (types) => API.get('/documents/reusable', { 
    params: types ? { types: types.join(',') } : {} 
  }),
  
  // Delete document
  deleteDocument: (documentId) => API.delete(`/documents/${documentId}`),
  
  // Verify document (authority only)
  verifyDocument: (documentId, applicationId, data) => 
    API.post(`/documents/${documentId}/verify/${applicationId}`, data)
};

// ===== FILE UPLOAD API (Legacy - use documentAPI.upload instead) =====

export const uploadFile = (formData) => {
  return API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Export default API instance for custom requests
export default API;
