/**
 * Navbar Component
 * Top navigation bar with user profile and logout
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, getUserRole } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = getUserRole();
  const displayName = user?.name || user?.designationName || 'User';
  const displayId = user?.loginUserId || user?.designation || '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Title */}
        <div className="navbar-brand" onClick={() => navigate(`/${role}/dashboard`)}>
          <div className="navbar-logo">🏛️</div>
          <div className="navbar-title">
            <h1 className="navbar-name">PCR PoA Portal</h1>
            <p className="navbar-subtitle">Direct Benefit Transfer</p>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          <div className="navbar-user">
            <div className="navbar-user-info">
              <p className="navbar-user-name">{displayName}</p>
              <p className="navbar-user-id">{displayId}</p>
            </div>
            <button
              className="navbar-user-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {displayName.charAt(0).toUpperCase()}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="navbar-dropdown">
                <button
                  className="navbar-dropdown-item"
                  onClick={() => {
                    navigate(`/${role}/profile`);
                    setShowDropdown(false);
                  }}
                >
                  👤 Profile
                </button>
                <button
                  className="navbar-dropdown-item"
                  onClick={() => {
                    navigate(`/${role}/dashboard`);
                    setShowDropdown(false);
                  }}
                >
                  📊 Dashboard
                </button>
                <hr className="navbar-dropdown-divider" />
                <button
                  className="navbar-dropdown-item navbar-dropdown-logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="navbar-mobile-menu">
          <div className="navbar-mobile-user">
            <div className="navbar-user-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="navbar-user-name">{displayName}</p>
              <p className="navbar-user-id">{displayId}</p>
            </div>
          </div>
          <hr className="navbar-mobile-divider" />
          <button
            className="navbar-mobile-item"
            onClick={() => {
              navigate(`/${role}/profile`);
              setShowMobileMenu(false);
            }}
          >
            👤 Profile
          </button>
          <button
            className="navbar-mobile-item"
            onClick={() => {
              navigate(`/${role}/dashboard`);
              setShowMobileMenu(false);
            }}
          >
            📊 Dashboard
          </button>
          <button
            className="navbar-mobile-item navbar-mobile-logout"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
