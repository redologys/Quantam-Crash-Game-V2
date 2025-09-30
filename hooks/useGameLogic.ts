
import { useState, useEffect, useCallback, useRef } from 'react';
import { GamePhase, SideBetOption, type GraphDataPoint, type HistoryEntry, type ProvablyFairData, type RoundState } from '../types';
import { GAME_CONFIG, HISTORY_LENGTH, INITIAL_BALANCE, JACKPOT_CONFIG, SIDE_BETS } from '../constants';
import { calculateCrashPoint, generateSeed, generateSeedHash } from '../lib/provablyFair';

const initialRoundState: RoundState = { multiplier: 1, crashed: false, cashedOut: false, payout: null };

export const useGameLogic = () => {
  const [balance, setBalance] = useState<number>(() => {
    const savedBalance = localStorage.getItem('qd-balance');
    return savedBalance ? parseFloat(savedBalance) : INITIAL_BALANCE;
  });
  const [betAmount, setBetAmount] = useState<number>(10);
  const [sideBet, setSideBet] = useState<SideBetOption>(SideBetOption.NONE);
  const [jackpotAmount, setJackpotAmount] = useState<number>(() => {
      const savedJackpot = localStorage.getItem('qd-jackpot');
      return savedJackpot ? parseFloat(savedJackpot) : JACKPOT_CONFIG.initialAmount;
  });
  
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.LOBBY);
  const [countdown, setCountdown] = useState<number>(0);
  
  const [roundState, setRoundState] = useState<RoundState>(initialRoundState);
  
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [consoleMessages, setConsoleMessages] = useState<string[]>(['[SYSTEM] Quantum De-Cryption initialized. Stand by for connection.']);

  const [provablyFair, setProvablyFair] = useState<ProvablyFairData>({
    serverSeed: '', serverSeedHash: '', clientSeed: '', nonce: 0
  });

  const roundCrashPoint = useRef(0);
  const gameLoopRef = useRef<number | null>(null);
  const timersRef = useRef<{[key: string]: number}>({});
  const secretProvablyFairData = useRef<{ serverSeed: string; clientSeed: string; }>({ serverSeed: '', clientSeed: '' });
  const hasCashedOutThisRound = useRef(false);
  const milestonesHitRef = useRef(new Set<number>());
  const isJackpotEligible = useRef(false);


  useEffect(() => {
    localStorage.setItem('qd-balance', balance.toString());
  }, [balance]);

  useEffect(() => {
      localStorage.setItem('qd-jackpot', jackpotAmount.toString());
  }, [jackpotAmount]);

  const addConsoleMessage = useCallback((msg: string) => {
    setConsoleMessages(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const setupNewRound = useCallback(() => {
    addConsoleMessage("Preparing new round...");
    const newClientSeed = generateSeed();
    const newServerSeed = generateSeed();
    
    secretProvablyFairData.current = { serverSeed: newServerSeed, clientSeed: newClientSeed };
    hasCashedOutThisRound.current = false; // Reset for the new round
    milestonesHitRef.current.clear(); // Reset milestone logs for the new round
    isJackpotEligible.current = false; // Reset jackpot eligibility

    setProvablyFair(prev => ({
      ...prev,
      serverSeed: '', // Hide until round ends
      serverSeedHash: generateSeedHash(newServerSeed),
      clientSeed: newClientSeed,
      nonce: prev.nonce + 1,
    }));
    
    setGamePhase(GamePhase.LOBBY);
    setSideBet(SideBetOption.NONE);
    setRoundState(initialRoundState);
    setGraphData([]);
  }, [addConsoleMessage]);

  useEffect(() => {
    setupNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endRound = useCallback(() => {
    const roundServerSeed = secretProvablyFairData.current.serverSeed;
    
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    gameLoopRef.current = null;
    setGamePhase(GamePhase.ENDED);
    
    let totalPayout = roundState.payout || 0;

    // Resolve Side Bet
    if (sideBet !== SideBetOption.NONE) {
        const sideBetConfig = SIDE_BETS[sideBet];
        const sideBetWager = betAmount * sideBetConfig.wagerPercent;
        if (sideBetConfig.condition(roundCrashPoint.current)) {
            const sideBetPayout = sideBetWager * sideBetConfig.payout;
            totalPayout += sideBetPayout;
            addConsoleMessage(`[SIDE BET WIN] ${sideBetConfig.label} succeeded! Won ${sideBetPayout.toFixed(2)} credits.`);
        } else {
            addConsoleMessage(`[SIDE BET LOSS] ${sideBetConfig.label} failed.`);
        }
    }
    
    // Resolve Jackpot
    if (isJackpotEligible.current && roundCrashPoint.current > JACKPOT_CONFIG.winThreshold) {
        addConsoleMessage(`[JACKPOT!] You survived a ${roundCrashPoint.current.toFixed(2)}x trace and won the jackpot of ${jackpotAmount.toFixed(2)} credits!`);
        totalPayout += jackpotAmount;
        setJackpotAmount(JACKPOT_CONFIG.initialAmount);
    }

    if (totalPayout > 0) {
        addConsoleMessage(`Total payout: ${totalPayout.toFixed(2)} credits.`);
        setBalance(prev => prev + totalPayout);
    }

    const finalProvablyFairData: ProvablyFairData = {
        serverSeed: roundServerSeed,
        clientSeed: secretProvablyFairData.current.clientSeed,
        serverSeedHash: provablyFair.serverSeedHash,
        nonce: provablyFair.nonce
    };

    setProvablyFair(finalProvablyFairData);

    const historyEntry: HistoryEntry = {
      id: `${roundServerSeed}-${provablyFair.nonce}`,
      crashMultiplier: roundCrashPoint.current,
      provablyFairData: finalProvablyFairData,
    };
    setHistory(prev => [historyEntry, ...prev.slice(0, HISTORY_LENGTH - 1)]);

    timersRef.current.summary = window.setTimeout(() => {
        setupNewRound();
    }, GAME_CONFIG.round.summaryMs);

  }, [addConsoleMessage, setupNewRound, provablyFair.nonce, sideBet, betAmount, jackpotAmount, roundState.payout, provablyFair.serverSeedHash]);

  // Effect to handle ending the round based on state changes
  useEffect(() => {
    const isRoundFinished = roundState.crashed;
    if (gamePhase === GamePhase.RUNNING && isRoundFinished) {
      endRound();
    }
  }, [roundState.crashed, gamePhase, endRound]);

  const startGame = useCallback(() => {
    const sideBetConfig = SIDE_BETS[sideBet];
    const sideBetCost = betAmount * sideBetConfig.wagerPercent;
    const totalCost = betAmount + sideBetCost;

    if (balance < totalCost) {
        addConsoleMessage("Insufficient funds for bet and side bet.");
        return;
    }

    setBalance(prev => prev - totalCost);
    setJackpotAmount(prev => prev + (betAmount * JACKPOT_CONFIG.contributionPercent));
    setGamePhase(GamePhase.BETTING);
    addConsoleMessage(`Bet of ${betAmount} placed.`);
    if (sideBet !== SideBetOption.NONE) {
        addConsoleMessage(`Side bet of ${sideBetCost.toFixed(2)} placed on: ${sideBetConfig.label}`);
    }
    
    setCountdown(GAME_CONFIG.round.betPhaseMs);
    const countdownInterval = setInterval(() => {
        setCountdown(prev => {
            if (prev <= 1000) {
                clearInterval(countdownInterval);
                return 0;
            }
            return prev - 1000;
        });
    }, 1000);

    timersRef.current.start = window.setTimeout(() => {
      clearInterval(countdownInterval);
      setGamePhase(GamePhase.RUNNING);
      addConsoleMessage("Trace initiated. Multiplier is live!");

      roundCrashPoint.current = calculateCrashPoint(
          secretProvablyFairData.current.serverSeed, 
          secretProvablyFairData.current.clientSeed,
          provablyFair.nonce
      );
      
      let startTime = Date.now();
      
      gameLoopRef.current = window.setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const { k } = GAME_CONFIG.growth;

        const nextMultiplier = Math.exp(k * elapsedTime);
        
        if (nextMultiplier >= 2 && !milestonesHitRef.current.has(2)) {
          addConsoleMessage("[SYSTEM] Trace Strength Rising...");
          milestonesHitRef.current.add(2);
        }
        if (nextMultiplier >= 5 && !milestonesHitRef.current.has(5)) {
            addConsoleMessage("[WARNING] Overclock Detected!");
            milestonesHitRef.current.add(5);
        }
        if (nextMultiplier >= 10 && !milestonesHitRef.current.has(10)) {
            addConsoleMessage("[CRITICAL] Firewall Escalation!");
            milestonesHitRef.current.add(10);
        }

        const crashPoint = roundCrashPoint.current;

        setRoundState(currentRoundState => {
          if (currentRoundState.crashed) {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
            return currentRoundState;
          }

          if (nextMultiplier >= crashPoint) {
            addConsoleMessage(`[SIGNAL LOST] Trace failed at ${crashPoint.toFixed(2)}x.`);
            return { ...currentRoundState, multiplier: crashPoint, crashed: true };
          } else {
            return { ...currentRoundState, multiplier: nextMultiplier };
          }
        });

        setGraphData(prev => [...prev, {
          time: elapsedTime,
          multiplier: nextMultiplier >= crashPoint ? null : nextMultiplier,
        }]);

      }, 1000 / GAME_CONFIG.round.tickRateHz);

    }, GAME_CONFIG.round.betPhaseMs);

  }, [balance, betAmount, addConsoleMessage, provablyFair.nonce, sideBet]);

  const cashOut = useCallback(() => {
    if (gamePhase !== GamePhase.RUNNING || hasCashedOutThisRound.current) {
        return;
    }
    
    hasCashedOutThisRound.current = true;
    isJackpotEligible.current = true;

    setRoundState(prev => {
        if (prev.crashed || prev.cashedOut) return prev;

        const payout = betAmount * prev.multiplier;
        addConsoleMessage(`Cash out successful at ${prev.multiplier.toFixed(2)}x for ${payout.toFixed(2)} credits.`);
        return {...prev, cashedOut: true, payout};
    });
  }, [gamePhase, betAmount, addConsoleMessage]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);
  
  return {
    balance,
    betAmount,
    setBetAmount,
    gamePhase,
    countdown,
    roundState,
    graphData,
    history,
    consoleMessages,
    provablyFair,
    startGame,
    cashOut,
    sideBet,
    setSideBet,
    jackpotAmount,
  };
};