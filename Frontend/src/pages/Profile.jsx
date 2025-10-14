/**
 * User Profile Page
 * Display and edit user profile information
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import TextInput from '../components/Input/TextInput';
import PrimaryButton from '../components/Button/PrimaryButton';
import SecondaryButton from '../components/Button/SecondaryButton';
import Spinner from '../components/Loader/Spinner';
import './Profile.css';

function Profile() {
  const { user, updateUser } = useAuth();
  const { setToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await userAPI.updateProfile(profileData);
      
      if (response.data.success) {
        updateUser(response.data.user);
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setEditing(false);
      }
    } catch (error) {
      setToast({ 
        message: error.response?.data?.error || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      name: user.name || '',
      mobile: user.mobile || '',
      email: user.email || '',
      address: user.address || ''
    });
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <Spinner />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Personal Information</h2>
            {!editing && (
              <SecondaryButton 
                onClick={() => setEditing(true)}
                disabled={loading}
              >
                Edit Profile
              </SecondaryButton>
            )}
          </div>

          <div className="profile-form">
            <div className="profile-field">
              <label>User ID</label>
              <div className="profile-field-value readonly">
                {user.loginUserId || 'N/A'}
              </div>
            </div>

            <TextInput
              label="Full Name"
              value={profileData.name}
              onChange={(value) => handleInputChange('name', value)}
              disabled={!editing || loading}
              required
            />

            <TextInput
              label="Mobile Number"
              value={profileData.mobile}
              onChange={(value) => handleInputChange('mobile', value)}
              disabled={true} // Mobile cannot be changed
              helperText="Mobile number cannot be changed"
            />

            <TextInput
              label="Email Address"
              type="email"
              value={profileData.email}
              onChange={(value) => handleInputChange('email', value)}
              disabled={!editing || loading}
              placeholder="Enter your email address"
            />

            <TextInput
              label="Address"
              value={profileData.address}
              onChange={(value) => handleInputChange('address', value)}
              disabled={!editing || loading}
              placeholder="Enter your address"
              multiline
              rows={3}
            />

            {editing && (
              <div className="profile-actions">
                <PrimaryButton
                  onClick={handleSave}
                  loading={loading}
                  disabled={!profileData.name.trim()}
                >
                  Save Changes
                </PrimaryButton>
                <SecondaryButton
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </SecondaryButton>
              </div>
            )}
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h2>Account Information</h2>
          </div>
          
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-label">Account Status</span>
              <span className={`profile-stat-value ${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="profile-stat">
              <span className="profile-stat-label">Verification Status</span>
              <span className={`profile-stat-value ${user.isVerified ? 'verified' : 'pending'}`}>
                {user.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            
            <div className="profile-stat">
              <span className="profile-stat-label">Last Login</span>
              <span className="profile-stat-value">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;