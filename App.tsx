
import React, { useState, useEffect, useRef } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { GamePhase, HistoryEntry, ProvablyFairData } from './types';
import { Graph } from './components/Graph';
import { Console } from './components/Console';
import { HistoryBar } from './components/HistoryBar';
import { Controls } from './components/Controls';
import { GameInfo } from './components/GameInfo';
import { ProvablyFairModal } from './components/ProvablyFairModal';

const CrtOverlay = () => (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
        <div className="absolute top-0 left-0 w-full h-[200%] bg-repeat"
             style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', backgroundSize: '100% 4px' }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-cyber-bg via-transparent to-cyber-bg opacity-30"></div>
    </div>
);

const App: React.FC = () => {
    const {
        balance, betAmount, setBetAmount,
        gamePhase, countdown, roundState, graphData, history,
        consoleMessages, provablyFair, startGame, cashOut,
        sideBet, setSideBet, jackpotAmount,
    } = useGameLogic();
    
    const [isPfModalOpen, setPfModalOpen] = useState(false);
    const [modalProvablyFairData, setModalProvablyFairData] = useState<ProvablyFairData>(provablyFair);
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const warningIntervalRef = useRef<number | null>(null);

    // Default modal to current round data
    useEffect(() => {
        if (!isPfModalOpen) {
            setModalProvablyFairData(provablyFair);
        }
    }, [provablyFair, isPfModalOpen]);

    // Initialize AudioContext on first user interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('click', initAudio);
        return () => window.removeEventListener('click', initAudio);
    }, []);

    const playSound = (type: 'crash' | 'warn') => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'crash') {
            oscillator.type = 'noise';
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.4);
        } else if (type === 'warn') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        }
    };

    // Effect for handling sounds and visual shakes
    useEffect(() => {
        const isCrashing = gamePhase === GamePhase.ENDED && roundState.crashed;
        if (isCrashing) {
            playSound('crash');
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
        }

        const isHighMultiplier = gamePhase === GamePhase.RUNNING && roundState.multiplier >= 10;
        if (isHighMultiplier && !warningIntervalRef.current) {
            playSound('warn');
            warningIntervalRef.current = window.setInterval(() => playSound('warn'), 500);
        } else if (!isHighMultiplier && warningIntervalRef.current) {
            clearInterval(warningIntervalRef.current);
            warningIntervalRef.current = null;
        }
    }, [gamePhase, roundState.crashed, roundState.multiplier]);

    const handleInfoClick = () => {
        setModalProvablyFairData(provablyFair);
        setPfModalOpen(true);
    };

    const handleHistoryClick = (entry: HistoryEntry) => {
        setModalProvablyFairData(entry.provablyFairData);
        setPfModalOpen(true);
    };

    const isGlitching = gamePhase === GamePhase.ENDED && roundState.crashed;
    const isShaking = gamePhase === GamePhase.RUNNING && roundState.multiplier >= 10;

    return (
        <>
            <main className={`min-h-screen p-4 flex flex-col space-y-4 transition-all duration-200 ${isGlitching ? 'animate-crash-glitch' : ''} ${isShaking ? 'animate-shake' : ''}`}>
                <GameInfo 
                    balance={balance}
                    betAmount={gamePhase === GamePhase.LOBBY || gamePhase === GamePhase.BETTING ? betAmount : 0}
                    roundHash={provablyFair.serverSeedHash}
                    jackpotAmount={jackpotAmount}
                    onInfoClick={handleInfoClick}
                    onSettingsClick={() => alert('Settings modal placeholder!')}
                />
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1 h-64 lg:h-auto">
                        <Console messages={consoleMessages} />
                    </div>
                    <div className="lg:col-span-3 grid grid-rows-3 gap-4">
                        <div className="row-span-2 min-h-[300px]">
                           <Graph data={graphData} roundState={roundState} />
                        </div>
                        <div className="row-span-1">
                            <Controls
                                gamePhase={gamePhase}
                                betAmount={betAmount}
                                setBetAmount={setBetAmount}
                                balance={balance}
                                startGame={startGame}
                                cashOut={cashOut}
                                roundState={roundState}
                                countdown={countdown}
                                sideBet={sideBet}
                                setSideBet={setSideBet}
                            />
                        </div>
                    </div>
                </div>
                <HistoryBar history={history} onHistoryClick={handleHistoryClick} />
            </main>
            <ProvablyFairModal isOpen={isPfModalOpen} onClose={() => setPfModalOpen(false)} data={modalProvablyFairData} />
            <CrtOverlay />
        </>
    );
};

export default App;