import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import all your page components
import LandingPage from './pages/Landing';
// SignUp route disabled - user accounts must be created by Admin
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

// Your PrivateRoute component remains the same
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return children;
  }
  return <Navigate to="/signin" />;
};

// RoleRoute: restrict access based on roles array
const RoleRoute = ({ children, allowedRoles = [], user }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/signin" />;
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // redirect unauthorized to general dashboard
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// Landing route that redirects authenticated users to dashboard
const LandingRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};


function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');

      if (urlToken) {
        // Token from OAuth redirect
        localStorage.setItem('token', urlToken);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const finalToken = urlToken || token;

      if (finalToken) {
        try {
          const response = await fetch('http://localhost:5000/api/profile/me', {
            headers: {
              'Authorization': `Bearer ${finalToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Handle unauthorized or other errors
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

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
        {/* The LandingPage component is now used for the root path */}
        <Route path="/" element={<LandingRoute><LandingPage /></LandingRoute>} />

        {/* Your other routes remain the same */}
        {/* Public signup disabled: accounts must be created by Admin */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* Role-aware dashboards */}
        <Route
          path="/dashboard"
          element={<PrivateRoute><ManagerDashboard user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/admin"
          element={<PrivateRoute><RoleRoute user={user} allowedRoles={[ 'admin' ]}><AdminDashboard user={user} onLogout={handleLogout} /></RoleRoute></PrivateRoute>}
        />
        <Route
          path="/admin/users"
          element={<PrivateRoute><RoleRoute user={user} allowedRoles={[ 'admin' ]}><Users user={user} onLogout={handleLogout} /></RoleRoute></PrivateRoute>}
        />
        <Route
          path="/technician"
          element={<PrivateRoute><RoleRoute user={user} allowedRoles={[ 'technician' ]}><TechnicianDashboard user={user} onLogout={handleLogout} /></RoleRoute></PrivateRoute>}
        />
        <Route
          path="/maintenance"
          element={<PrivateRoute><Maintenance user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/maintenance/new"
          element={<PrivateRoute><CreateMaintenanceRequest user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/maintenance/edit/:id"
          element={<PrivateRoute><CreateMaintenanceRequest user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/reporting"
          element={<PrivateRoute><Reporting user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={<PrivateRoute user={user} onLogout={handleLogout}><Profile user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/activity"
          element={<PrivateRoute user={user} onLogout={handleLogout}><ActivityPage /></PrivateRoute>}
        />
        <Route
          path="/equipment"
          element={<PrivateRoute><Equipment user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/teams"
          element={<PrivateRoute><Teams user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/workcenter"
          element={<PrivateRoute><WorkCenter user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/maintenance-calendar"
          element={<PrivateRoute><MaintenanceCalendar user={user} onLogout={handleLogout} /></PrivateRoute>}
        />
        <Route
          path="/maintenance-kanban"
          element={<PrivateRoute><RoleRoute user={user} allowedRoles={[ 'technician', 'manager' ]}><KanbanBoard user={user} onLogout={handleLogout} /></RoleRoute></PrivateRoute>}
        />

        {/* A catch-all route to redirect unknown paths back to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
