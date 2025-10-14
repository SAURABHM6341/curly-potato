/**
 * MyApplications Page
 * View all submitted applications
 */

import React, { useState, useEffect } from 'react';
import { applicationAPI } from '../../utils/api';
import ApplicationCard from '../../components/Cards/ApplicationCard';
import SelectInput from '../../components/Input/SelectInput';
import TextInput from '../../components/Input/TextInput';
import Spinner from '../../components/Loader/Spinner';
import NoData from '../../components/EmptyState/NoData';
import { useToast } from '../../context/ToastContext';
import './MyApplications.css';

const MyApplications = () => {
  const { showToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await applicationAPI.getMyApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = 
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.schemeName && app.schemeName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'submitted').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="my-applications-loading">
        <Spinner />
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="my-applications-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track and manage all your applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="applications-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 86, 210, 0.1)' }}>📊</div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Applications</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(244, 180, 0, 0.1)' }}>⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(15, 157, 88, 0.1)' }}>✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(217, 48, 37, 0.1)' }}>❌</div>
          <div className="stat-info">
            <span className="stat-value">{stats.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="applications-filters">
        <div className="filter-search">
          <TextInput
            placeholder="Search by ID or scheme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="🔍"
          />
        </div>
        
        <SelectInput
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' }
          ]}
        />
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        applications.length === 0 ? (
          <NoData
            message="No applications yet"
            description="Start by browsing available schemes"
            actionText="Browse Schemes"
            actionLink="/applicant/schemes"
          />
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No matching applications</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )
      ) : (
        <div className="applications-grid">
          {filteredApplications.map(app => (
            <ApplicationCard key={app.applicationId} application={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
