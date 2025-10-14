/**
 * TrackStatus Page
 * Track application status and timeline
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { applicationAPI } from '../../utils/api';
import StatusTag from '../../components/Cards/StatusTag';
import DocumentCard from '../../components/Cards/DocumentCard';
import Spinner from '../../components/Loader/Spinner';
import SecondaryButton from '../../components/Button/SecondaryButton';
import { useToast } from '../../context/ToastContext';
import './TrackStatus.css';

const TrackStatus = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await applicationAPI.getApplicationStatus(applicationId);
      setApplication(response.data.application);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load application details', 'error');
      navigate('/applicant/applications');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="track-status-loading">
        <Spinner />
        <p>Loading application details...</p>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="track-status-page">
      <div className="track-header">
        <SecondaryButton onClick={() => navigate('/applicant/applications')}>
          ← Back to Applications
        </SecondaryButton>
      </div>

      {/* Application Overview */}
      <div className="application-overview">
        <div className="overview-header">
          <div>
            <h1 className="page-title">{application.schemeName || 'Application'}</h1>
            <p className="application-id">ID: {application.applicationId}</p>
          </div>
          <StatusTag status={application.status} size="large" />
        </div>

        <div className="overview-details">
          <div className="overview-card">
            <span className="overview-label">Submitted On</span>
            <span className="overview-value">{formatDate(application.submittedAt)}</span>
          </div>

          <div className="overview-card">
            <span className="overview-label">Last Updated</span>
            <span className="overview-value">
              {application.lastUpdated ? formatDate(application.lastUpdated) : 'Not updated'}
            </span>
          </div>

          {application.currentAuthority?.designation && (
            <div className="overview-card">
              <span className="overview-label">Current Authority</span>
              <span className="overview-value">{application.currentAuthority.designation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="application-timeline">
        <h2 className="section-title">Application Timeline</h2>
        
        <div className="timeline">
          {application.timeline && application.timeline.length > 0 ? (
            application.timeline.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  {event.action === 'approved' && '✅'}
                  {event.action === 'rejected' && '❌'}
                  {event.action === 'forwarded' && '➡️'}
                  {event.action === 'submitted' && '📤'}
                </div>
                
                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4 className="timeline-action">{event.action.toUpperCase()}</h4>
                    <span className="timeline-date">{formatDate(event.timestamp)}</span>
                  </div>
                  
                  {event.by && (
                    <p className="timeline-authority">
                      By: {event.by.designation || event.by.name}
                    </p>
                  )}
                  
                  {event.comments && (
                    <p className="timeline-comments">{event.comments}</p>
                  )}

                  {event.forwardedTo && (
                    <p className="timeline-forwarded">
                      Forwarded to: {event.forwardedTo.designation}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="timeline-empty">No timeline events yet</p>
          )}
        </div>
      </div>

      {/* Application Data */}
      {application.applicationData && (
        <div className="application-data-section">
          <h2 className="section-title">Application Details</h2>
          
          <div className="data-grid">
            {Object.entries(application.applicationData).map(([key, value]) => (
              <div key={key} className="data-item">
                <span className="data-label">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                </span>
                <span className="data-value">{value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {application.documents && application.documents.length > 0 && (
        <div className="application-documents-section">
          <h2 className="section-title">Uploaded Documents</h2>
          
          <div className="documents-list">
            {application.documents.map((doc, index) => (
              <DocumentCard
                key={index}
                document={doc}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Comments from Authorities */}
      {application.comments && application.comments.length > 0 && (
        <div className="application-comments-section">
          <h2 className="section-title">Authority Comments</h2>
          
          <div className="comments-list">
            {application.comments.map((comment, index) => (
              <div key={index} className="comment-card">
                <div className="comment-header">
                  <span className="comment-author">{comment.by?.designation || 'Authority'}</span>
                  <span className="comment-date">{formatDate(comment.timestamp)}</span>
                </div>
                <p className="comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackStatus;
