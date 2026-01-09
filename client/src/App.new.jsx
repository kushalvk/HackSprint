import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth
import Login from './pages/Login.new';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import RoleBasedNavigation from './components/routes/RoleBasedNavigation';

// Pages - Auth
import Landing from './pages/Landing';

// Pages - Dashboards
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

// Pages - Admin
import Users from './pages/Users';
import Teams from './pages/Teams';
import Equipment from './pages/Equipment';

// Pages - Manager
import MaintenanceCalendar from './pages/MaintenanceCalendar';
import Reporting from './pages/Reporting';

// Pages - Technician
import KanbanBoard from './components/kanban/KanbanBoard';

// Pages - Shared (if needed by multiple roles)
import Profile from './pages/Profile';
import Maintenance from './pages/Maintenance';
import CreateMaintenanceRequest from './pages/CreateMaintenanceRequest';
import Activity from './pages/Activity';
import WorkCenter from './pages/WorkCenter';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';

/**
 * Layout Wrapper with Navigation
 * Only shown when user is authenticated
 */
const AuthenticatedLayout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return children;
  }

  return (
    <div className="authenticated-layout">
      <RoleBasedNavigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

/**
 * App Component
 * 
 * Core routing structure with role-based access control:
 * - Admin routes (/admin/*)
 * - Manager routes (/manager/*)
 * - Technician routes (/technician/*)
 * 
 * Unauthenticated routes:
 * - /signin (Login page)
 * - / (Landing page)
 */
function App() {
  const { isAuthenticated } = useAuth();

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
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* ======================== */}
        {/* ADMIN ROUTES */}
        {/* ======================== */}
        <Route
          path="/admin/dashboard"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/admin/teams"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['admin']}>
                <Teams />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/admin/equipment"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['admin']}>
                <Equipment />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['admin']}>
                <Reporting />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />

        {/* ======================== */}
        {/* MANAGER ROUTES */}
        {/* ======================== */}
        <Route
          path="/manager/dashboard"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/manager/calendar"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['manager']}>
                <MaintenanceCalendar />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/manager/equipment"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['manager']}>
                <Equipment />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['manager']}>
                <Reporting />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />

        {/* ======================== */}
        {/* TECHNICIAN ROUTES */}
        {/* ======================== */}
        <Route
          path="/technician/dashboard"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['technician']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/technician/kanban"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['technician']}>
                <KanbanBoard />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/technician/tasks"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute allowedRoles={['technician']}>
                <Maintenance />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />

        {/* ======================== */}
        {/* SHARED ROUTES */}
        {/* (Accessible by any authenticated user) */}
        {/* ======================== */}
        <Route
          path="/profile"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />
        <Route
          path="/activity"
          element={
            <AuthenticatedLayout>
              <ProtectedRoute>
                <Activity />
              </ProtectedRoute>
            </AuthenticatedLayout>
          }
        />

        {/* Catch-all: redirect unknown routes to login if not authenticated, else to dashboard */}
        <Route
          path="*"
          element={
            isAuthenticated ? <Navigate to={useAuth().getDashboardUrl()} replace /> : <Navigate to="/signin" replace />
          }
        />
      </Routes>
    </>
  );
}

export default App;
