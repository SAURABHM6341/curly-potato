/**
 * Sidebar Component
 * Role-based sidebar navigation
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaChartBar, 
  FaBullseye, 
  FaFileAlt, 
  FaFolder, 
  FaUser, 
  FaCheck, 
  FaClock, 
  FaClipboardList, 
  FaChartLine, 
  FaUsers, 
  FaCog 
} from 'react-icons/fa';
import './Layout.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getUserRole, user } = useAuth();
  
  const role = getUserRole();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const applicantLinks = [
    { path: '/applicant/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/applicant/schemes', icon: <FaBullseye />, label: 'Browse Schemes' },
    { path: '/applicant/applications', icon: <FaFileAlt />, label: 'My Applications' },
    { path: '/applicant/documents', icon: <FaFolder />, label: 'Documents' },
    { path: '/applicant/profile', icon: <FaUser />, label: 'Profile' }
  ];

  // Authority links based on access level
  const getAuthorityLinks = () => {
    const baseLinks = [
      { path: '/authority/dashboard', icon: <FaChartBar />, label: 'Dashboard', minLevel: 1 }
    ];

    // Data Verification for Level 1-2 (Data Entry Operators)
    if (user?.accessLevel <= 2) {
      baseLinks.push(
        { path: '/authority/data-verification', icon: <FaCheck />, label: 'Data Verification', minLevel: 1 }
      );
    }

    // Add links based on access level
    if (user?.accessLevel >= 3) {
      baseLinks.push(
        { path: '/authority/pending', icon: <FaClock />, label: 'Pending Approvals', minLevel: 3 },
        { path: '/authority/applications', icon: <FaClipboardList />, label: 'All Applications', minLevel: 3 }
      );
    }

    if (user?.accessLevel >= 4) {
      baseLinks.push(
        { path: '/authority/reports', icon: <FaChartLine />, label: 'Reports', minLevel: 4 }
      );
    }

    baseLinks.push(
      { path: '/authority/profile', icon: <FaUser />, label: 'Profile', minLevel: 1 }
    );

    return baseLinks.filter(link => !link.minLevel || (user?.accessLevel >= link.minLevel));
  };

  const authorityLinks = getAuthorityLinks();

  const adminLinks = [
    { path: '/admin/dashboard', icon: <FaChartBar />, label: 'Dashboard' },
    { path: '/admin/schemes', icon: <FaBullseye />, label: 'Manage Schemes' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Manage Users' },
    { path: '/admin/reports', icon: <FaChartLine />, label: 'Reports' },
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' }
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
