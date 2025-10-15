/**
 * PendingApprovals Page
 * View and manage pending applications
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorityAPI } from '../../utils/api';
import ApplicationCard from '../../components/Cards/ApplicationCard';
import SelectInput from '../../components/Input/SelectInput';
import TextInput from '../../components/Input/TextInput';
import Spinner from '../../components/Loader/Spinner';
import NoData from '../../components/EmptyState/NoData';
import { useToast } from '../../context/ToastContext';
import { FaSearch } from 'react-icons/fa';
import './PendingApprovals.css';

const PendingApprovals = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    setLoading(true);
    try {
      // Don't pass status filter - get only pending applications
      const response = await authorityAPI.getPendingApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast('Failed to load applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = 
        app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.schemeName && app.schemeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.applicantName && app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.submittedAt) - new Date(a.submittedAt);
        case 'oldest':
          return new Date(a.submittedAt) - new Date(b.submittedAt);
        case 'urgent':
          const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          return (urgencyOrder[a.applicationData?.urgency] || 2) - (urgencyOrder[b.applicationData?.urgency] || 2);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="pending-approvals-loading">
        <Spinner />
        <p>Loading pending applications...</p>
      </div>
    );
  }

  return (
    <div className="pending-approvals-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pending Approvals</h1>
          <p className="page-subtitle">
            {applications.length} application{applications.length !== 1 ? 's' : ''} waiting for review
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="approvals-controls">
        <div className="approvals-search">
          <TextInput
            placeholder="Search by ID, scheme, or applicant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<FaSearch />}
          />
        </div>
        
        <SelectInput
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={[
            { value: 'recent', label: 'Most Recent' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'urgent', label: 'By Urgency' }
          ]}
        />
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        applications.length === 0 ? (
          <NoData
            message="No pending applications"
            description="All applications have been reviewed. Great work!"
          />
        ) : (
          <div className="no-results">
            <div className="no-results-icon"><FaSearch /></div>
            <h3>No matching applications</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )
      ) : (
        <div className="approvals-grid">
          {filteredApplications.map(app => (
            <ApplicationCard
              key={app.applicationId}
              application={app}
              onAction={(app) => navigate(`/authority/review/${app.applicationId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
