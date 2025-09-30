
import React from 'react';
import type { ProvablyFairData } from '../types';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProvablyFairData;
}

const SeedDisplay: React.FC<{ label: string, value: string, revealed?: boolean }> = ({ label, value, revealed = true }) => (
    <div>
        <label className="text-sm font-bold text-cyber-yellow block">{label}</label>
        <div className="bg-cyber-bg border border-cyber-border rounded p-2 mt-1 text-sm break-all">
            {revealed ? (value || 'N/A') : 'Hidden until round end'}
        </div>
    </div>
);

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        onClick={onClose}
    >
      <div 
        className="bg-cyber-surface border-2 border-cyber-magenta rounded-lg p-6 w-full max-w-2xl text-cyber-text relative animate-pulse"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-cyber-text hover:text-cyber-red">&times;</button>
        <h2 className="text-2xl font-bold text-cyber-magenta mb-4">Provably Fair System</h2>
        <p className="mb-4 text-sm">
            The outcome of each round is determined by a combination of a server seed, a client seed, and a nonce. The server seed hash is shown before the round starts. After the round, the server seed is revealed, and you can verify that it matches the hash.
        </p>
        <div className="space-y-4">
            <SeedDisplay label="Server Seed Hash" value={data.serverSeedHash} />
            <SeedDisplay label="Server Seed" value={data.serverSeed} revealed={!!data.serverSeed} />
            <SeedDisplay label="Client Seed" value={data.clientSeed} />
            <div>
                 <label className="text-sm font-bold text-cyber-yellow block">Nonce</label>
                 <div className="bg-cyber-bg border border-cyber-border rounded p-2 mt-1 text-sm">{data.nonce}</div>
            </div>
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-cyber-magenta/80 hover:bg-cyber-magenta text-cyber-bg font-bold py-2 px-4 rounded">
            CLOSE
        </button>
      </div>
    </div>
  );
};
