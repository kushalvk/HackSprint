import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Monitor, FileText } from 'lucide-react';
import MainNavigation from '../components/common/MainNavigation';

export default function AdminDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/analytics/dashboard-data', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={user} onLogout={onLogout} />
      <main className="p-6">Loading...</main>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={user} onLogout={onLogout} />
      <main className="p-6">Error: {error}</main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={user} onLogout={onLogout} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/equipment')} className="px-4 py-2 bg-slate-700 rounded text-white">Equipment</button>
            <button onClick={() => navigate('/teams')} className="px-4 py-2 bg-slate-700 rounded text-white">Teams</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded">
            <h3 className="text-sm text-gray-400">Total Equipment</h3>
            <p className="text-2xl font-bold">{dashboardData?.totalEquipment ?? 0}</p>
            <p className="text-xs text-gray-400">Scrapped: {dashboardData?.scrappedEquipment ?? 0}</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded">
            <h3 className="text-sm text-gray-400">Total Requests</h3>
            <p className="text-2xl font-bold">{dashboardData?.totalRequests ?? 0}</p>
            <p className="text-xs text-gray-400">Pending: {dashboardData?.pendingRequests ?? 0}</p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded">
            <h3 className="text-sm text-gray-400">Reports</h3>
            <p className="text-2xl font-bold">&nbsp;</p>
            <button onClick={() => navigate('/reporting')} className="px-3 py-1 bg-cyan-600 rounded text-white">Open Reports</button>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="font-semibold mb-2">Admin Tools</h3>
          <div className="space-x-2">
            <button onClick={() => navigate('/teams')} className="px-3 py-1 bg-slate-700 rounded text-white">Manage Teams</button>
            <button onClick={() => navigate('/users')} className="px-3 py-1 bg-slate-700 rounded text-white">Manage Users</button>
            <button onClick={() => navigate('/equipment')} className="px-3 py-1 bg-slate-700 rounded text-white">Manage Equipment</button>
          </div>
        </section>
      </main>
    </div>
  );
}
