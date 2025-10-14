/**
 * Multi-Step Signup Page
 * Complete signup wizard with mobile and Aadhaar verification
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import TextInput from '../../components/Input/TextInput';
import OTPInput from '../../components/Input/OTPInput';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import Toast from '../../components/Alerts/Toast';
import Spinner from '../../components/Loader/Spinner';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Mobile, 2: Mobile OTP, 3: Aadhaar, 4: Aadhaar OTP, 5: Credentials
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // For password visibility toggle
  
  // Form data
  const [mobile, setMobile] = useState('');
  const [mobileOTP, setMobileOTP] = useState('');
  const [mobileSessionId, setMobileSessionId] = useState('');
  const [tempToken, setTempToken] = useState('');
  
  const [aadhaar, setAadhaar] = useState('');
  const [aadhaarOTP, setAadhaarOTP] = useState('');
  const [aadhaarSessionId, setAadhaarSessionId] = useState('');
  
  const [credentials, setCredentials] = useState(null);
  const [errors, setErrors] = useState({});

  // Step 1: Request Mobile OTP
  const handleRequestMobileOTP = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!mobile || !/^\+91\d{10}$/.test(mobile)) {
      setErrors({ mobile: 'Please enter valid mobile number (+91XXXXXXXXXX)' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.requestMobileOTP(mobile);
      
      if (response.data.success) {
        setMobileSessionId(response.data.sessionId);
        setToast({ message: 'OTP sent to your mobile!', type: 'success' });
        setStep(2);
        
        // For testing, show OTP in console
        if (response.data.testing?.otp) {
          console.log('Mobile OTP:', response.data.testing.otp);
        }
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

  // Step 2: Verify Mobile OTP
  const handleVerifyMobileOTP = async (e) => {
    e.preventDefault();
    setErrors({});

    if (mobileOTP.length !== 6) {
      setErrors({ mobileOTP: 'Please enter complete 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyMobileOTP({
        mobile,
        otp: mobileOTP,
        sessionId: mobileSessionId
      });

      if (response.data.success) {
        setTempToken(response.data.tempToken);
        setToast({ message: 'Mobile verified successfully!', type: 'success' });
        setStep(3);
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Invalid OTP', 
        type: 'error' 
      });
      setMobileOTP('');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Initiate Aadhaar Verification
  const handleInitiateAadhaar = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      setErrors({ aadhaar: 'Please enter valid 12-digit Aadhaar number' });
      return;
    }

    setLoading(true);
    try {
      // Store temp token for API call
      localStorage.setItem('tempToken', tempToken);
      
      const response = await authAPI.initiateAadhaar(aadhaar);

      if (response.data.success) {
        setAadhaarSessionId(response.data.sessionId);
        setToast({ message: 'Aadhaar OTP sent!', type: 'success' });
        setStep(4);
        
        // For testing, show OTP in console
        if (response.data.testing?.otp) {
          console.log('Aadhaar OTP:', response.data.testing.otp);
        }
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Aadhaar verification failed', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Verify Aadhaar OTP & Complete Signup
  const handleVerifyAadhaar = async (e) => {
    e.preventDefault();
    setErrors({});

    if (aadhaarOTP.length !== 6) {
      setErrors({ aadhaarOTP: 'Please enter complete 6-digit OTP' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyAadhaar({
        aadhaar,
        otp: aadhaarOTP,
        sessionId: aadhaarSessionId
      });

      if (response.data.success) {
        localStorage.removeItem('tempToken');
        setCredentials(response.data.credentials);
        setToast({ message: 'Account created successfully!', type: 'success' });
        setStep(5);
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Verification failed', 
        type: 'error' 
      });
      setAadhaarOTP('');
    } finally {
      setLoading(false);
    }
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = (text) => {
    navigator.clipboard.writeText(text);
    setToast({ message: 'Copied to clipboard!', type: 'success' });
  };

  // Navigate to login
  const handleGoToLogin = () => {
    navigate('/login');
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="signup-steps">
      {[1, 2, 3, 4].map((stepNum) => (
        <div
          key={stepNum}
          className={`signup-step ${step >= stepNum ? 'signup-step-active' : ''} ${step === stepNum ? 'signup-step-current' : ''}`}
        >
          <div className="signup-step-number">{stepNum}</div>
          <div className="signup-step-label">
            {stepNum === 1 && 'Mobile'}
            {stepNum === 2 && 'Verify'}
            {stepNum === 3 && 'Aadhaar'}
            {stepNum === 4 && 'Complete'}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Complete the verification process</p>
        </div>

        {step < 5 && renderStepIndicator()}

        {/* Step 1: Mobile Number */}
        {step === 1 && (
          <form onSubmit={handleRequestMobileOTP} className="auth-form">
            <TextInput
              label="Mobile Number"
              name="mobile"
              type="tel"
              placeholder="+919876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              autoFocus
              error={errors.mobile}
            />
            
            <PrimaryButton type="submit" fullWidth loading={loading}>
              Send OTP
            </PrimaryButton>
            
            <SecondaryButton onClick={() => navigate('/login')} fullWidth>
              Back to Login
            </SecondaryButton>
          </form>
        )}

        {/* Step 2: Mobile OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyMobileOTP} className="auth-form">
            <p className="auth-hint">Enter OTP sent to {mobile}</p>
            
            <OTPInput
              value={mobileOTP}
              onChange={setMobileOTP}
              length={6}
              error={errors.mobileOTP}
            />
            
            <PrimaryButton type="submit" fullWidth loading={loading}>
              Verify Mobile
            </PrimaryButton>
            
            <SecondaryButton onClick={() => setStep(1)} fullWidth>
              Change Mobile Number
            </SecondaryButton>
          </form>
        )}

        {/* Step 3: Aadhaar Number */}
        {step === 3 && (
          <form onSubmit={handleInitiateAadhaar} className="auth-form">
            <TextInput
              label="Aadhaar Number"
              name="aadhaar"
              type="text"
              placeholder="123456789012"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              autoFocus
              error={errors.aadhaar}
              maxLength={12}
            />
            
            <p className="auth-hint">
              OTP will be sent to your Aadhaar-registered mobile number
            </p>
            
            <PrimaryButton type="submit" fullWidth loading={loading}>
              Send Aadhaar OTP
            </PrimaryButton>
            
            <SecondaryButton onClick={() => setStep(2)} fullWidth>
              Back
            </SecondaryButton>
          </form>
        )}

        {/* Step 4: Aadhaar OTP */}
        {step === 4 && (
          <form onSubmit={handleVerifyAadhaar} className="auth-form">
            <p className="auth-hint">Enter Aadhaar OTP</p>
            
            <OTPInput
              value={aadhaarOTP}
              onChange={setAadhaarOTP}
              length={6}
              error={errors.aadhaarOTP}
            />
            
            <PrimaryButton type="submit" fullWidth loading={loading}>
              Complete Signup
            </PrimaryButton>
            
            <SecondaryButton onClick={() => setStep(3)} fullWidth>
              Back
            </SecondaryButton>
          </form>
        )}

        {/* Step 5: Display Credentials */}
        {step === 5 && credentials && (
          <div className="credentials-container">
            <div className="credentials-success">
              <div className="credentials-icon">✓</div>
              <h2 className="credentials-title">Account Created Successfully!</h2>
              <p className="credentials-subtitle">
                Save these credentials securely. You'll need them to login.
              </p>
            </div>

            <div className="credentials-box">
              <div className="credential-item">
                <label className="credential-label">User ID</label>
                <div className="credential-value-group">
                  <input
                    type="text"
                    value={credentials.loginUserId}
                    readOnly
                    className="credential-value"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(credentials.loginUserId)}
                    className="credential-copy"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="credential-item">
                <label className="credential-label">Password</label>
                <div className="credential-value-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={credentials.password || ''}
                    readOnly
                    className="credential-value"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyCredentials(credentials.password)}
                    className="credential-copy"
                  >
                    📋
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="credential-toggle"
                >
                  {showPassword ? '👁️ Hide Password' : '👁️ View Password'}
                </button>
              </div>
            </div>

            <div className="credentials-warning">
              ⚠️ Please save these credentials. You cannot retrieve them later.
            </div>

            <PrimaryButton onClick={handleGoToLogin} fullWidth>
              Go to Login
            </PrimaryButton>
          </div>
        )}
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

export default Signup;
