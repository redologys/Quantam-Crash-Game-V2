
export enum GamePhase {
  LOBBY = 'LOBBY',
  BETTING = 'BETTING',
  RUNNING = 'RUNNING',
  ENDED = 'ENDED',
}

export enum SideBetOption {
    NONE = 'NONE',
    UNDER_2X = 'UNDER_2X',
    BETWEEN_3_5X = 'BETWEEN_3_5X',
    ABOVE_10X = 'ABOVE_10X',
}

export interface RoundState {
  multiplier: number;
  crashed: boolean;
  cashedOut: boolean;
  payout: number | null;
}

export interface HistoryEntry {
  id: string;
  crashMultiplier: number;
  provablyFairData: ProvablyFairData;
}

export interface GraphDataPoint {
  time: number;
  multiplier: number | null;
}

export interface ProvablyFairData {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
}