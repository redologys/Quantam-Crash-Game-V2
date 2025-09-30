
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { GraphDataPoint, RoundState } from '../types';

interface GraphProps {
  data: GraphDataPoint[];
  roundState: RoundState;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-cyber-surface/80 p-2 border border-cyber-border rounded-md text-sm">
                <p className="text-cyber-cyan">{`Multiplier: ${payload[0]?.value?.toFixed(2) ?? 'N/A'}x`}</p>
            </div>
        );
    }
    return null;
};

export const Graph: React.FC<GraphProps> = ({ data, roundState }) => {

    const yDomain = useMemo(() => {
        const maxVal = Math.max(roundState.multiplier, 2);
        return [0.95, Math.ceil(maxVal / 2) * 2];
    }, [roundState]);

    const lineStrokeWidth = useMemo(() => Math.min(3 + roundState.multiplier / 10, 8), [roundState.multiplier]);

    const glowClass = useMemo(() => {
        if (roundState.crashed) return '';
        if (roundState.multiplier >= 10) return 'glow-high';
        if (roundState.multiplier >= 5) return 'glow-medium';
        return '';
    }, [roundState.multiplier, roundState.crashed]);

    const streamAnimationDuration = useMemo(() => {
        return Math.max(0.5, 5 - roundState.multiplier / 3) + 's';
    }, [roundState.multiplier]);
    
  return (
    <div className={`w-full h-full p-4 bg-cyber-surface/50 border border-cyber-border rounded-lg relative overflow-hidden ${glowClass}`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-10" style={{
            backgroundSize: '20px 20px',
            backgroundImage: 'linear-gradient(to right, #ffffff1a 1px, transparent 1px), linear-gradient(to bottom, #ffffff1a 1px, transparent 1px)'
        }}></div>
        <div 
            className="absolute inset-0 opacity-20 animate-stream-flow"
            style={{
                background: 'linear-gradient(transparent 70%, #22d3ee88 85%, #f0abfc 100%)',
                backgroundSize: '100% 400px',
                animationDuration: streamAnimationDuration,
            }}
        ></div>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="time" type="number" domain={['dataMin', 'dataMax']} unit="s" stroke="#c0c0c0" tick={{ fill: '#c0c0c0', fontSize: 12 }} />
                <YAxis type="number" domain={yDomain} allowDataOverflow={true} scale="log" stroke="#c0c0c0" tick={{ fill: '#c0c0c0', fontSize: 12 }} tickFormatter={(tick) => `${tick.toFixed(1)}x`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                    type="monotone" 
                    dataKey="multiplier" 
                    stroke={roundState.multiplier > 10 ? '#f0abfc' : '#22d3ee'} 
                    strokeWidth={lineStrokeWidth} 
                    dot={false} 
                    isAnimationActive={false} 
                    name="Multiplier" 
                />
                
                {!roundState.crashed && !roundState.cashedOut && (
                     <ReferenceLine y={roundState.multiplier} stroke="#22d3ee" strokeDasharray="4 4" />
                )}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};