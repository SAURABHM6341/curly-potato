/**
 * Sidebar Component
 * Role-based sidebar navigation
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserRole } = useAuth();
  
  const role = getUserRole();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const applicantLinks = [
    { path: '/applicant/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/applicant/schemes', icon: '🎯', label: 'Browse Schemes' },
    { path: '/applicant/applications', icon: '📝', label: 'My Applications' },
    { path: '/applicant/documents', icon: '📁', label: 'Documents' },
    { path: '/applicant/track', icon: '🔍', label: 'Track Status' },
    { path: '/applicant/profile', icon: '👤', label: 'Profile' }
  ];

  const authorityLinks = [
    { path: '/authority/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/authority/pending', icon: '⏳', label: 'Pending Approvals' },
    { path: '/authority/applications', icon: '📋', label: 'All Applications' },
    { path: '/authority/reports', icon: '📈', label: 'Reports' },
    { path: '/authority/profile', icon: '👤', label: 'Profile' }
  ];

  const adminLinks = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/schemes', icon: '🎯', label: 'Manage Schemes' },
    { path: '/admin/users', icon: '👥', label: 'Manage Users' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
  ];

  const links = role === 'authority' ? authorityLinks : role === 'admin' ? adminLinks : applicantLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {links.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`sidebar-item ${isActive(link.path) ? 'sidebar-item-active' : ''}`}
            >
              <span className="sidebar-item-icon">{link.icon}</span>
              <span className="sidebar-item-label">{link.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-info">
          <p className="sidebar-info-title">Need Help?</p>
          <p className="sidebar-info-text">Contact Support</p>
          <a href="mailto:support@gov.in" className="sidebar-info-link">
            support@gov.in
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
