import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Enforces role-based access control (RBAC) for routes.
 * If a user tries to access a route they don't have permission for,
 * they are redirected to their own dashboard (NOT a common dashboard).
 * 
 * @param {React.ReactNode} children - Component to render if authorized
 * @param {string|string[]} allowedRoles - Role(s) that can access this route
 * 
 * @example
 * <ProtectedRoute allowedRoles={['admin']}>
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * @example
 * <ProtectedRoute allowedRoles={['technician', 'manager']}>
 *   <KanbanBoard />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, getDashboardUrl } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // No roles specified - allow all authenticated users
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  const hasAccess = Array.isArray(allowedRoles)
    ? allowedRoles.includes(user?.role)
    : user?.role === allowedRoles;

  // User doesn't have required role - redirect to their dashboard
  if (!hasAccess) {
    return <Navigate to={getDashboardUrl()} replace />;
  }

  // User has required role - render component
  return children;
};

export default ProtectedRoute;
