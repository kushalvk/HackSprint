import React from 'react';

export default function KanbanCard({ card, onDragStart }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      className="bg-slate-700/40 border border-slate-600 rounded-lg p-3 mb-3 cursor-grab hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{card.subject}</p>
          <p className="text-xs text-gray-400">{card.equipment?.name || 'No equipment'}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{card.priority || 'Medium'}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-300">
        <div>{card.technician ? `${card.technician.firstName} ${card.technician.lastName}` : 'Unassigned'}</div>
        <div>{card.scheduledDate ? new Date(card.scheduledDate).toLocaleDateString() : ''}</div>
      </div>
    </div>
  );
}
