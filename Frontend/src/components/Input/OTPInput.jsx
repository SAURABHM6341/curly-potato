/**
 * OTPInput Component
 * 6-digit OTP input with auto-focus and paste support
 */

import React, { useRef, useEffect } from 'react';
import './Input.css';

const OTPInput = ({ value, onChange, length = 6, error = '' }) => {
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const val = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(val)) return;

    const newOTP = value.split('');
    newOTP[index] = val.slice(-1); // Take only last digit
    onChange(newOTP.join(''));

    // Auto-focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    
    if (!/^\d+$/.test(pastedData)) return;
    
    onChange(pastedData.padEnd(length, ''));
    
    // Focus last filled input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="otp-input-container">
      <div className="otp-input-group">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`otp-input ${error ? 'otp-input-error' : ''}`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default OTPInput;
