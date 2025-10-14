/**
 * Main App Component
 * Application routing and layout
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import OTPVerify from './pages/Auth/OTPVerify';

// Applicant Pages
import ApplicantDashboard from './pages/Applicant/Dashboard';
import SchemeList from './pages/Applicant/SchemeList';
import SchemeForm from './pages/Applicant/SchemeForm';
import MyApplications from './pages/Applicant/MyApplications';
import TrackStatus from './pages/Applicant/TrackStatus';
import Documents from './pages/Applicant/Documents';

// Authority Pages
import AuthorityDashboard from './pages/Authority/AuthorityDashboard';
import PendingApprovals from './pages/Authority/PendingApprovals';
import AllApplications from './pages/Authority/AllApplications';
import ReviewApplication from './pages/Authority/ReviewApplication';
import Reports from './pages/Authority/Reports';
import DataVerificationList from './pages/Authority/DataVerificationList';
import DataVerificationForm from './pages/Authority/DataVerificationForm';

// Common Pages
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
  <Route path="/verify-otp" element={<OTPVerify />} />
  {/* Alias for legacy/navigation: accept both /otp-verify and /verify-otp */}
  <Route path="/otp-verify" element={<OTPVerify />} />
          {/* Applicant Routes */}
          <Route
            path="/applicant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <ApplicantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/schemes"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <SchemeList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/schemes/:schemeId"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <SchemeForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/applications"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/applications/:applicationId"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <TrackStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/documents"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <Documents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applicant/profile"
            element={
              <ProtectedRoute allowedRoles={['applicant']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Authority Routes */}
          <Route
            path="/authority/dashboard"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/pending"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <PendingApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/review/:applicationId"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <ReviewApplication />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/applications"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <AllApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/history"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <PendingApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/reports"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          {/* Data Verification Routes (Level 1-2 only) */}
          <Route
            path="/authority/data-verification"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <DataVerificationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/data-verification/:applicationId"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <DataVerificationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/profile"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Default route */}
          <Route path='/' element={<Navigate to="/login"/>} />
          
          {/* Error routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
  );
}

export default App;
