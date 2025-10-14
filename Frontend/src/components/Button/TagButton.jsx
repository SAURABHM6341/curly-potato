/**
 * TagButton Component
 * Colored tag-style buttons with icons
 */

import React from 'react';
import './Button.css';

const TagButton = ({ 
  children, 
  type = 'info', // success, warning, error, info
  onClick,
  icon = null,
  size = 'small'
}) => {
  return (
    <button
      onClick={onClick}
      className={`tag-btn tag-btn-${type} tag-btn-${size}`}
    >
      {icon && <span className="tag-btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default TagButton;
