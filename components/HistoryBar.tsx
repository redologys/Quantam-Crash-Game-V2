
import React from 'react';
import type { HistoryEntry } from '../types';

interface HistoryBarProps {
  history: HistoryEntry[];
  onHistoryClick: (entry: HistoryEntry) => void;
}

const HistoryItem: React.FC<{ item: HistoryEntry, onClick: () => void }> = ({ item, onClick }) => {
    const multiplier = item.crashMultiplier;
    const colorClass = multiplier < 1.5 ? 'text-cyber-red' : multiplier < 5 ? 'text-cyber-yellow' : 'text-cyber-cyan';

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-2 rounded-md border border-cyber-border bg-cyber-surface w-24 text-center text-xs transition-all duration-200 hover:border-cyber-cyan hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyber-cyan`}
            aria-label={`View details for round with crash multiplier ${multiplier.toFixed(2)}x`}
        >
            <span className={`font-bold text-lg ${colorClass}`}>
                {multiplier.toFixed(2)}x
            </span>
            <span className="text-cyber-text/60 truncate w-full mt-1">{item.id.substring(0, 10)}...</span>
        </button>
    );
};

export const HistoryBar: React.FC<HistoryBarProps> = ({ history, onHistoryClick }) => {
  return (
    <div className="bg-cyber-surface/50 border border-cyber-border rounded-lg p-2">
      <h3 className="text-sm font-bold text-cyber-yellow mb-2 pl-1">[PAST_ROUNDS]</h3>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {history.length === 0 && <p className="text-cyber-text/70 text-sm">No rounds played yet.</p>}
        {history.map((item) => (
          <HistoryItem key={item.id} item={item} onClick={() => onHistoryClick(item)} />
        ))}
      </div>
    </div>
  );
};