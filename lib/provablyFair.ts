import { GAME_CONFIG } from '../constants';

// This is a client-side simulation. A real implementation would use a cryptographic library.
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

export const generateSeed = (): string => {
  return (Math.random() * 1e18).toString(16);
};

export const generateSeedHash = (seed: string): string => {
  return `hash(${simpleHash(seed)})`;
};

// Simulate HMAC-based number generation for game logic
const generateNumberFromSeeds = (serverSeed: string, clientSeed: string, nonce: number, round: number, cursor: number): number => {
  const combined = `${serverSeed}-${clientSeed}-${nonce}-${round}-${cursor}`;
  // Simple pseudo-random number generation based on seed string for deterministic results
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash * 31 + combined.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) / 2147483647);
};

export const getCrashPoint = (u: number): number => {
    const { houseEdge, growth, distributionBias } = GAME_CONFIG;
    
    // A bias of 1 is the standard distribution. A bias > 1 skews results towards higher multipliers.
    const u_biased = Math.pow(u, 1 / distributionBias);

    if (u_biased === 1) return growth.maxX;
    const multiplier = (100 * (1 - houseEdge)) / (100 * (1 - u_biased));
    return Math.max(1.01, Math.floor(multiplier * 100) / 100);
};

export const calculateCrashPoint = (serverSeed: string, clientSeed: string, nonce: number): number => {
  const u_raw = generateNumberFromSeeds(serverSeed, clientSeed, nonce, 0, 1);
  return getCrashPoint(u_raw);
};