/**
 * NoData Component
 * Empty state component for when no data is available
 */

import React from 'react';
import './EmptyState.css';

const NoData = ({ 
  icon = '📭',
  title = 'No Data Found',
  message = 'There is no data to display at the moment.',
  actionButton = null
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionButton && (
        <div className="empty-state-action">
          {actionButton}
        </div>
      )}
    </div>
  );
};

export default NoData;
