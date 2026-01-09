import React, { useEffect, useState, useCallback } from 'react';
import KanbanColumn from './KanbanColumn';
import { getAllMaintenanceRequests, updateMaintenanceRequest } from '../../api/maintenance.api';
import MainNavigation from '../common/MainNavigation';

const STATUS_ORDER = [
  { key: 'New', title: 'New' },
  { key: 'In Progress', title: 'In Progress' },
  { key: 'Repaired', title: 'Repaired' },
  { key: 'Scrap', title: 'Scrap' }
];

export default function KanbanBoard({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllMaintenanceRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load requests for kanban', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const onDragStart = (e, card) => {
    setDraggedCard(card);
    try { e.dataTransfer.setData('text/plain', card._id); } catch (e) {}
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    const card = draggedCard;
    if (!card) return;
    if (card.status === newStatus) return;

    // Update UI optimistically
    setRequests(prev => prev.map(r => r._id === card._id ? { ...r, status: newStatus } : r));

    try {
      await updateMaintenanceRequest(card._id, { status: newStatus });

      // Additional scrap logic: if moved to Scrap, mark equipment status if present
      if (newStatus === 'Scrap' && card.equipment && card.equipment._id) {
        // Call equipment API to set status to 'Scrapped' if needed
        try {
          await fetch(`/api/equipment/${card.equipment._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: 'Scrapped' })
          });
        } catch (eqErr) {
          console.error('Failed to mark equipment scrapped', eqErr);
        }
      }
    } catch (err) {
      console.error('Failed to update request status', err);
      // Revert optimistic change
      setRequests(prev => prev.map(r => r._id === card._id ? { ...r, status: card.status } : r));
    } finally {
      setDraggedCard(null);
    }
  };

  const grouped = STATUS_ORDER.reduce((acc, s) => {
    acc[s.key] = requests.filter(r => (r.status || 'New') === s.key);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <MainNavigation user={user} />
      <main className="px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Maintenance Kanban</h1>
          <div className="flex items-center space-x-2">
            <button onClick={fetchRequests} className="px-3 py-2 bg-slate-700 rounded-md">Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <div className="flex gap-4">
            {STATUS_ORDER.map(col => (
              <KanbanColumn
                key={col.key}
                title={col.title}
                statusKey={col.key}
                cards={grouped[col.key] || []}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragStart={onDragStart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
