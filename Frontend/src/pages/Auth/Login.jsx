/**
 * Login Page
 * Dual login system with OTP and Password tabs
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import TextInput from '../../components/Input/TextInput';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import Toast from '../../components/Alerts/Toast';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('password'); // 'password', 'otp', or 'authority'
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Password login state
  const [passwordForm, setPasswordForm] = useState({
    loginUserId: '',
    password: ''
  });
  
  // OTP login state
  const [otpForm, setOtpForm] = useState({
    identifier: ''
  });
  
  // Authority login state
  const [authorityForm, setAuthorityForm] = useState({
    designation: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!passwordForm.loginUserId || !passwordForm.password) {
      setErrors({ form: 'Please fill in all fields' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.loginPassword(passwordForm);
      
      if (response.data.success) {
        // Determine user role and prepare user object (same as OTP flow)
        const role = response.data.user.authorityId ? 'authority' : 'applicant';
        const userWithRole = {
          ...response.data.user,
          role: role,
          isAuthority: role === 'authority'
        };
        
        // Store user data and redirect
        await login(userWithRole);
        setToast({ message: 'Login successful!', type: 'success' });
        
        // Small delay to ensure session is saved on backend
        setTimeout(() => {
          navigate(`/${role}/dashboard`);
        }, 1500);
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Login failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP login (redirect to OTP verify page)
  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!otpForm.identifier) {
      setErrors({ identifier: 'Please enter Aadhaar or User ID' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.login(otpForm);
      
      if (response.data.success) {
        // Store session info and redirect to OTP verify
        localStorage.setItem('loginSession', JSON.stringify({
          sessionId: response.data.sessionId,
          identifier: otpForm.identifier
        }));
        
        setToast({ message: 'OTP sent successfully!', type: 'success' });
        
        setTimeout(() => {
          navigate('/otp-verify');
        }, 1000);
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Failed to send OTP', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle Authority login
  const handleAuthorityLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!authorityForm.designation || !authorityForm.password) {
      setErrors({ form: 'Please fill in all fields' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.authorityLogin(authorityForm);
      
      if (response.data.success) {
        // Store authority data with proper role and redirect
        const authorityData = {
          ...response.data.authority,
          role: 'authority',
          isAuthority: true,
          name: response.data.authority.designationName || response.data.authority.designation
        };
        
        await login(authorityData);
        setToast({ message: 'Authority login successful!', type: 'success' });
        
        // Small delay to ensure session is saved on backend
        setTimeout(() => {
          navigate('/authority/dashboard');
        }, 1500);
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Authority login failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Login Helper - Moved to separate column */}
      <div className="login-helper-sidebar">
        <div className="login-helper">
          <h3 className="login-helper-title">Test Login Credentials</h3>
          
          <div className="login-helper-section">
            <h4 className="login-helper-subtitle">Authority Accounts</h4>
            <div className="login-helper-accounts">
              <div className="login-helper-account">
                <span className="login-helper-label">District Collector:</span>
                <span className="login-helper-value">District_Collector_Delhi</span>
                <span className="login-helper-password">Admin@123</span>
              </div>
              <div className="login-helper-account">
                <span className="login-helper-label">Assistant Collector:</span>
                <span className="login-helper-value">Assistant_Collector_North</span>
                <span className="login-helper-password">Reviewer@123</span>
              </div>
              <div className="login-helper-account">
                <span className="login-helper-label">Tehsildar:</span>
                <span className="login-helper-value">Tehsildar_CP_Zone</span>
                <span className="login-helper-password">Tehsil@123</span>
              </div>
              <div className="login-helper-account">
                <span className="login-helper-label">Data Entry:</span>
                <span className="login-helper-value">Data_Entry_Operator</span>
                <span className="login-helper-password">Operator@123</span>
              </div>
            </div>
          </div>

          <div className="login-helper-section">
            <h4 className="login-helper-subtitle">User Account</h4>
            <div className="login-helper-accounts">
              <div className="login-helper-account">
                <span className="login-helper-label">Test User:</span>
                <span className="login-helper-value">USER_716962</span>
                <span className="login-helper-password">8xhKKvMD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">PCR PoA DBT Portal</h1>
          <p className="auth-subtitle">Login to access your account</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === 'password' ? 'auth-tab-active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Password Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'otp' ? 'auth-tab-active' : ''}`}
            onClick={() => setActiveTab('otp')}
          >
            OTP Login
          </button>
          <button
            className={`auth-tab ${activeTab === 'authority' ? 'auth-tab-active' : ''}`}
            onClick={() => setActiveTab('authority')}
          >
            Authority Login
          </button>
        </div>

        {/* Password Login Form */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="auth-form">
            <TextInput
              label="User ID"
              name="loginUserId"
              placeholder="USER_XXXXXX"
              value={passwordForm.loginUserId}
              onChange={(e) => setPasswordForm({...passwordForm, loginUserId: e.target.value})}
              required
              autoFocus
            />
            
            <TextInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={passwordForm.password}
              onChange={(e) => setPasswordForm({...passwordForm, password: e.target.value})}
              required
            />
            
            {errors.form && (
              <p className="auth-error">{errors.form}</p>
            )}
            
            <PrimaryButton
              type="submit"
              fullWidth
              loading={loading}
            >
              Login
            </PrimaryButton>
          </form>
        )}

        {/* OTP Login Form */}
        {activeTab === 'otp' && (
          <form onSubmit={handleOTPLogin} className="auth-form">
            <TextInput
              label="Aadhaar Number or User ID"
              name="identifier"
              placeholder="12-digit Aadhaar or USER_XXXXXX"
              value={otpForm.identifier}
              onChange={(e) => setOtpForm({...otpForm, identifier: e.target.value})}
              required
              autoFocus
              error={errors.identifier}
            />
            
            <PrimaryButton
              type="submit"
              fullWidth
              loading={loading}
            >
              Send OTP
            </PrimaryButton>
            
            <p className="auth-hint">
              An OTP will be sent to your registered mobile number
            </p>
          </form>
        )}

        {/* Authority Login Form */}
        {activeTab === 'authority' && (
          <form onSubmit={handleAuthorityLogin} className="auth-form">
            <TextInput
              label="Designation"
              name="designation"
              placeholder="e.g., SDM_BLOCK_A"
              value={authorityForm.designation}
              onChange={(e) => setAuthorityForm({...authorityForm, designation: e.target.value})}
              required
              autoFocus
            />
            
            <TextInput
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={authorityForm.password}
              onChange={(e) => setAuthorityForm({...authorityForm, password: e.target.value})}
              required
            />
            
            {errors.form && (
              <p className="auth-error">{errors.form}</p>
            )}
            
            <PrimaryButton
              type="submit"
              fullWidth
              loading={loading}
            >
              Login as Authority
            </PrimaryButton>
            
            <p className="auth-hint">
              For government officials and authorities only
            </p>
          </form>
        )}

        {/* Footer Links */}
        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <button
              className="auth-link"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Login;
