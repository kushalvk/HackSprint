import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Calendar, Clock } from 'lucide-react';
import MainNavigation from '../components/common/MainNavigation';

export default function TechnicianDashboard({ user, onLogout }) {
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

  // My assigned tasks (filter recentRequests and upcomingMaintenance)
  const userId = user?._id || user?.id || user?.userId;
  const myTasks = (dashboardData?.recentRequests || []).filter(r => r.technician && (r.technician._id === userId || r.technician._id === (userId && String(userId))));
  const upcoming = (dashboardData?.upcomingMaintenance || []).filter(r => r.technician && (r.technician._id === userId || r.technician._id === (userId && String(userId))));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={user} onLogout={onLogout} />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Technician Dashboard</h1>
          <div className="flex items-center space-x-2">
            <button onClick={() => navigate('/maintenance-kanban')} className="px-4 py-2 bg-purple-600 rounded text-white">Open Kanban Board</button>
            <button onClick={() => navigate('/maintenance')} className="px-4 py-2 bg-slate-700 rounded text-white">My Tasks</button>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800/50 p-4 rounded">
            <h3 className="font-semibold mb-2">My Tasks</h3>
            {myTasks.length === 0 ? <p className="text-sm text-gray-400">No tasks assigned.</p> : (
              <ul className="space-y-2">
                {myTasks.map(t => (
                  <li key={t._id} className="p-3 bg-slate-700/30 rounded flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{t.subject}</p>
                      <p className="text-xs text-gray-400">{t.equipment?.name}</p>
                    </div>
                    <div>
                      <button onClick={() => navigate(`/maintenance/${t._id}`)} className="px-3 py-1 bg-cyan-600 rounded text-sm">Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-slate-800/50 p-4 rounded">
            <h3 className="font-semibold mb-2">Upcoming Maintenance</h3>
            {upcoming.length === 0 ? <p className="text-sm text-gray-400">No upcoming jobs.</p> : (
              <ul className="space-y-2">
                {upcoming.map(u => (
                  <li key={u._id} className="p-3 bg-slate-700/30 rounded flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{u.subject}</p>
                      <p className="text-xs text-gray-400">{u.equipment?.name} • {u.scheduledDate ? new Date(u.scheduledDate).toLocaleString() : 'No date'}</p>
                    </div>
                    <div>
                      <button onClick={() => navigate(`/maintenance/${u._id}`)} className="px-3 py-1 bg-cyan-600 rounded text-sm">Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-semibold mb-2">Overdue Jobs</h3>
          <div className="bg-slate-800/50 p-4 rounded">
            {/* Simple list of overdue items assigned to me */}
            {(dashboardData?.recentRequests || []).filter(r => r.status && r.status !== 'Repaired' && r.status !== 'Scrap' && r.technician && (r.technician._id === userId || r.technician._id === (userId && String(userId)))).length === 0 ? (
              <p className="text-sm text-gray-400">No overdue jobs.</p>
            ) : (
              <ul className="space-y-2">
                {(dashboardData?.recentRequests || []).filter(r => r.status && r.status !== 'Repaired' && r.status !== 'Scrap' && r.technician && (r.technician._id === userId || r.technician._id === (userId && String(userId)))).map(o => (
                  <li key={o._id} className="p-3 bg-slate-700/30 rounded flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{o.subject}</p>
                      <p className="text-xs text-gray-400">{o.equipment?.name}</p>
                    </div>
                    <div>
                      <button onClick={() => navigate(`/maintenance/${o._id}`)} className="px-3 py-1 bg-red-600 rounded text-sm">Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
