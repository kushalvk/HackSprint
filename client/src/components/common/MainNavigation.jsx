import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Users, Calendar, FileText, Monitor, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MainNavigation = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, getDashboardUrl } = useAuth();
  const [showEquipmentDropdown, setShowEquipmentDropdown] = useState(false);

  // Get user role, normalize to lowercase
  const role = user && user.role ? user.role.toLowerCase() : 'manager';

  /**
   * Define navigation items based on user role
   */
  const getNavItems = () => {
    switch (role) {
      case 'technician':
        return [
          { name: 'Dashboard', path: '/technician-dashboard', icon: null },
          { name: 'Kanban', path: '/maintenance-kanban', icon: Wrench },
          { name: 'My Tasks', path: '/maintenance', icon: null }
        ];
      
      case 'manager':
        return [
          { name: 'Dashboard', path: '/manager-dashboard', icon: null },
          { name: 'Calendar', path: '/maintenance-calendar', icon: Calendar },
          { name: 'Equipment', path: '/equipment', icon: Monitor },
          { name: 'Reports', path: '/reporting', icon: FileText }
        ];
      
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin-dashboard', icon: null },
          { name: 'Users', path: '/users', icon: Users },
          { name: 'Teams', path: '/teams', icon: Users },
          { name: 'Equipment', path: '/equipment', icon: Monitor },
          { name: 'Reports', path: '/reporting', icon: FileText }
        ];
      
      default:
        return [
          { name: 'Dashboard', path: getDashboardUrl(), icon: null }
        ];
    }
  };

  const navItems = getNavItems();

  /**
   * Get current active tab based on pathname
   */
  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => item.path === currentPath);
    return activeItem ? activeItem.name : 'Dashboard';
  };

  const activeTab = getActiveTab();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                GearGuard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-cyan-400 transition-all cursor-pointer"
                title="View Profile"
              >
                {user ? (user.name ? user.name.charAt(0).toUpperCase() : user.firstName?.charAt(0).toUpperCase() || 'U') : 'U'}
              </button>
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-red-400 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900/30 backdrop-blur-sm border-b border-slate-700">
        <div className="px-6">
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`px-4 py-3 font-medium transition-all flex items-center space-x-1 ${
                  activeTab === item.name
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MainNavigation;