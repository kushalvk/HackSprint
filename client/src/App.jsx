import React, { useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';

// Import all your page components
import LandingPage from './pages/Landing';
import SignIn from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import Maintenance from './pages/Maintenance';
import CreateMaintenanceRequest from './pages/CreateMaintenanceRequest';
import Reporting from './pages/Reporting';
import Profile from './pages/Profile';
import ActivityPage from './pages/Activity';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import VerifyOtp from './pages/VerifyOtp';
import Equipment from './pages/Equipment';
import Teams from './pages/Teams';
import WorkCenter from './pages/WorkCenter';
import MaintenanceCalendar from './pages/MaintenanceCalendar';
import KanbanBoard from './components/kanban/KanbanBoard';
import Header from './components/common/Navbar';
import Users from './pages/Users';

/**
 * LandingRoute: redirect authenticated users to their role-specific dashboard
 */
const LandingRoute = ({ children }) => {
  const { isAuthenticated, getDashboardUrl } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={getDashboardUrl()} replace />;
  }
  return children;
};

/**
 * DashboardRoute: redirect to role-specific dashboard based on user role
 */
const DashboardRoute = () => {
  const { user, getDashboardUrl } = useAuth();
  return <Navigate to={getDashboardUrl()} replace />;
};

function App() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-gray-100">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/" element={<LandingRoute><LandingPage /></LandingRoute>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ==================== ROLE-BASED DASHBOARDS ==================== */}
        
        {/* Admin Dashboard - ONLY for admins */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Manager Dashboard - ONLY for managers */}
        <Route
          path="/manager-dashboard"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ManagerDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Technician Dashboard - ONLY for technicians */}
        <Route
          path="/technician-dashboard"
          element={
            <ProtectedRoute allowedRoles={['technician']}>
              <TechnicianDashboard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Generic dashboard - redirects to role-specific dashboard */}
        <Route path="/dashboard" element={<DashboardRoute />} />

        {/* ==================== TECHNICIAN ROUTES ==================== */}
        
        {/* Kanban Board - Technician & Manager only */}
        <Route
          path="/maintenance-kanban"
          element={
            <ProtectedRoute allowedRoles={['technician', 'manager']}>
              <KanbanBoard user={user} />
            </ProtectedRoute>
          }
        />

        {/* Maintenance List */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <Maintenance user={user} />
            </ProtectedRoute>
          }
        />

        {/* ==================== MAINTENANCE ROUTES ==================== */}

        {/* Create Maintenance Request - Manager & Admin only */}
        <Route
          path="/maintenance/new"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <CreateMaintenanceRequest user={user} />
            </ProtectedRoute>
          }
        />

        {/* Edit Maintenance Request - Manager & Admin only */}
        <Route
          path="/maintenance/edit/:id"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <CreateMaintenanceRequest user={user} />
            </ProtectedRoute>
          }
        />

        {/* View Maintenance Request - All authenticated users */}
        <Route
          path="/maintenance/:id"
          element={
            <ProtectedRoute>
              <Maintenance user={user} />
            </ProtectedRoute>
          }
        />

        {/* ==================== ADMIN ROUTES ==================== */}

        {/* Users Management - Admin only */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users user={user} />
            </ProtectedRoute>
          }
        />

        {/* Teams Management - Admin & Manager */}
        <Route
          path="/teams"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Teams user={user} />
            </ProtectedRoute>
          }
        />

        {/* Equipment Management - Admin & Manager */}
        <Route
          path="/equipment"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Equipment user={user} />
            </ProtectedRoute>
          }
        />

        {/* Work Center - Admin & Manager */}
        <Route
          path="/workcenter"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <WorkCenter user={user} />
            </ProtectedRoute>
          }
        />

        {/* ==================== MANAGER/ADMIN ROUTES ==================== */}

        {/* Maintenance Calendar - Manager & Admin */}
        <Route
          path="/maintenance-calendar"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <MaintenanceCalendar user={user} />
            </ProtectedRoute>
          }
        />

        {/* Reports - Manager & Admin */}
        <Route
          path="/reporting"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <Reporting user={user} />
            </ProtectedRoute>
          }
        />

        {/* ==================== USER ROUTES (ALL ROLES) ==================== */}

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile user={user} />
            </ProtectedRoute>
          }
        />

        {/* Activity */}
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityPage />
            </ProtectedRoute>
          }
        />

        {/* ==================== CATCH-ALL ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
