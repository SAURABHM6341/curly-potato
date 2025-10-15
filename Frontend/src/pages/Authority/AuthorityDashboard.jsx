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
import { 
  FaChartBar, 
  FaClock, 
  FaClipboardList, 
  FaFolder, 
  FaFileAlt, 
  FaLightbulb,
  FaCheck,
  FaUser
} from 'react-icons/fa';
import './AuthorityDashboard.css';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [dashboard, setDashboard] = useState(null);
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
      
      if (response.data.success && response.data.dashboard) {
        const dashboardData = response.data.dashboard;
        setDashboard(dashboardData);
        setStats(dashboardData.statistics);
        setPendingApplications(dashboardData.recentApplications || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      console.error('Error details:', error.response?.data);
      showToast(error.response?.data?.details || 'Failed to load dashboard data', 'error');
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
            <span className="stat-value">{stats?.pendingApplications || 0}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>

        <div className="stat-card stat-reviewed">
          <div className="stat-icon"><FaCheck /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.processedToday || 0}</span>
            <span className="stat-label">Reviewed Today</span>
          </div>
        </div>

        <div className="stat-card stat-total">
          <div className="stat-icon"><FaChartBar /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalApplications || 0}</span>
            <span className="stat-label">Total Processed</span>
          </div>
        </div>

        <div className="stat-card stat-avg-time">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-info">
            <span className="stat-value">{dashboard?.workload?.high_priority || 0}</span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        
        <div className="quick-actions-grid">
          {/* Data Verification for Level 1-2 */}
          {user?.accessLevel <= 2 && (
            <button
              className="quick-action-card"
              onClick={() => navigate('/authority/data-verification')}
            >
              <div className="action-icon" style={{ background: 'rgba(15, 157, 88, 0.1)' }}>
                <FaCheck />
              </div>
              <h3>Data Verification</h3>
              <p>Verify application completeness and escalate to reviewers</p>
            </button>
          )}

          {/* Show Pending Approvals for access level 3+ */}
          {user?.accessLevel >= 3 && (
            <button
              className="quick-action-card"
              onClick={() => navigate('/authority/pending')}
            >
              <div className="action-icon" style={{ background: 'rgba(244, 180, 0, 0.1)' }}>
                <FaClipboardList />
              </div>
              <h3>Pending Approvals</h3>
              <p>Review applications waiting for your approval</p>
            </button>
          )}

          {/* Show All Applications for access level 3+ */}
          {user?.accessLevel >= 3 && (
            <button
              className="quick-action-card"
              onClick={() => navigate('/authority/applications')}
            >
              <div className="action-icon" style={{ background: 'rgba(0, 86, 210, 0.1)' }}>
                <FaFolder />
              </div>
              <h3>All Applications</h3>
              <p>View all applications in your jurisdiction</p>
            </button>
          )}

          {/* Show Review History for access level 3+ */}
          {user?.accessLevel >= 3 && (
            <button
              className="quick-action-card"
              onClick={() => navigate('/authority/history')}
            >
              <div className="action-icon" style={{ background: 'rgba(15, 157, 88, 0.1)' }}>
                <FaFileAlt />
              </div>
              <h3>Review History</h3>
              <p>View your past reviews and decisions</p>
            </button>
          )}
          
          {/* Data Entry Option for Level 1-2 */}
          {user?.accessLevel <= 2 && (
            <button
              className="quick-action-card"
              onClick={() => navigate('/authority/profile')}
            >
              <div className="action-icon" style={{ background: 'rgba(0, 86, 210, 0.1)' }}>
                <FaUser />
              </div>
              <h3>My Profile</h3>
              <p>View and update your profile information</p>
            </button>
          )}
        </div>
      </div>

      {/* Recent Pending Applications - Only show for reviewers */}
      {user?.accessLevel >= 3 && (
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
      )}

      {/* Authority Info */}
      <div className="authority-info-section">
        <div className="info-card">
          <h3>Your Authority Details</h3>
          <div className="info-details">
            <div className="info-row">
              <span className="info-label">Designation:</span>
              <span className="info-value">{user?.designation || user?.designationName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Department:</span>
              <span className="info-value">{user?.department}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Access Level:</span>
              <span className="info-value">Level {user?.accessLevel}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="info-card tips-card">
          <h3><FaLightbulb /> Tips</h3>
          <ul className="tips-list">
            {user?.accessLevel >= 3 ? (
              <>
                <li>Review applications promptly to ensure efficient processing</li>
                <li>Add detailed comments when rejecting or forwarding applications</li>
                <li>Verify all documents before approval</li>
                <li>Forward to appropriate higher authority if needed</li>
              </>
            ) : (
              <>
                <li>Keep your profile information up to date</li>
                <li>Check the dashboard regularly for updates</li>
                <li>Contact your supervisor for any assistance</li>
                <li>Ensure secure handling of sensitive information</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthorityDashboard;
