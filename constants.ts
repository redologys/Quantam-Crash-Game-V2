import { SideBetOption } from "./types";

export const GAME_CONFIG = {
  houseEdge: 0.02,
  round: { betPhaseMs: 5000, summaryMs: 3000, tickRateHz: 30 },
  growth: {
    // Exponential growth: Math.exp(k * t)
    k: 0.4, // Growth factor. Higher k means faster growth.
    maxX: 10000,
  },
  // A value > 1 skews the distribution towards higher multipliers, making low crashes less frequent.
  // 1 = standard distribution.
  distributionBias: 1.5, 
  ui: { glitchIntensity: 0.6 },
};

export const SIDE_BETS: Record<SideBetOption, { label: string; wagerPercent: number; payout: number; condition: (m: number) => boolean; }> = {
    [SideBetOption.NONE]: { label: 'None', wagerPercent: 0, payout: 0, condition: () => false },
    [SideBetOption.UNDER_2X]: { label: 'Crash < 2x', wagerPercent: 0.2, payout: 2.5, condition: m => m < 2 },
    [SideBetOption.BETWEEN_3_5X]: { label: 'Crash 3-5x', wagerPercent: 0.2, payout: 3.5, condition: m => m >= 3 && m <= 5 },
    [SideBetOption.ABOVE_10X]: { label: 'Crash > 10x', wagerPercent: 0.2, payout: 5.0, condition: m => m > 10 },
};

export const JACKPOT_CONFIG = {
    contributionPercent: 0.01, // 1% of each main bet
    winThreshold: 100, // Multiplier must exceed this
    initialAmount: 1000,
};

export const MIN_BET = 1;
export const MAX_BET = 10000;
export const HISTORY_LENGTH = 15;
export const INITIAL_BALANCE = 5000;