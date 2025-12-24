import React, { useEffect, useRef } from 'react';
import { InputBar } from './InputBar';
import { TrashIcon } from './icons/TrashIcon';

interface OutputConsoleProps {
  output: string[];
  isAwaitingInput: boolean;
  onInputSubmit: (value: string) => void;
  zoomLevel: number;
  onClear: () => void;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({ output, isAwaitingInput, onInputSubmit, zoomLevel, onClear }) => {
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, isAwaitingInput]);

  const getLineClass = (line: string): string => {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.startsWith('error') || lowerLine.startsWith('invalid input')) {
      return 'text-[var(--accent-red)]';
    }
    
    if (
      line.startsWith('Running program...') ||
      line.startsWith('Program finished.') ||
      line.startsWith('Program stopped by user.') ||
      line.startsWith('Enter a value for') ||
      line.endsWith(' cancelled.')
    ) {
      return 'text-[var(--text-muted)] italic';
    }

    if (line.startsWith('$ ')) {
      return 'text-[var(--accent-primary)]';
    }
    
    return 'text-[var(--text-secondary)]';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="absolute top-2 right-2 z-10">
          <button 
            onClick={onClear}
            className="p-1.5 rounded-lg text-[var(--text-muted)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Clear console"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
      </div>
      <div 
        className="flex-grow p-4 font-mono text-[var(--text-primary)] overflow-y-auto h-full"
        style={{ fontSize: `${zoomLevel}%` }}
      >
          {output.map((line, index) => (
          <div key={index} className={`whitespace-pre-wrap ${getLineClass(line)}`}>
              <span className="text-[var(--text-muted)] mr-2 select-none">{'>'}</span>{line}
          </div>
          ))}
          {isAwaitingInput && <InputBar onSubmit={onInputSubmit} />}
          <div ref={consoleEndRef} />
      </div>
    </div>
  );
};