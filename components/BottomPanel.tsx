import React, { useState } from 'react';
import { OutputConsole } from './OutputConsole';
import { ScopePanel } from './ScopePanel';
import { TerminalIcon } from './icons/TerminalIcon';
import { BugIcon } from './icons/BugIcon';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface BottomPanelProps {
    output: string[];
    isAwaitingInput: boolean;
    onInputSubmit: (value: string) => void;
    zoomLevel: number;
    onClearConsole: () => void;
    scope: Record<string, any>;
    isDebugMode: boolean;
}

type ActiveTab = 'console' | 'debugger';

export const BottomPanel: React.FC<BottomPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('console');
    const isDesktop = useMediaQuery('(min-width: 768px)');

    // Automatically switch to debugger tab when debug mode starts
    React.useEffect(() => {
        if (props.isDebugMode) {
            setActiveTab('debugger');
        } else {
            setActiveTab('console');
        }
    }, [props.isDebugMode]);

    const getTabClass = (tabName: ActiveTab) => {
        const base = "flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2";
        if (activeTab === tabName) {
            return `${base} text-[var(--text-primary)] border-[var(--accent-primary)]`;
        }
        return `${base} text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]`;
    };

    return (
        <div 
            className={`flex flex-col bg-[var(--bg-secondary)] rounded-lg overflow-hidden h-full border border-[var(--border-primary)] ${isDesktop ? 'shadow-[0_0_30px_-10px_var(--shadow-color-secondary)]' : 'shadow-lg'}`}
            data-tutorial-id="console-panel"
        >
            <div className="flex items-center bg-[var(--bg-tertiary)] border-b border-[var(--border-primary)]">
                <button className={getTabClass('console')} onClick={() => setActiveTab('console')}>
                    <TerminalIcon className="w-4 h-4" />
                    <span>Console</span>
                </button>
                <button className={getTabClass('debugger')} onClick={() => setActiveTab('debugger')}>
                    <BugIcon className="w-4 h-4" />
                    <span>Debugger</span>
                </button>
            </div>
            <div className="flex-grow overflow-hidden relative bg-[var(--bg-inset)]">
                {activeTab === 'console' ? (
                    <OutputConsole {...props} onClear={props.onClearConsole} />
                ) : (
                    <ScopePanel scope={props.scope} zoomLevel={props.zoomLevel} />
                )}
            </div>
        </div>
    );
};