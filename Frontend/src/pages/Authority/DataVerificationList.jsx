/**
 * Data Verification List Page
 * For Data Entry Operators to view applications pending verification
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PrimaryButton from '../../components/Button/PrimaryButton';
import Spinner from '../../components/Loader/Spinner';
import NoData from '../../components/EmptyState/NoData';
import './DataVerification.css';

const DataVerificationList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });

  useEffect(() => {
    fetchPendingApplications();
  }, [pagination.page]);

  const fetchPendingApplications = async () => {
    setLoading(true);
    try {
      const response = await authorityAPI.getPendingDataVerification({
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.data.success) {
        setApplications(response.data.applications);
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      urgent: { color: '#d93025', text: 'Urgent' },
      high: { color: '#f29900', text: 'High' },
      normal: { color: '#1a73e8', text: 'Normal' },
      low: { color: '#5f6368', text: 'Low' }
    };
    const badge = badges[urgency] || badges.normal;
    return (
      <span style={{
        background: badge.color,
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {badge.text}
      </span>
    );
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      income_certificate: 'Income Certificate',
      residence_certificate: 'Residence Certificate',
      caste_certificate: 'Caste Certificate',
      character_certificate: 'Character Certificate',
      other: 'Other'
    };
    return labels[purpose] || purpose;
  };

  if (loading) {
    return (
      <div className="page-loading">
        <Spinner />
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="data-verification-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Verification Queue</h1>
          <p className="page-subtitle">
            Review applications for completeness and escalate to reviewers
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <span className="stat-number">{pagination.total}</span>
            <span className="stat-label">Pending Verification</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="verification-instructions">
        <h3>📋 Your Responsibilities:</h3>
        <ul>
          <li>Verify all required fields are filled correctly</li>
          <li>Check if supporting documents are uploaded</li>
          <li>Note any missing or incomplete information</li>
          <li>Escalate complete applications to appropriate reviewer</li>
          <li>Send incomplete applications back for corrections</li>
        </ul>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <NoData
          message="No applications pending verification"
          description="All applications have been processed"
        />
      ) : (
        <>
          <div className="applications-table">
            <table>
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant</th>
                  <th>Purpose</th>
                  <th>Documents</th>
                  <th>Urgency</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.applicationId}>
                    <td>
                      <strong>{app.applicationId}</strong>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{app.applicantName}</div>
                        <div style={{ fontSize: '13px', color: '#5f6368' }}>
                          {app.applicantMobile}
                        </div>
                      </div>
                    </td>
                    <td>{getPurposeLabel(app.purpose)}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px',
                        background: app.documents.length > 0 ? '#e8f5e9' : '#fff3e0',
                        color: app.documents.length > 0 ? '#2e7d32' : '#ef6c00',
                        borderRadius: '4px',
                        fontSize: '13px'
                      }}>
                        {app.documents.length} docs
                      </span>
                    </td>
                    <td>{getUrgencyBadge(app.urgency)}</td>
                    <td>
                      {new Date(app.submittedAt).toLocaleDateString()}
                      <div style={{ fontSize: '12px', color: '#5f6368' }}>
                        {new Date(app.submittedAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td>
                      <PrimaryButton
                        size="small"
                        onClick={() => navigate(`/authority/data-verification/${app.applicationId}`)}
                      >
                        Verify
                      </PrimaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataVerificationList;
