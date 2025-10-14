/**
 * SecondaryButton Component
 * Outlined button for secondary actions
 */

import React from 'react';
import './Button.css';

const SecondaryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  fullWidth = false,
  icon = null,
  size = 'medium'
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-secondary ${fullWidth ? 'btn-full-width' : ''} btn-${size}`}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default SecondaryButton;
