/**
 * ApplicationCard Component
 * Reusable card for displaying application information
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusTag from './StatusTag';
import PrimaryButton from '../Button/PrimaryButton';
import './Cards.css';

const ApplicationCard = ({ application, onAction, showCurrentAuthority = false }) => {
  const navigate = useNavigate();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  const formatAuthority = (designation) => {
    return designation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="application-card">
      <div className="application-card-header">
        <div>
          <h3 className="application-card-title">
            {application.schemeName || application.applicationData?.purpose || 'Application'}
          </h3>
          <p className="application-card-id">ID: {application.applicationId}</p>
        </div>
        <StatusTag status={application.status} />
      </div>

      <div className="application-card-details">
        <div className="application-card-detail">
          <span className="detail-label">Applicant:</span>
          <span className="detail-value">{application.applicantName}</span>
        </div>
        
        <div className="application-card-detail">
          <span className="detail-label">Submitted:</span>
          <span className="detail-value">{formatDate(application.submittedAt)}</span>
        </div>

        {application.lastUpdated && (
          <div className="application-card-detail">
            <span className="detail-label">Last Updated:</span>
            <span className="detail-value">{formatDate(application.lastUpdated)}</span>
          </div>
        )}

        {showCurrentAuthority && application.currentAuthority?.designation && (
          <div className="application-card-detail">
            <span className="detail-label">📍 Current Authority:</span>
            <span className="detail-value authority-badge">
              {formatAuthority(application.currentAuthority.designation)}
            </span>
          </div>
        )}
      </div>

      {application.applicationData?.urgency && (
        <div className={`application-card-urgency urgency-${application.applicationData.urgency}`}>
          {application.applicationData.urgency === 'urgent' && '🔴'}
          {application.applicationData.urgency === 'high' && '🟡'}
          {application.applicationData.urgency === 'normal' && '🟢'}
          {application.applicationData.urgency === 'low' && '⚪'}
          {' '}
          {application.applicationData.urgency.charAt(0).toUpperCase() + application.applicationData.urgency.slice(1)} Priority
        </div>
      )}

      <div className="application-card-actions">
        <PrimaryButton
          size="small"
          onClick={() => onAction ? onAction(application) : navigate(`/applicant/applications/${application.applicationId}`)}
        >
          View Details
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ApplicationCard;
