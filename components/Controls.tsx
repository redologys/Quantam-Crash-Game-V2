
import React, { useEffect, useMemo } from 'react';
import { GamePhase, SideBetOption, type RoundState } from '../types';
import { MIN_BET, MAX_BET, SIDE_BETS } from '../constants';

interface ControlsProps {
  gamePhase: GamePhase;
  betAmount: number;
  setBetAmount: (amount: number) => void;
  balance: number;
  startGame: () => void;
  cashOut: () => void;
  roundState: RoundState;
  countdown: number;
  sideBet: SideBetOption;
  setSideBet: (option: SideBetOption) => void;
}

const BetButton: React.FC<{ children: React.ReactNode; onClick: () => void; disabled?: boolean; className?: string }> = ({ children, onClick, disabled, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full px-4 py-3 font-bold text-lg border-2 rounded-md transition-all duration-200 
                   ${className} 
                   disabled:bg-gray-600 disabled:border-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed`}
    >
        {children}
    </button>
);

const SideBetSelector: React.FC<{
    selected: SideBetOption;
    onSelect: (option: SideBetOption) => void;
}> = ({ selected, onSelect }) => {
    return (
        <div>
            <label className="block text-sm font-bold mb-2 text-cyber-yellow">[SIDE_BET]</label>
            <div className="grid grid-cols-3 gap-2">
                {Object.values(SideBetOption).filter(o => o !== SideBetOption.NONE).map((option) => {
                    const config = SIDE_BETS[option];
                    const isActive = selected === option;
                    return (
                        <button
                            key={option}
                            onClick={() => onSelect(isActive ? SideBetOption.NONE : option)}
                            className={`px-2 py-2 text-xs font-bold border rounded-md transition-all ${
                                isActive 
                                ? 'bg-cyber-magenta text-cyber-bg border-cyber-magenta' 
                                : 'bg-transparent border-cyber-border hover:border-cyber-magenta'
                            }`}
                        >
                            <div>{config.label}</div>
                            <div className="text-xs opacity-80">@{config.payout.toFixed(1)}x</div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}


export const Controls: React.FC<ControlsProps> = ({
  gamePhase, betAmount, setBetAmount, balance, startGame, cashOut, roundState, countdown, sideBet, setSideBet
}) => {

    const isBettingAllowed = gamePhase === GamePhase.LOBBY || gamePhase === GamePhase.BETTING;
    const canCashOut = gamePhase === GamePhase.RUNNING && !roundState.cashedOut && !roundState.crashed;

    const sideBetConfig = useMemo(() => SIDE_BETS[sideBet], [sideBet]);
    const sideBetCost = useMemo(() => betAmount * sideBetConfig.wagerPercent, [betAmount, sideBetConfig]);
    const totalCost = useMemo(() => betAmount + sideBetCost, [betAmount, sideBetCost]);

    const handleBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
            setBetAmount(Math.max(MIN_BET, Math.min(val, MAX_BET, Math.floor(balance))));
        } else if (e.target.value === '') {
            setBetAmount(MIN_BET);
        }
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && isBettingAllowed && gamePhase === GamePhase.LOBBY) {
                startGame();
            } else if (e.key.toLowerCase() === 'c' || e.key === ' ') {
                cashOut();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBettingAllowed, gamePhase, startGame, cashOut]);

    return (
        <div className="bg-cyber-surface/50 border border-cyber-border rounded-lg p-4 flex flex-col space-y-4 h-full justify-center">
            { isBettingAllowed ? (
                <div className="flex flex-col space-y-4 max-w-sm mx-auto w-full">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-cyber-yellow">[BET_AMOUNT]</label>
                        <input
                            type="number"
                            value={betAmount}
                            onChange={handleBetChange}
                            className="w-full bg-cyber-bg border border-cyber-border rounded px-3 py-2 text-cyber-text focus:outline-none focus:ring-2 focus:ring-cyber-cyan"
                            disabled={gamePhase === GamePhase.BETTING}
                        />
                    </div>
                    <SideBetSelector selected={sideBet} onSelect={setSideBet} />
                    <BetButton 
                        onClick={startGame}
                        disabled={gamePhase !== GamePhase.LOBBY || totalCost > balance}
                        className="bg-cyber-green/80 border-cyber-green hover:bg-cyber-green text-cyber-bg"
                    >
                        {gamePhase === GamePhase.BETTING ? `STARTING IN ${(countdown/1000).toFixed(0)}s` : `PLACE BET [ENTER]`}
                    </BetButton>
                    {gamePhase === GamePhase.LOBBY && (
                        <div className="text-center text-xs text-cyber-text/80 mt-2 space-y-1 bg-cyber-bg/50 p-2 rounded-md border border-cyber-border">
                            <div className="flex justify-between">
                                <span>Main Bet:</span>
                                <span>{betAmount.toFixed(2)} cr</span>
                            </div>
                            {sideBet !== SideBetOption.NONE && (
                                <div className="flex justify-between">
                                    <span>Side Bet ({sideBetConfig.label}):</span>
                                    <span>{sideBetCost.toFixed(2)} cr</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold border-t border-cyber-border/50 pt-1 mt-1">
                                <span>Total Cost:</span>
                                <span>{totalCost.toFixed(2)} cr</span>
                            </div>
                            {totalCost > balance && (
                                <div className="text-cyber-red font-bold text-center pt-1">Insufficient Balance</div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col space-y-4 max-w-sm mx-auto w-full">
                    <BetButton
                        onClick={cashOut}
                        disabled={!canCashOut}
                        className={`bg-cyber-cyan/80 border-cyber-cyan hover:bg-cyber-cyan text-cyber-bg text-2xl py-6 ${canCashOut ? 'animate-pulse' : ''}`}
                    >
                        {roundState.cashedOut ? `CASHED OUT ${roundState.payout?.toFixed(2)}` : roundState.crashed ? 'CRASHED' : `CASH OUT [C] (${(betAmount * roundState.multiplier).toFixed(2)})`}
                    </BetButton>
                </div>
            )}
        </div>
    );
};