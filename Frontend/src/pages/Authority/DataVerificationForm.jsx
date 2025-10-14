/**
 * Data Verification Form Page
 * For Data Entry Operators to verify application completeness and escalate
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import TextInput from '../../components/Input/TextInput';
import SelectInput from '../../components/Input/SelectInput';
import PrimaryButton from '../../components/Button/PrimaryButton';
import SecondaryButton from '../../components/Button/SecondaryButton';
import Spinner from '../../components/Loader/Spinner';
import './DataVerification.css';

const DataVerificationForm = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [verificationForm, setVerificationForm] = useState({
    isComplete: null,
    missingFields: [],
    comments: ''
  });

  const [checklist, setChecklist] = useState({
    applicantName: false,
    mobile: false,
    email: false,
    purpose: false,
    description: false,
    documents: false
  });

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await authorityAPI.getApplicationForVerification(applicationId);
      
      if (response.data.success) {
        setApplication(response.data.application);
        // Auto-populate checklist
        autoCheckCompleteness(response.data.application);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      showToast(error.response?.data?.error || 'Failed to load application', 'error');
      navigate('/authority/data-verification');
    } finally {
      setLoading(false);
    }
  };

  const autoCheckCompleteness = (app) => {
    const checks = {
      applicantName: !!app.applicant?.name && app.applicant.name.trim().length > 2,
      mobile: !!app.applicant?.mobile && app.applicant.mobile.length >= 10,
      email: !!app.applicant?.email,
      purpose: !!app.applicationData?.purpose,
      description: !!app.applicationData?.description && app.applicationData.description.trim().length > 10,
      documents: app.documents && app.documents.length > 0
    };
    
    setChecklist(checks);
    
    // Auto-determine if complete
    const allComplete = Object.values(checks).every(v => v === true);
    setVerificationForm(prev => ({ ...prev, isComplete: allComplete }));
  };

  const toggleChecklistItem = (field) => {
    setChecklist(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const calculateMissingFields = () => {
    const missing = [];
    const fieldLabels = {
      applicantName: 'Applicant Name',
      mobile: 'Mobile Number',
      email: 'Email Address',
      purpose: 'Application Purpose',
      description: 'Description',
      documents: 'Supporting Documents'
    };
    
    Object.entries(checklist).forEach(([field, isComplete]) => {
      if (!isComplete) {
        missing.push(fieldLabels[field]);
      }
    });
    
    return missing;
  };

  const handleSubmit = async (isComplete) => {
    const missingFields = calculateMissingFields();
    
    if (isComplete && missingFields.length > 0) {
      showToast('Please check all items or mark as incomplete', 'error');
      return;
    }
    
    if (!verificationForm.comments.trim()) {
      showToast('Please add comments about your verification', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await authorityAPI.verifyAndEscalateApplication(applicationId, {
        isComplete,
        missingFields,
        comments: verificationForm.comments
      });
      
      if (response.data.success) {
        showToast(response.data.message, 'success');
        navigate('/authority/data-verification');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      showToast(error.response?.data?.error || 'Failed to submit verification', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner />
        <p>Loading application...</p>
      </div>
    );
  }

  if (!application) {
    return <div>Application not found</div>;
  }

  const allChecked = Object.values(checklist).every(v => v === true);

  return (
    <div className="data-verification-form-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Verify Application</h1>
          <p className="page-subtitle">{application.applicationId}</p>
        </div>
        <SecondaryButton onClick={() => navigate('/authority/data-verification')}>
          ← Back to List
        </SecondaryButton>
      </div>

      <div className="verification-content">
        {/* Application Details */}
        <div className="details-section">
          <h2>📄 Application Details</h2>
          
          <div className="detail-grid">
            <div className="detail-item">
              <label>Applicant Name</label>
              <div className="detail-value">{application.applicant.name || 'Not provided'}</div>
            </div>
            
            <div className="detail-item">
              <label>Mobile Number</label>
              <div className="detail-value">{application.applicant.mobile || 'Not provided'}</div>
            </div>
            
            <div className="detail-item">
              <label>Email</label>
              <div className="detail-value">{application.applicant.email || 'Not provided'}</div>
            </div>
            
            <div className="detail-item">
              <label>Date of Birth</label>
              <div className="detail-value">
                {application.applicant.dateOfBirth ? new Date(application.applicant.dateOfBirth).toLocaleDateString() : 'Not provided'}
              </div>
            </div>
            
            <div className="detail-item">
              <label>Gender</label>
              <div className="detail-value">{application.applicant.gender || 'Not provided'}</div>
            </div>
            
            <div className="detail-item full-width">
              <label>Address</label>
              <div className="detail-value">
                {application.applicant.address ? (
                  <>
                    {application.applicant.address.line1}
                    {application.applicant.address.line2 && `, ${application.applicant.address.line2}`}
                    <br />
                    {application.applicant.address.city}, {application.applicant.address.state} - {application.applicant.address.pincode}
                  </>
                ) : 'Not provided'}
              </div>
            </div>
            
            <div className="detail-item full-width">
              <label>Application Purpose</label>
              <div className="detail-value">
                {application.applicationData.purpose?.replace(/_/g, ' ').toUpperCase() || 'Not specified'}
              </div>
            </div>
            
            <div className="detail-item full-width">
              <label>Description</label>
              <div className="detail-value">
                {application.applicationData.description || 'No description provided'}
              </div>
            </div>
            
            <div className="detail-item full-width">
              <label>Documents Uploaded</label>
              <div className="documents-list">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc, idx) => (
                    <div key={idx} className="document-item">
                      <span>📎 {doc.type.replace(/_/g, ' ')}</span>
                      <span className={`doc-status ${doc.status}`}>{doc.status}</span>
                      {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="doc-link">
                          View Document
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="no-documents">No documents uploaded</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="checklist-section">
          <h2>✓ Verification Checklist</h2>
          <p className="checklist-subtitle">Check each item to verify completeness</p>
          
          <div className="checklist">
            {Object.entries(checklist).map(([field, isChecked]) => {
              const labels = {
                applicantName: 'Applicant Name is filled and valid',
                mobile: 'Mobile Number is valid (10 digits)',
                email: 'Email Address is provided',
                purpose: 'Application Purpose is specified',
                description: 'Description is provided (min 10 characters)',
                documents: 'At least one document is uploaded'
              };
              
              return (
                <label key={field} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChecklistItem(field)}
                  />
                  <span className={isChecked ? 'checked' : ''}>{labels[field]}</span>
                </label>
              );
            })}
          </div>

          {!allChecked && (
            <div className="warning-message">
              ⚠️ Some items are not checked. If data is incomplete, mark as incomplete below.
            </div>
          )}
        </div>

        {/* Verification Form */}
        <div className="verification-form-section">
          <h2>📝 Verification Decision</h2>
          
          <div className="form-content">
            <TextInput
              label="Verification Comments *"
              name="comments"
              placeholder="Add your comments about the verification..."
              value={verificationForm.comments}
              onChange={(e) => setVerificationForm(prev => ({ ...prev, comments: e.target.value }))}
              multiline
              rows={4}
              required
            />

            {allChecked && (
              <div className="auto-escalation-info">
                <p>✅ <strong>Automatic Escalation:</strong> This application will be automatically escalated to <strong>Tehsildar</strong> for review.</p>
              </div>
            )}

            <div className="action-buttons">
              {allChecked ? (
                <PrimaryButton
                  fullWidth
                  onClick={() => handleSubmit(true)}
                  loading={submitting}
                >
                  ✓ Mark Complete & Escalate to Tehsildar
                </PrimaryButton>
              ) : (
                <PrimaryButton
                  fullWidth
                  onClick={() => handleSubmit(false)}
                  loading={submitting}
                  style={{ background: '#f29900' }}
                >
                  ⚠️ Mark Incomplete & Send Back to User
                </PrimaryButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVerificationForm;
