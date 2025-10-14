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

// Authority Pages
import AuthorityDashboard from './pages/Authority/AuthorityDashboard';
import PendingApprovals from './pages/Authority/PendingApprovals';
import ReviewApplication from './pages/Authority/ReviewApplication';

// Common Pages
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<OTPVerify />} />

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
                <PendingApprovals />
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

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
  );
}

export default App;
