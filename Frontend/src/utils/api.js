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

// Request interceptor - Add auth token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== AUTHENTICATION APIs =====

export const authAPI = {
  // Signup flow
  requestMobileOTP: (mobile) => API.post('/auth/request-mobile-otp', { mobile }),
  verifyMobileOTP: (data) => API.post('/auth/verify-mobile-otp', data),
  initiateAadhaar: (aadhaar) => API.post('/auth/aadhaar/initiate', { aadhaar }),
  verifyAadhaar: (data) => API.post('/auth/aadhaar/verify', data),
  
  // Login flow
  login: (identifier) => API.post('/auth/login', { identifier }),
  verifyLoginOTP: (data) => API.post('/auth/verify-login-otp', data),
  loginPassword: (data) => API.post('/auth/login-password', data),
  authorityLogin: (data) => API.post('/auth/authority/login', data),
  
  // Session management
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

export const applicationAPI = {
  createApplication: (data) => API.post('/applications', data),
  getMyApplications: () => API.get('/applications/my-applications'),
  getApplicationStatus: (id) => API.get(`/applications/${id}/status`),
  updateApplication: (id, data) => API.put(`/applications/${id}`, data),
  deleteApplication: (id) => API.delete(`/applications/${id}`),
  uploadDocuments: (id, formData) => API.post(`/applications/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: (id) => API.get(`/applications/${id}/documents`)
};

// ===== AUTHORITY APIs =====

export const authorityAPI = {
  getDashboard: () => API.get('/authority/dashboard'),
  getPendingApplications: (params) => API.get('/authority/applications/pending', { params }),
  getApplication: (id) => API.get(`/authority/applications/${id}`),
  approveApplication: (id, data) => API.post(`/authority/applications/${id}/approve`, data),
  rejectApplication: (id, data) => API.post(`/authority/applications/${id}/reject`, data),
  forwardApplication: (id, data) => API.post(`/authority/applications/${id}/forward`, data),
  getHigherAuthorities: () => API.get('/authority/higher-authorities'),
  reviewApplication: (id, data) => API.post(`/authority/applications/${id}/review`, data),
  getForwardingOptions: () => API.get('/authority/forwarding-options'),
  createTestApplication: () => API.post('/authority/applications/create-test'),
  createAuthority: (data) => API.post('/authority/create', data),
  listAuthorities: () => API.get('/authority/list')
};

// ===== FILE UPLOAD API =====

export const uploadFile = (formData) => {
  return API.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Export default API instance for custom requests
export default API;
