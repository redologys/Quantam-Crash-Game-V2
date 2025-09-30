
import React, { useEffect, useRef } from 'react';

interface ConsoleProps {
  messages: string[];
}

export const Console: React.FC<ConsoleProps> = ({ messages }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-cyber-surface/50 border border-cyber-border rounded-lg p-3 h-full flex flex-col">
      <h3 className="text-lg font-bold text-cyber-cyan mb-2 border-b border-cyber-border pb-1">[TRACE_LOGS]</h3>
      <div className="flex-grow overflow-y-auto pr-2 text-sm">
        {messages.map((msg, index) => (
          <p key={index} className="leading-relaxed">
            <span className="text-cyber-green/70 mr-2">&gt;</span>{msg}
          </p>
        ))}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
};
