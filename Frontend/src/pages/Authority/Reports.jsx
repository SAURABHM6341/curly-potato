/**
 * Reports Page for Authority Users
 * View application statistics and reports
 */

import React, { useState, useEffect } from 'react';
import { authorityAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/Loader/Spinner';
import { FaChartBar } from 'react-icons/fa';
import './Reports.css';

function Reports() {
  const { setToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats and applications
      const [dashboardResponse, applicationsResponse] = await Promise.all([
        authorityAPI.getDashboard(),
        authorityAPI.getPendingApplications({ status: 'all' }) // Get ALL applications for reports
      ]);

      console.log('Dashboard Response:', dashboardResponse.data);
      console.log('Applications Response:', applicationsResponse.data);

      if (dashboardResponse.data.success) {
        // Handle different response structures (dashboard vs statistics)
        const statsData = dashboardResponse.data.statistics || dashboardResponse.data.dashboard?.statistics;
        console.log('Stats Data:', statsData);
        
        // Convert byStatus array to object for easier access
        if (statsData?.byStatus && Array.isArray(statsData.byStatus)) {
          const byStatusObj = {};
          statsData.byStatus.forEach(item => {
            byStatusObj[item._id] = item.count;
          });
          statsData.byStatus = byStatusObj;
        }
        
        setStats(statsData);
      }

      if (applicationsResponse.data.success || applicationsResponse.data.applications) {
        setApplications(applicationsResponse.data.applications || []);
      }

    } catch (error) {
      console.error('Reports fetch error:', error);
      setToast({
        message: error.response?.data?.error || 'Failed to fetch reports data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#3b82f6';
      case 'data_verification': return '#f59e0b';
      case 'under_review': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'forwarded': return '#8b5cf6';
      case 'pending_documents': return '#f97316';
      case 'on_hold': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="reports-loading">
        <Spinner />
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Application statistics and performance metrics</p>
      </div>

      {stats && (
        <div className="reports-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon"><FaChartBar /></div>
              <div className="stat-info">
                <h3>Total Applications</h3>
                <p className="stat-value">{stats.totalApplications || applications.length || 0}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>Pending Review</h3>
                <p className="stat-value">{stats.pendingApplications || stats.pendingReview || 0}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Approved</h3>
                <p className="stat-value success">
                  {(stats.byStatus?.approved || 0) + (stats.byStatus?.accepted || 0)}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <h3>Rejected</h3>
                <p className="stat-value error">{stats.byStatus?.rejected || stats.rejected || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="reports-content">
        <div className="reports-section">
          <div className="section-header">
            <h2>Application Status Distribution</h2>
          </div>
          
          {stats?.byStatus && Object.keys(stats.byStatus).length > 0 ? (
            <div className="status-chart">
              {Object.entries(stats.byStatus).map(([status, count], index) => (
                <div key={index} className="status-bar">
                  <div className="status-label">
                    <span className="status-name">{status.replace('_', ' ').toUpperCase()}</span>
                    <span className="status-count">{count}</span>
                  </div>
                  <div className="status-progress">
                    <div 
                      className="status-fill"
                      style={{
                        width: `${(count / (stats.totalApplications || 1)) * 100}%`,
                        backgroundColor: getStatusColor(status)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No status data available</p>
            </div>
          )}
        </div>

        <div className="reports-section">
          <div className="section-header">
            <h2>Recent Applications</h2>
          </div>
          
          {applications.length > 0 ? (
            <div className="applications-table">
              <div className="table-header">
                <span>Application ID</span>
                <span>Applicant</span>
                <span>Purpose</span>
                <span>Status</span>
                <span>Submitted</span>
              </div>
              
              {applications.slice(0, 10).map((app) => (
                <div key={app.applicationId} className="table-row">
                  <span className="app-id">{app.applicationId}</span>
                  <span className="applicant-name">{app.applicantName}</span>
                  <span className="app-purpose">{app.applicationData?.purpose || 'N/A'}</span>
                  <span className={`app-status status-${app.status}`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  <span className="submit-date">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data">
              <p>No recent applications</p>
            </div>
          )}
        </div>

        <div className="reports-section">
          <div className="section-header">
            <h2>Performance Metrics</h2>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>Average Processing Time</h4>
              <p className="metric-value">
                {stats?.avgProcessingTime ? 
                  `${Math.round(stats.avgProcessingTime)} hours` : 
                  'No data'
                }
              </p>
            </div>
            
            <div className="metric-card">
              <h4>Applications This Week</h4>
              <p className="metric-value">
                {applications.filter(app => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(app.submittedAt) > weekAgo;
                }).length}
              </p>
            </div>
            
            <div className="metric-card">
              <h4>Completion Rate</h4>
              <p className="metric-value">
                {stats?.totalApplications ? 
                  `${Math.round((
                    (stats.byStatus?.approved || 0) + 
                    (stats.byStatus?.accepted || 0) + 
                    (stats.byStatus?.rejected || 0)
                  ) / stats.totalApplications * 100)}%` :
                  '0%'
                }
              </p>
            </div>
            
            <div className="metric-card">
              <h4>Active Applications</h4>
              <p className="metric-value">
                {applications.filter(app => 
                  !['approved', 'accepted', 'rejected'].includes(app.status)
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;