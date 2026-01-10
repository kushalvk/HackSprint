import React from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ title, statusKey, statusColor, cards, onDrop, onDragOver, onDragStart }) {
  const getStatusColorClass = (color) => {
    const colorMap = {
      'bg-slate-600': 'border-slate-500 bg-slate-800/30',
      'bg-amber-600': 'border-amber-500 bg-amber-900/20',
      'bg-green-600': 'border-green-500 bg-green-900/20',
      'bg-red-600': 'border-red-500 bg-red-900/20'
    };
    return colorMap[color] || 'border-slate-700 bg-slate-800/40';
  };

  return (
    <div className="flex-1 p-4">
      <div className={`border rounded-lg p-4 h-full ${getStatusColorClass(statusColor)}`}>
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
          <h3 className="text-sm font-semibold text-gray-200">{title} <span className="text-xs text-gray-400">({cards.length})</span></h3>
        </div>
        <div
          onDrop={(e) => onDrop(e, statusKey)}
          onDragOver={(e) => onDragOver(e)}
          className="min-h-[40px]"
        >
          {cards.map((card) => (
            <KanbanCard key={card._id} card={card} onDragStart={onDragStart} status={statusKey} />
          ))}
        </div>
      </div>
    </div>
  );
}
