/**
 * OTP Verification Page
 * Verifies OTP for login
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import OTPInput from '../../components/Input/OTPInput';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import Toast from '../../components/Alerts/Toast';
import { OTP_RESEND_TIMEOUT } from '../../utils/constants';
import './Auth.css';

const OTPVerify = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [toast, setToast] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get session data from localStorage
    const storedSession = localStorage.getItem('loginSession');
    if (!storedSession) {
      setToast({ message: 'Session expired. Please login again.', type: 'error' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setSessionData(JSON.parse(storedSession));
    setResendTimer(OTP_RESEND_TIMEOUT);
  }, [navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6) {
      handleVerifyOTP();
    }
  }, [otp]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyLoginOTP({
        identifier: sessionData.identifier,
        otp: otp,
        sessionId: sessionData.sessionId
      });

      if (response.data.success) {
        // Clear session data
        localStorage.removeItem('loginSession');
        
        // Store user and redirect
        await login(response.data.user);
        setToast({ message: 'Login successful!', type: 'success' });
        
        setTimeout(() => {
          const role = response.data.user.authorityId ? 'authority' : 'applicant';
          navigate(`/${role}/dashboard`);
        }, 1000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Invalid OTP');
      setToast({ 
        message: error.response?.data?.error || 'Invalid OTP', 
        type: 'error' 
      });
      setOtp(''); // Clear OTP on error
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const response = await authAPI.resendOTP({
        type: 'login',
        identifier: sessionData.identifier
      });

      if (response.data.success) {
        setToast({ message: 'OTP resent successfully!', type: 'success' });
        setResendTimer(OTP_RESEND_TIMEOUT);
        setOtp('');
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Failed to resend OTP', 
        type: 'error' 
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('loginSession');
    navigate('/login');
  };

  if (!sessionData) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Verify OTP</h1>
          <p className="auth-subtitle">
            Enter the 6-digit OTP sent to your registered mobile number
          </p>
        </div>

        <div className="otp-section">
          <OTPInput
            value={otp}
            onChange={setOtp}
            length={6}
            error={error}
          />
        </div>

        <div className="auth-form">
          <PrimaryButton
            onClick={handleVerifyOTP}
            fullWidth
            loading={loading}
            disabled={otp.length !== 6}
          >
            Verify OTP
          </PrimaryButton>

          <div className="otp-actions">
            <p className="otp-resend-text">
              Didn't receive OTP?{' '}
              {resendTimer > 0 ? (
                <span className="otp-timer">Resend in {resendTimer}s</span>
              ) : (
                <button
                  className="auth-link"
                  onClick={handleResendOTP}
                  disabled={resendLoading}
                >
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </p>
          </div>

          <SecondaryButton onClick={handleCancel} fullWidth>
            Cancel
          </SecondaryButton>
        </div>
      </div>

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

export default OTPVerify;
