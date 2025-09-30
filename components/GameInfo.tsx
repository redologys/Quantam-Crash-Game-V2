
import React from 'react';

interface GameInfoProps {
  balance: number;
  betAmount: number;
  roundHash: string;
  jackpotAmount: number;
  onInfoClick: () => void;
  onSettingsClick: () => void;
}

const InfoItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className }) => (
    <div className={`text-right ${className}`}>
        <div className="text-xs text-cyber-text/70">{label}</div>
        <div className="text-lg font-bold">{value}</div>
    </div>
);

export const GameInfo: React.FC<GameInfoProps> = ({ balance, betAmount, roundHash, jackpotAmount, onInfoClick, onSettingsClick }) => {
  return (
    <div className="bg-cyber-surface/50 border border-cyber-border rounded-lg p-3 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-cyber-cyan animate-pulse">Quantum De-Cryption</h1>
        <p className="text-sm text-cyber-magenta">Split your risk. Beat the trace.</p>
      </div>
      <div className="flex items-center space-x-4">
        <InfoItem label="Jackpot" value={jackpotAmount.toFixed(2)} className="text-cyber-magenta" />
        <InfoItem label="Balance" value={balance.toFixed(2)} className="text-cyber-green" />
        <InfoItem label="Current Bet" value={betAmount.toFixed(2)} className="text-cyber-yellow" />
        <div className="text-right">
            <div className="text-xs text-cyber-text/70">Round Hash</div>
            <div className="text-lg font-bold truncate max-w-[120px]">{roundHash}</div>
        </div>
        <button onClick={onInfoClick} className="text-cyber-text hover:text-cyber-cyan transition-colors" aria-label="Provably Fair Info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
        <button onClick={onSettingsClick} className="text-cyber-text hover:text-cyber-magenta transition-colors" aria-label="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
    </div>
  );
};