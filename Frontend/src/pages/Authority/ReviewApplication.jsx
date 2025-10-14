/**
 * ReviewApplication Page
 * Review and take action on applications
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../utils/api';
import StatusTag from '../../components/Cards/StatusTag';
import DocumentCard from '../../components/Cards/DocumentCard';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import TextInput from '../../components/Input/TextInput';
import SelectInput from '../../components/Input/SelectInput';
import Spinner from '../../components/Loader/Spinner';
import ConfirmModal from '../../components/Modal/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import './ReviewApplication.css';

const ReviewApplication = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [higherAuthorities, setHigherAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null);

  useEffect(() => {
    fetchApplication();
    fetchHigherAuthorities();
  }, [applicationId]);

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const response = await authorityAPI.getApplication(applicationId);
      console.log('📄 Application data received:', response.data.application);
      console.log('👤 Applicant name:', response.data.application?.applicantName);
      console.log('👤 Applicant object:', response.data.application?.applicant);
      setApplication(response.data.application);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load application', 'error');
      navigate('/authority/pending');
    } finally {
      setLoading(false);
    }
  };

  const fetchHigherAuthorities = async () => {
    try {
      const response = await authorityAPI.getForwardingOptions();
      console.log('🔍 Forwarding options:', response.data);
      const options = response.data.forwardingOptions || [];
      setHigherAuthorities(options.map(opt => ({
        designation: opt.designation,
        name: opt.level,
        department: opt.department
      })));
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleAction = (action) => {
    console.log('🎯 handleAction called with:', action);
    
    // Only validate forward action for selected authority
    if (action === 'forward' && !selectedAuthority) {
      showToast('Please select an authority to forward to', 'warning');
      return;
    }
    
    // Don't validate reject here - let modal handle it
    console.log('✅ Opening modal for action:', action);
    setModalAction(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    setActionLoading(true);
    try {
      let response;
      
      switch (modalAction) {
        case 'approve':
          response = await authorityAPI.approveApplication(applicationId, { comments });
          showToast('Application approved successfully', 'success');
          break;
        
        case 'reject':
          if (!comments.trim()) {
            showToast('Please provide rejection reason', 'warning');
            setActionLoading(false);
            return;
          }
          response = await authorityAPI.rejectApplication(applicationId, { comments });
          showToast('Application rejected', 'success');
          break;
        
        case 'forward':
          response = await authorityAPI.forwardApplication(applicationId, {
            forwardTo: selectedAuthority,
            comments
          });
          showToast('Application forwarded successfully', 'success');
          break;
        
        default:
          break;
      }
      
      setShowModal(false);
      setTimeout(() => navigate('/authority/pending'), 1500);
    } catch (error) {
      console.error('Action error:', error);
      showToast(error.response?.data?.message || `Failed to ${modalAction} application`, 'error');
    } finally {
      setActionLoading(false);
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
      <div className="review-application-loading">
        <Spinner />
        <p>Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="review-application-page">
      <div className="review-header">
        <SecondaryButton onClick={() => navigate('/authority/pending')}>
          ← Back to Pending
        </SecondaryButton>
      </div>

      {/* Application Overview */}
      <div className="review-overview">
        <div className="overview-header">
          <div>
            <h1 className="page-title">{application.schemeName || 'Application'}</h1>
            <p className="application-id">ID: {application.applicationId}</p>
          </div>
          <StatusTag status={application.status} size="large" />
        </div>

        <div className="overview-grid">
          <div className="overview-item">
            <span className="overview-label">Applicant</span>
            <span className="overview-value">
              {application.applicantName || application.applicant?.name || 'Not Available'}
            </span>
          </div>
          
          <div className="overview-item">
            <span className="overview-label">Submitted On</span>
            <span className="overview-value">{formatDate(application.submittedAt)}</span>
          </div>

          {application.applicationData?.urgency && (
            <div className="overview-item">
              <span className="overview-label">Priority</span>
              <span className={`overview-value urgency-${application.applicationData.urgency}`}>
                {application.applicationData.urgency.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Application Details */}
      <div className="review-section">
        <h2 className="section-title">Application Details</h2>
        
        <div className="details-grid">
          {Object.entries(application.applicationData || {}).map(([key, value]) => (
            <div key={key} className="detail-item">
              <span className="detail-label">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="detail-value">{value || 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents Verification Section - ALWAYS SHOW FOR TEHSILDAR */}
      <div className="review-section">
        <h2 className="section-title">📎 Document Verification</h2>
        <p className="section-subtitle">
          <strong>⚠️ IMPORTANT:</strong> Verify all documents carefully before approving the application
        </p>
        
        {application.documents && application.documents.length > 0 ? (
          <>
            <div className="documents-verification-grid">
              {application.documents.map((doc, index) => (
                <div key={index} className="document-verification-card">
                  <div className="doc-header">
                    <div className="doc-info">
                      <span className="doc-icon">
                        {doc.type.includes('address') || doc.type.includes('domicile') ? '🏠' :
                         doc.type.includes('caste') ? '📜' :
                         doc.type.includes('income') ? '💰' :
                         doc.type.includes('aadhaar') ? '🆔' : '📄'}
                      </span>
                      <div>
                        <h3 className="doc-title">{doc.type.replace(/_/g, ' ').toUpperCase()}</h3>
                        <span className={`doc-status-badge ${doc.status}`}>{doc.status || 'pending'}</span>
                      </div>
                    </div>
                    <SecondaryButton
                      size="small"
                      onClick={() => {
                        if (doc.url) {
                          window.open(doc.url, '_blank');
                        } else {
                          showToast('Document file not available', 'warning');
                        }
                      }}
                    >
                      👁️ View Document
                    </SecondaryButton>
                  </div>
                  
                  {doc.uploadedAt && (
                    <p className="doc-meta">📅 Uploaded: {formatDate(doc.uploadedAt)}</p>
                  )}
                  
                  {doc.verifiedBy ? (
                    <p className="doc-meta verified">✅ Verified by: {doc.verifiedBy}</p>
                  ) : (
                    <p className="doc-meta pending">⏳ Pending verification</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="verification-checklist">
              <h3>🔍 Document Verification Checklist</h3>
              <ul className="checklist-items">
                <li>✓ <strong>Domicile Certificate</strong> - Valid and from recognized authority</li>
                <li>✓ <strong>Caste Certificate</strong> - Matches applicant details and is authentic</li>
                <li>✓ <strong>Income Certificate</strong> - Recent (within 6 months) and verifiable</li>
                <li>✓ <strong>All documents</strong> are clear, legible and properly scanned</li>
                <li>✓ <strong>Information matches</strong> across all documents</li>
              </ul>
              <div className="verification-warning">
                ⚠️ <strong>Note:</strong> Only approve if ALL documents are verified and authentic
              </div>
            </div>
          </>
        ) : (
          <div className="no-documents-warning">
            <div className="warning-icon">⚠️</div>
            <h3>No Documents Uploaded</h3>
            <p>This application does not have any documents attached yet.</p>
            <p><strong>Action Required:</strong> Request documents from applicant before approval.</p>
          </div>
        )}
      </div>

      {/* Application Timeline / Processing History */}
      <div className="review-section">
        <h2 className="section-title">📋 Application Timeline</h2>
        <p className="section-subtitle">Complete processing history of this application</p>
        
        <div className="timeline-container">
          {/* Submission Event - Always show */}
          <div className="timeline-event">
            <div className="timeline-marker submission">
              <span className="timeline-icon">📝</span>
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h3 className="timeline-action">Application Submitted</h3>
                <span className="timeline-date">{formatDate(application.submittedAt)}</span>
              </div>
              <p className="timeline-by">By: {application.applicantName || application.applicant?.name || 'Applicant'}</p>
              <p className="timeline-details">Application ID: {application.applicationId}</p>
              <span className="timeline-badge submitted">Submitted</span>
            </div>
          </div>

          {/* Processing History Events */}
          {application.processingHistory && application.processingHistory.length > 0 ? (
            application.processingHistory.map((event, index) => {
              const getEventIcon = (action) => {
                switch(action?.toLowerCase()) {
                  case 'approved': return '✅';
                  case 'rejected': return '❌';
                  case 'forwarded': return '➡️';
                  case 'requested_docs': return '📎';
                  case 'review_started': return '👁️';
                  case 'escalated': return '⬆️';
                  default: return '🔄';
                }
              };

              const getEventClass = (action) => {
                switch(action?.toLowerCase()) {
                  case 'approved': return 'approved';
                  case 'rejected': return 'rejected';
                  case 'forwarded': return 'forwarded';
                  case 'requested_docs': return 'requested';
                  default: return 'processing';
                }
              };

              return (
                <div key={index} className="timeline-event">
                  <div className={`timeline-marker ${getEventClass(event.action)}`}>
                    <span className="timeline-icon">{getEventIcon(event.action)}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h3 className="timeline-action">{event.action?.replace(/_/g, ' ').toUpperCase()}</h3>
                      <span className="timeline-date">{formatDate(event.timestamp)}</span>
                    </div>
                    {event.designation && (
                      <p className="timeline-by">
                        By: <strong>{event.designation.replace(/_/g, ' ')}</strong>
                        {event.department && ` (${event.department})`}
                      </p>
                    )}
                    {event.forwardedTo && (
                      <p className="timeline-details">
                        Forwarded to: <strong>{event.forwardedTo.replace(/_/g, ' ')}</strong>
                      </p>
                    )}
                    {event.comments && (
                      <p className="timeline-comments">💬 {event.comments}</p>
                    )}
                    <span className={`timeline-badge ${getEventClass(event.action)}`}>
                      {event.action?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="timeline-event">
              <div className="timeline-marker processing">
                <span className="timeline-icon">⏳</span>
              </div>
              <div className="timeline-content">
                <p className="timeline-empty">No processing history yet. Application is under initial review.</p>
              </div>
            </div>
          )}

          {/* Current Status */}
          <div className="timeline-event current">
            <div className="timeline-marker current">
              <span className="timeline-icon">📍</span>
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h3 className="timeline-action">Current Status: {application.status?.replace(/_/g, ' ').toUpperCase()}</h3>
                <span className="timeline-date">Now</span>
              </div>
              <p className="timeline-by">
                Assigned to: <strong>{application.currentAuthority?.designation?.replace(/_/g, ' ')}</strong>
                {application.currentAuthority?.department && ` (${application.currentAuthority.department})`}
              </p>
              <span className={`timeline-badge ${application.status}`}>
                {application.status?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Actions */}
      <div className="review-actions-section">
        <h2 className="section-title">Take Action</h2>
        
        <div className="action-form">
          <TextInput
            label="Comments (Optional for Approve/Forward, Required for Reject)"
            placeholder="Add your review comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={4}
          />

          {higherAuthorities.length > 0 && (
            <SelectInput
              label="Forward To (if needed)"
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
              options={[
                { value: '', label: 'Select Authority' },
                ...higherAuthorities.map(auth => ({
                  value: auth.designation,
                  label: `${auth.name} - ${auth.department}`
                }))
              ]}
            />
          )}

          <div className="action-buttons">
            <SecondaryButton
              onClick={() => {
                console.log('🔴 Reject button clicked');
                handleAction('reject');
              }}
              disabled={actionLoading}
            >
              ❌ Reject
            </SecondaryButton>
            
            {higherAuthorities.length > 0 && (
              <SecondaryButton
                onClick={() => {
                  console.log('🔵 Forward button clicked');
                  handleAction('forward');
                }}
                disabled={actionLoading}
              >
                ➡️ Forward
              </SecondaryButton>
            )}
            
            <PrimaryButton
              onClick={() => {
                console.log('🟢 Approve button clicked');
                handleAction('approve');
              }}
              disabled={actionLoading}
            >
              ✅ Approve
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showModal}
        onClose={() => {
          console.log('❌ Modal cancelled');
          setShowModal(false);
        }}
        onConfirm={confirmAction}
        title={`Confirm ${modalAction?.toUpperCase()}`}
        message={`Are you sure you want to ${modalAction} this application?`}
        type={modalAction === 'approve' ? 'success' : modalAction === 'reject' ? 'error' : 'warning'}
        confirmText={modalAction?.toUpperCase() || 'Confirm'}
        cancelText="Cancel"
      />
    </div>
  );
};

export default ReviewApplication;
