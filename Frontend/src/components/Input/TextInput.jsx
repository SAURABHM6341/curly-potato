/**
 * TextInput Component
 * Standard text input with label and error handling
 */

import React from 'react';
import './Input.css';

const TextInput = ({ 
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder = '',
  required = false,
  disabled = false,
  error = '',
  icon = null,
  autoFocus = false,
  maxLength
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={`input-field ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''}`}
        />
      </div>
      
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default TextInput;
