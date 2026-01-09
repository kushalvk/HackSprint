import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

/**
 * Mock user database - In production, this would come from your backend
 * Users are pre-created by Admin, NO public sign-up allowed
 */
const MOCK_USERS_DATABASE = [
  {
    id: '1',
    name: 'Mahavir Virdha',
    email: 'mahavir@company.com',
    password: 'password123', // In production, never store plaintext passwords
    role: 'admin'
  },
  {
    id: '2',
    name: 'Aryan Manager',
    email: 'aryan@company.com',
    password: 'password123',
    role: 'manager'
  },
  {
    id: '3',
    name: 'Technician One',
    email: 'tech1@company.com',
    password: 'password123',
    role: 'technician'
  },
  {
    id: '4',
    name: 'Technician Two',
    email: 'tech2@company.com',
    password: 'password123',
    role: 'technician'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('authUser');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        localStorage.removeItem('authUser');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Mock login - in production, call your backend API
   * Users can only login with pre-created accounts
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} - User object with role
   */
  const login = async (email, password) => {
    try {
      setError(null);
      
      // Mock API call - simulate backend validation
      // In production, make real API call: POST /api/auth/login
      const user = MOCK_USERS_DATABASE.find(
        u => u.email === email && u.password === password
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Extract user data (exclude password)
      const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role // 'admin', 'manager', or 'technician'
      };

      // Store auth data
      localStorage.setItem('authUser', JSON.stringify(userData));
      localStorage.setItem('token', `token_${user.id}_${Date.now()}`); // Mock token

      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Logout - clear auth state and storage
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    localStorage.removeItem('token');
    setError(null);
  };

  /**
   * Check if user has a specific role
   * @param {string|string[]} allowedRoles - Role or array of roles to check
   * @returns {boolean}
   */
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  /**
   * Get dashboard URL for user's role
   * @returns {string} - Dashboard route for user's role
   */
  const getDashboardUrl = () => {
    if (!user) return '/signin';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'technician':
        return '/technician/dashboard';
      default:
        return '/signin';
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    hasRole,
    getDashboardUrl,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 * @returns {object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};