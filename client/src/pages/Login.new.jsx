import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

/**
 * GearGuard Login Page
 * 
 * Single login page for all roles (Admin, Manager, Technician)
 * - NO public sign-up (users pre-created by Admin)
 * - Fetches user role from stored data after login
 * - Redirects to role-specific dashboard
 * 
 * Mock Users for Testing:
 * - Email: mahavir@company.com / Password: password123 (Admin)
 * - Email: aryan@company.com / Password: password123 (Manager)
 * - Email: tech1@company.com / Password: password123 (Technician)
 */
const Login = () => {
  const navigate = useNavigate();
  const { user, login, error: authError, getDashboardUrl } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate(getDashboardUrl(), { replace: true });
    }
  }, [user, navigate, getDashboardUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        throw new Error('Email is required');
      }
      if (!password.trim()) {
        throw new Error('Password is required');
      }

      // Attempt login
      await login(email, password);
      setSuccess('Login successful! Redirecting...');

      // Redirect is handled by useEffect watching user state
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Animation */}
      <div className="login-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1 className="login-title">GearGuard</h1>
          <p className="login-subtitle">Maintenance Management System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="form-input"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                disabled={loading}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error || authError}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={20} className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Test Credentials Info */}
        <div className="login-info">
          <h3>Test Accounts</h3>
          <div className="test-accounts">
            <div className="test-account">
              <strong>Admin:</strong>
              <div className="credentials">
                <span>mahavir@company.com</span>
                <span>password123</span>
              </div>
            </div>
            <div className="test-account">
              <strong>Manager:</strong>
              <div className="credentials">
                <span>aryan@company.com</span>
                <span>password123</span>
              </div>
            </div>
            <div className="test-account">
              <strong>Technician:</strong>
              <div className="credentials">
                <span>tech1@company.com</span>
                <span>password123</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="login-footer">
          <p>
            No public sign-up available.<br />
            Contact your administrator to create an account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
