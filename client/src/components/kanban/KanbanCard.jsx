import React from 'react';

const getStatusColor = (status) => {
  switch (status) {
    case 'New':
      return 'bg-slate-600 text-slate-100';
    case 'In Progress':
      return 'bg-amber-600 text-amber-100';
    case 'Repaired':
      return 'bg-green-600 text-green-100';
    case 'Scrap':
      return 'bg-red-600 text-red-100';
    default:
      return 'bg-gray-600 text-gray-100';
  }
};

export default function KanbanCard({ card, onDragStart, status }) {
  const displayTeam = card.team?.teamName || (card.technician ? `${card.technician.firstName}` : 'Unassigned');
  const isTeamAssigned = card.team && !card.technician;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      className="bg-slate-700/40 border border-slate-600 rounded-lg p-3 mb-3 cursor-grab hover:shadow-md hover:shadow-slate-500/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{card.subject}</p>
          <p className="text-xs text-gray-400 mt-1">{card.equipment?.name || 'No equipment'}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getStatusColor(status)}`}>
          {status}
        </div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        {/* Team / Technician */}
        <div>
          <span className={`inline-block px-2 py-1 rounded ${isTeamAssigned ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
            {displayTeam}
          </span>
        </div>
        
        {/* Priority */}
        <div className="text-right">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            card.priority === 'Critical' ? 'bg-red-500/20 text-red-300' :
            card.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
            card.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-green-500/20 text-green-300'
          }`}>
            {card.priority || 'Medium'}
          </span>
        </div>
      </div>

      {/* Scheduled Date */}
      {card.scheduledDate && (
        <p className="text-xs text-gray-400 mt-2">
          📅 {new Date(card.scheduledDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
