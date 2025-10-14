/**
 * NotFound Page (404)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import PrimaryButton from '../components/Button/PrimaryButton';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="error-actions">
          <PrimaryButton onClick={() => navigate(-1)}>
            Go Back
          </PrimaryButton>
          <PrimaryButton onClick={() => navigate('/')}>
            Go Home
          </PrimaryButton>
        </div>

        <div className="error-illustration">
          <span className="illustration-emoji">🔍</span>
          <p>We searched everywhere but couldn't find this page.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
