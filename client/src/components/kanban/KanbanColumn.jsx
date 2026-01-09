import React from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({ title, statusKey, cards, onDrop, onDragOver, onDragStart }) {
  return (
    <div className="flex-1 p-4">
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4 h-full">
        <h3 className="text-sm font-semibold text-gray-200 mb-3">{title} <span className="text-xs text-gray-400">({cards.length})</span></h3>
        <div
          onDrop={(e) => onDrop(e, statusKey)}
          onDragOver={(e) => onDragOver(e)}
          className="min-h-[40px]"
        >
          {cards.map((card) => (
            <KanbanCard key={card._id} card={card} onDragStart={onDragStart} />
          ))}
        </div>
      </div>
    </div>
  );
}
