/**
 * Applicant Dashboard
 * Main dashboard for applicant users
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../utils/api';
import PrimaryButton from '../../components/Button/PrimaryButton';
import TagButton from '../../components/Button/TagButton';
import Spinner from '../../components/Loader/Spinner';
import NoData from '../../components/EmptyState/NoData';
import Toast from '../../components/Alerts/Toast';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await userAPI.getDashboard();
      console.log('Full response:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data.data:', response.data.data);
      setDashboardData(response.data.data);
    } catch (error) {
      setToast({
        message: error.response?.data?.error || 'Failed to load dashboard',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="large" text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.name || 'User'}</h1>
          <p className="dashboard-subtitle">User ID: {user?.loginUserId}</p>
        </div>
        <PrimaryButton onClick={() => navigate('/applicant/schemes')}>
          Browse Schemes
        </PrimaryButton>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0,86,210,0.1)', color: '#0056D2' }}>
            📋
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Applications</p>
            <p className="stat-value">{dashboardData?.stats?.totalApplications || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244,180,0,0.1)', color: '#F4B400' }}>
            ⏳
          </div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <p className="stat-value">{dashboardData?.stats?.pending || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(15,157,88,0.1)', color: '#0F9D58' }}>
            ✓
          </div>
          <div className="stat-content">
            <p className="stat-label">Approved</p>
            <p className="stat-value">{dashboardData?.stats?.approved || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217,48,37,0.1)', color: '#D93025' }}>
            ✕
          </div>
          <div className="stat-content">
            <p className="stat-label">Rejected</p>
            <p className="stat-value">{dashboardData?.stats?.rejected || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions">
          <button 
            className="action-card"
            onClick={() => navigate('/applicant/schemes')}
          >
            <span className="action-icon">🎯</span>
            <h3 className="action-title">Apply for Scheme</h3>
            <p className="action-description">Browse and apply for government schemes</p>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/applicant/applications')}
          >
            <span className="action-icon">📊</span>
            <h3 className="action-title">My Applications</h3>
            <p className="action-description">View and track your applications</p>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/applicant/documents')}
          >
            <span className="action-icon">📁</span>
            <h3 className="action-title">Upload Documents</h3>
            <p className="action-description">Upload required documents</p>
          </button>

          <button 
            className="action-card"
            onClick={() => navigate('/applicant/applications')}
          >
            <span className="action-icon">📝</span>
            <h3 className="action-title">My Applications</h3>
            <p className="action-description">View all your applications</p>
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Recent Applications</h2>
          <button 
            className="section-link"
            onClick={() => navigate('/applicant/applications')}
          >
            View All →
          </button>
        </div>

        {dashboardData?.recentApplications && dashboardData.recentApplications.length > 0 ? (
          <div className="applications-list">
            {dashboardData.recentApplications.map((app) => (
              <div key={app.applicationId} className="application-card">
                <div className="application-header">
                  <div>
                    <h3 className="application-title">{app.schemeName || 'Application'}</h3>
                    <p className="application-id">ID: {app.applicationId}</p>
                  </div>
                  <TagButton type={getStatusType(app.status)}>
                    {formatStatus(app.status)}
                  </TagButton>
                </div>
                
                <div className="application-details">
                  <div className="application-detail">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="application-detail">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {new Date(app.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <PrimaryButton 
                  size="small"
                  onClick={() => navigate(`/applicant/applications/${app.applicationId}`)}
                >
                  View Details
                </PrimaryButton>
              </div>
            ))}
          </div>
        ) : (
          <NoData
            icon="📭"
            title="No Applications Yet"
            message="You haven't applied for any schemes yet. Start by browsing available schemes."
            actionButton={
              <PrimaryButton onClick={() => navigate('/applicant/schemes')}>
                Browse Schemes
              </PrimaryButton>
            }
          />
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

// Helper functions
const getStatusType = (status) => {
  const statusMap = {
    submitted: 'info',
    under_review: 'warning',
    pending_documents: 'warning',
    forwarded: 'info',
    approved: 'success',
    rejected: 'error',
    on_hold: 'warning'
  };
  return statusMap[status] || 'info';
};

const formatStatus = (status) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

export default Dashboard;
