/**
 * PrimaryButton Component
 * Blue button for primary actions
 */

import React from 'react';
import './Button.css';

const PrimaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  fullWidth = false,
  loading = false,
  icon = null,
  size = 'medium' // small, medium, large
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-primary ${fullWidth ? 'btn-full-width' : ''} btn-${size}`}
    >
      {loading ? (
        <span className="btn-loader"></span>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default PrimaryButton;
