/**
 * StatusTag Component
 * Color-coded status badges
 */

import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';
import './Cards.css';

const StatusTag = ({ status, size = 'medium' }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.submitted;
  
  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <span
      className={`status-tag status-tag-${size}`}
      style={{
        color: colors.text,
        background: colors.bg
      }}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusTag;
