/**
 * Authority Dashboard Page
 * Authority role overview and pending work
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ApplicationCard from '../../components/Cards/ApplicationCard';
import PrimaryButton from '../../components/Button/PrimaryButton';
import Spinner from '../../components/Loader/Spinner';
import NoData from '../../components/EmptyState/NoData';
import { useToast } from '../../context/ToastContext';
import './AuthorityDashboard.css';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState(null);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await authorityAPI.getDashboard();
      setStats(response.data.stats);
      setPendingApplications(response.data.pendingApplications || []);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="authority-dashboard-loading">
        <Spinner />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="authority-dashboard-page">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name}</h1>
          <p className="page-subtitle">{user?.designation}</p>
        </div>
        <div className="authority-badge">
          <span className="badge-icon">👨‍💼</span>
          <span className="badge-text">Authority</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="authority-stats">
        <div className="stat-card stat-pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.pendingCount || 0}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>

        <div className="stat-card stat-reviewed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.reviewedCount || 0}</span>
            <span className="stat-label">Reviewed Today</span>
          </div>
        </div>

        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalProcessed || 0}</span>
            <span className="stat-label">Total Processed</span>
          </div>
        </div>

        <div className="stat-card stat-avg-time">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-value">{stats?.avgProcessingTime || '0h'}</span>
            <span className="stat-label">Avg. Processing Time</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        
        <div className="quick-actions-grid">
          <button
            className="quick-action-card"
            onClick={() => navigate('/authority/pending')}
          >
            <div className="action-icon" style={{ background: 'rgba(244, 180, 0, 0.1)' }}>
              📋
            </div>
            <h3>Pending Approvals</h3>
            <p>Review applications waiting for your approval</p>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/authority/applications')}
          >
            <div className="action-icon" style={{ background: 'rgba(0, 86, 210, 0.1)' }}>
              📂
            </div>
            <h3>All Applications</h3>
            <p>View all applications in your jurisdiction</p>
          </button>

          <button
            className="quick-action-card"
            onClick={() => navigate('/authority/history')}
          >
            <div className="action-icon" style={{ background: 'rgba(15, 157, 88, 0.1)' }}>
              📜
            </div>
            <h3>Review History</h3>
            <p>View your past reviews and decisions</p>
          </button>
        </div>
      </div>

      {/* Recent Pending Applications */}
      <div className="pending-applications-section">
        <div className="section-header">
          <h2 className="section-title">Pending Applications</h2>
          {pendingApplications.length > 0 && (
            <PrimaryButton
              size="small"
              onClick={() => navigate('/authority/pending')}
            >
              View All
            </PrimaryButton>
          )}
        </div>

        {pendingApplications.length === 0 ? (
          <NoData
            message="No pending applications"
            description="All applications have been reviewed"
          />
        ) : (
          <div className="applications-grid">
            {pendingApplications.slice(0, 4).map(app => (
              <ApplicationCard
                key={app.applicationId}
                application={app}
                onAction={(app) => navigate(`/authority/review/${app.applicationId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Authority Info */}
      <div className="authority-info-section">
        <div className="info-card">
          <h3>Your Authority Details</h3>
          <div className="info-details">
            <div className="info-row">
              <span className="info-label">Designation:</span>
              <span className="info-value">{user?.designation}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Level:</span>
              <span className="info-value">Level {user?.level}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="info-card tips-card">
          <h3>💡 Tips</h3>
          <ul className="tips-list">
            <li>Review applications promptly to ensure efficient processing</li>
            <li>Add detailed comments when rejecting or forwarding applications</li>
            <li>Verify all documents before approval</li>
            <li>Forward to appropriate higher authority if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
