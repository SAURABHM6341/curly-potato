/**
 * Unauthorized Access Page
 * Displayed when user tries to access a route they don't have permission for
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFound.css'; // Reuse NotFound styles

function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoHome = () => {
    navigate('/login'); // Go to login page
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">401</div>
        <h1>Unauthorized Access</h1>
        <p>
          You don't have permission to access this page. 
          Please check your credentials or contact support.
        </p>
        
        <div className="not-found-actions">
          <button onClick={handleGoBack} className="btn-secondary">
            Go Back
          </button>
          <button onClick={handleGoHome} className="btn-primary">
            Login
          </button>
        </div>
        
        <div className="help-text">
          <p>Need help? <Link to="/login">Sign in</Link> with proper credentials.</p>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;