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
      const response = await authorityAPI.getHigherAuthorities();
      setHigherAuthorities(response.data.authorities || []);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const handleAction = (action) => {
    if (action === 'forward' && !selectedAuthority) {
      showToast('Please select an authority to forward to', 'warning');
      return;
    }
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
            <span className="overview-value">{application.applicantName}</span>
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

      {/* Documents */}
      {application.documents && application.documents.length > 0 && (
        <div className="review-section">
          <h2 className="section-title">Uploaded Documents</h2>
          
          <div className="documents-list">
            {application.documents.map((doc, index) => (
              <DocumentCard
                key={index}
                document={doc}
                onDownload={(doc) => window.open(doc.url, '_blank')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {application.timeline && application.timeline.length > 0 && (
        <div className="review-section">
          <h2 className="section-title">Review History</h2>
          
          <div className="timeline-list">
            {application.timeline.map((event, index) => (
              <div key={index} className="timeline-card">
                <div className="timeline-header">
                  <span className="timeline-action">{event.action.toUpperCase()}</span>
                  <span className="timeline-date">{formatDate(event.timestamp)}</span>
                </div>
                {event.by && (
                  <p className="timeline-by">By: {event.by.designation || event.by.name}</p>
                )}
                {event.comments && (
                  <p className="timeline-comments">{event.comments}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
                  value: auth._id,
                  label: `${auth.designation} (Level ${auth.level})`
                }))
              ]}
            />
          )}

          <div className="action-buttons">
            <SecondaryButton
              onClick={() => handleAction('reject')}
              disabled={actionLoading}
            >
              ❌ Reject
            </SecondaryButton>
            
            {higherAuthorities.length > 0 && (
              <SecondaryButton
                onClick={() => handleAction('forward')}
                disabled={actionLoading}
              >
                ➡️ Forward
              </SecondaryButton>
            )}
            
            <PrimaryButton
              onClick={() => handleAction('approve')}
              disabled={actionLoading}
            >
              ✅ Approve
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <ConfirmModal
          title={`Confirm ${modalAction?.toUpperCase()}`}
          message={`Are you sure you want to ${modalAction} this application?`}
          type={modalAction === 'approve' ? 'success' : modalAction === 'reject' ? 'danger' : 'warning'}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          confirmText={modalAction?.toUpperCase()}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

export default ReviewApplication;
