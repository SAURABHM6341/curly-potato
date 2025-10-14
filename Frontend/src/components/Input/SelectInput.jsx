/**
 * SelectInput Component
 * Dropdown select with label and error handling
 */

import React from 'react';
import './Input.css';

const SelectInput = ({ 
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = '',
  placeholder = 'Select an option'
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`select-field ${error ? 'input-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default SelectInput;
