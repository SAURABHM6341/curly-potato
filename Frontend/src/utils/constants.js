/**
 * Constants and Configuration
 * Centralized configuration for the application
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  OTP_VERIFY: '/otp-verify',
  PASSWORD_LOGIN: '/password-login',
  
  // Applicant routes
  APPLICANT_DASHBOARD: '/applicant/dashboard',
  SCHEMES: '/applicant/schemes',
  SCHEME_FORM: '/applicant/schemes/:id/apply',
  MY_APPLICATIONS: '/applicant/applications',
  UPLOAD_DOCUMENTS: '/applicant/documents',
  
  // Authority routes
  AUTHORITY_DASHBOARD: '/authority/dashboard',
  PENDING_APPROVALS: '/authority/pending',
  REVIEW_APPLICATION: '/authority/review/:id',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  MANAGE_SCHEMES: '/admin/schemes',
  MANAGE_USERS: '/admin/users',
  REPORTS: '/admin/reports',
  
  // Error routes
  NOT_FOUND: '/404'
};

export const USER_ROLES = {
  APPLICANT: 'applicant',
  AUTHORITY: 'authority',
  ADMIN: 'admin'
};

export const APPLICATION_STATUS = {
  SUBMITTED: 'submitted',
  DATA_VERIFICATION: 'data_verification',
  UNDER_REVIEW: 'under_review',
  PENDING_DOCUMENTS: 'pending_documents',
  FORWARDED: 'forwarded',
  APPROVED: 'approved',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  ON_HOLD: 'on_hold'
};

export const STATUS_COLORS = {
  submitted: { text: '#0056D2', bg: 'rgba(0,86,210,0.1)' },
  data_verification: { text: '#F4B400', bg: 'rgba(244,180,0,0.1)' },
  pending: { text: '#F4B400', bg: 'rgba(244,180,0,0.1)' },
  under_review: { text: '#F4B400', bg: 'rgba(244,180,0,0.1)' },
  pending_documents: { text: '#F4B400', bg: 'rgba(244,180,0,0.1)' },
  forwarded: { text: '#0056D2', bg: 'rgba(0,86,210,0.1)' },
  approved: { text: '#0F9D58', bg: 'rgba(15,157,88,0.1)' },
  accepted: { text: '#0F9D58', bg: 'rgba(15,157,88,0.1)' },
  rejected: { text: '#D93025', bg: 'rgba(217,48,37,0.1)' },
  on_hold: { text: '#5F6368', bg: 'rgba(95,99,104,0.1)' }
};

export const OTP_LENGTH = 6;
export const OTP_RESEND_TIMEOUT = 30; // seconds

export const TOAST_DURATION = 3000; // milliseconds

export const DOCUMENT_TYPES = {
  AADHAAR: 'aadhaar',
  MOBILE_VERIFICATION: 'mobile_verification',
  ADDRESS_PROOF: 'address_proof',
  INCOME_PROOF: 'income_proof',
  OTHER: 'other'
};
