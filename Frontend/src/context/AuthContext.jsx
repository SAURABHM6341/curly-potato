/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Always validate with backend first (session-based auth)
      const response = await authAPI.getSession();
      
      if (response.data && response.data.success) {
        const sessionData = response.data;
        
        // Determine if user or authority based on sessionType
        if (sessionData.sessionType === 'authority' && sessionData.authority) {
          setUser({
            ...sessionData.authority,
            role: 'authority',
            isAuthority: true
          });
        } else if (sessionData.sessionType === 'user' && sessionData.user) {
          setUser({
            ...sessionData.user,
            role: 'applicant',
            isAuthority: false
          });
        }
        
        setIsAuthenticated(true);
        
        // Sync with localStorage for offline fallback
        localStorage.setItem('user', JSON.stringify(sessionData));
      } else {
        // No valid session - just clear state, don't call logout API
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('tempToken');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      
      // Don't logout on network errors - just clear authenticated state
      // This prevents auto-logout on temporary network issues or CORS problems
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, tempToken = null) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Only store temporary tokens (used during signup flow)
      if (tempToken) {
        localStorage.setItem('tempToken', tempToken);
      }
      
      // Don't immediately call checkAuth after login to avoid race condition
      // The user data is already set from the login response
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to destroy session
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if backend call fails
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('tempToken');
    }
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Get user role and permissions
  const getUserRole = () => {
    if (!user) return null;
    
    // Role is directly stored from session data
    if (user.role) return user.role;
    
    // Fallback: Determine role based on user data structure
    if (user.authorityId || user.designation) {
      return 'authority';
    }
    if (user.isAdmin || user.accessLevel === 5) {
      return 'admin';
    }
    return 'applicant';
  };

  // Check if user has authority access
  const isAuthority = () => {
    return user?.isAuthority === true || getUserRole() === 'authority';
  };

  // Check access level for authorities
  const hasAccessLevel = (requiredLevel) => {
    if (!isAuthority()) return false;
    return user?.accessLevel >= requiredLevel;
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    getUserRole,
    isAuthority,
    hasAccessLevel,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
