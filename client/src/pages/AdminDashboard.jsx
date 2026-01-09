import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Wrench, Users, Calendar, FileText, Search, Plus, TrendingUp, Clock, CheckCircle, ChevronDown, Monitor, Loader, AlertTriangle, RefreshCw, BarChart3, Zap } from 'lucide-react';
import MainNavigation from '../components/common/MainNavigation';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const currentUser = authUser;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef(null);

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoading(true);
      }
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in again.');
        if (isInitial) {
          setLoading(false);
        }
        return;
      }

      // Use relative path so Vite dev server proxy handles the backend URL
      const response = await fetch('/api/analytics/dashboard-data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          localStorage.removeItem('token');
          navigate('/signin');
          return;
        }
        throw new Error(`Failed to fetch dashboard data: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, [navigate]);

  // Fetch data on component mount and set up polling
  useEffect(() => {
    fetchDashboardData(true);

    // Set up polling every 5 seconds for dynamic updates
    intervalRef.current = setInterval(() => {
      fetchDashboardData(false);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchDashboardData]);

  // Filter recent requests based on search term
  const filteredRequests = dashboardData?.recentRequests?.filter(request =>
    request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.technician?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.technician?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get status color for maintenance requests
  const getStatusColor = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'repaired' || s === 'completed') return 'bg-green-500/20 text-green-300';
    if (s === 'in progress' || s === 'in-progress' || s === 'in_progress') return 'bg-blue-500/20 text-blue-300';
    if (s === 'new' || s === 'pending') return 'bg-yellow-500/20 text-yellow-300';
    if (s === 'scrap' || s === 'scrapped') return 'bg-gray-600/20 text-gray-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/20 text-red-300';
      case 'high':
        return 'bg-orange-500/20 text-orange-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-green-500/20 text-green-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
        <MainNavigation user={currentUser} />
        <main className="px-6 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3 text-cyan-400">
              <Loader className="w-6 h-6 animate-spin" />
              <span>Loading dashboard data...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
        <MainNavigation user={currentUser} />
        <main className="px-6 py-6">
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={currentUser} />
      <main className="px-6 py-6">
        {/* Admin Menu Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">System overview and maintenance analytics</p>
        </div>

        {/* Quick Stats Cards - 3 Column */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Critical Equipment - RED */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-900/20 border border-red-500/50 rounded-xl p-6 hover:border-red-400/70 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-300 mb-1">Critical Equipment</p>
                <p className="text-3xl font-bold text-red-300">{dashboardData?.scrappedEquipment ?? 0}</p>
                <p className="text-xs text-red-300 mt-1">Low Health Units</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-xs text-gray-400">Equipment needing attention</p>
          </div>

          {/* Technician Load - BLUE */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/20 border border-blue-500/50 rounded-xl p-6 hover:border-blue-400/70 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-300 mb-1">Technician Load</p>
                <p className="text-3xl font-bold text-blue-300">{dashboardData?.technicianUtilization ?? 0}%</p>
                <p className="text-xs text-blue-300 mt-1">Utilized (Assign Carefully)</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Current workload allocation</p>
          </div>

          {/* Open Requests - GREEN */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/20 border border-emerald-500/50 rounded-xl p-6 hover:border-emerald-400/70 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-300 mb-1">Open Requests</p>
                <p className="text-3xl font-bold text-emerald-300">{dashboardData?.pendingRequests ?? 0}</p>
                <p className="text-xs text-emerald-300 mt-1">{dashboardData?.overdueRequests ?? 0} Overdue</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="text-xs text-gray-400">Pending maintenance work</p>
          </div>
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
            <p className="text-xs text-gray-400 mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-cyan-300">{dashboardData?.totalRequests ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-emerald-500/50 transition-all">
            <p className="text-xs text-gray-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-emerald-300">{dashboardData?.completedRequests ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total repaired</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-all">
            <p className="text-xs text-gray-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-300">{dashboardData?.inProgressRequests ?? 0}</p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 hover:border-orange-500/50 transition-all">
            <p className="text-xs text-gray-400 mb-1">Equipment Health</p>
            <p className="text-2xl font-bold text-orange-300">{dashboardData?.equipmentHealth ?? 100}%</p>
            <p className="text-xs text-gray-500 mt-1">Operational rate</p>
          </div>
        </div>

        {/* Maintenance Requests Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Maintenance Requests</h2>
              <p className="text-sm text-gray-400 mt-1">
                Showing {filteredRequests.length} of {dashboardData?.recentRequests?.length || 0} requests
              </p>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Technician</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => navigate(`/maintenance/${item._id}`)}>
                      <td className="px-6 py-4 text-sm text-gray-300 font-medium">{item.subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.status)}`}>
                          {item.status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {item.technician ? `${item.technician.firstName} ${item.technician.lastName}` : 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.category || 'General'}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{item.company || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority || 'Medium'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                      {searchTerm ? 'No requests found matching your search.' : 'No maintenance requests found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Tools Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <button onClick={() => navigate('/users')} className="p-4 bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 rounded-lg text-left transition-all group">
            <Users className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm">Manage Users</p>
            <p className="text-xs text-gray-400 mt-1">Add, edit, or remove users</p>
          </button>
          <button onClick={() => navigate('/teams')} className="p-4 bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 rounded-lg text-left transition-all group">
            <Wrench className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm">Manage Teams</p>
            <p className="text-xs text-gray-400 mt-1">Organize and manage teams</p>
          </button>
          <button onClick={() => navigate('/equipment')} className="p-4 bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 rounded-lg text-left transition-all group">
            <BarChart3 className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm">Manage Equipment</p>
            <p className="text-xs text-gray-400 mt-1">Total: {dashboardData?.totalEquipment ?? 0} units</p>
          </button>
          <button onClick={() => navigate('/reporting')} className="p-4 bg-slate-800/50 border border-slate-700 hover:border-orange-500/50 rounded-lg text-left transition-all group">
            <FileText className="w-5 h-5 text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="font-semibold text-sm">View Reports</p>
            <p className="text-xs text-gray-400 mt-1">Total Requests: {dashboardData?.totalRequests ?? 0}</p>
          </button>
        </div>
      </main>
    </div>
  );
}
