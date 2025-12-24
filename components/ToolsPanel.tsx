import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { WandIcon } from './icons/WandIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { TrashIcon } from './icons/TrashIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { useTheme } from '../components/ThemeContext';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { FlowchartIcon } from './icons/FlowchartIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { GraduationCapIcon } from './icons/GraduationCapIcon';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ToolsPanelProps {
    onClose: () => void;
    onFormatCode: () => void;
    onCopyCode: () => void;
    onLoadFile: () => void;
    onSaveFile: () => void;
    zoomLevel: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onClearConsole: () => void;
    onShowHints: () => void;
    onShowExamples: () => void;
    onShowColorSettings: () => void;
    onGenerateFlowchart: () => void;
    onStartLearningMode: () => void;
    onSelectConsole: () => void;
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const ToolButton: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; disabled?: boolean; }> = ({ icon, label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex flex-col items-center justify-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg text-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors w-24 h-24 disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {icon}
        <span className="text-xs font-medium h-7 flex items-center text-center">{label}</span>
    </button>
);

export const ToolsPanel: React.FC<ToolsPanelProps> = ({ onClose, ...props }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Copy Code');
    const { theme, setTheme } = useTheme();
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200); // match animation duration
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
            handleClose();
        }
    };

    const handleCopy = () => {
        props.onCopyCode();
        setCopyButtonText('Copied!');
        setTimeout(() => {
            setCopyButtonText('Copy Code');
            handleClose();
        }, 1000);
    };

    const handleShowHints = () => {
        props.onShowHints();
        handleClose();
    };

    const handleShowExamples = () => {
        props.onShowExamples();
        handleClose();
    };
    
    const handleShowColorSettings = () => {
        props.onShowColorSettings();
        handleClose();
    };

    const handleGenerateFlowchart = () => {
        props.onGenerateFlowchart();
        handleClose();
    };

    const handleSelectConsole = () => {
        props.onSelectConsole();
        handleClose();
    };

    const getThemeButtonClass = (buttonTheme: 'slate' | 'dark' | 'light') => {
        const base = "flex-1 py-2 text-sm rounded-md font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]";
        if (theme === buttonTheme) {
            return `${base} bg-[var(--accent-secondary)] text-white`;
        }
        return `${base} bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]`;
    };
    
    const backdropClasses = `fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-end justify-center transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`;
    const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 rounded-t-2xl w-full max-w-2xl flex flex-col border-t border-[var(--border-primary)] transition-transform duration-200 ${isClosing ? 'translate-y-full' : 'translate-y-0'} ${isDesktop ? 'shadow-[0_0_50px_-15px_var(--shadow-color-secondary)]' : 'shadow-2xl'}`;

    return (
        <div className={backdropClasses} onClick={handleBackdropClick} role="dialog" aria-modal="true">
            <div ref={panelRef} className={panelClasses}>
                <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--text-secondary)]">Tools & Actions</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-[var(--bg-hover)] transition-colors" aria-label="Close tools menu">
                        <XIcon className="w-6 h-6 text-[var(--text-muted)]"/>
                    </button>
                </header>
                <main className="p-4 overflow-y-auto">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                         <ToolButton icon={<UndoIcon className="w-8 h-8"/>} label="Undo" onClick={props.onUndo} disabled={!props.canUndo} />
                         <ToolButton icon={<RedoIcon className="w-8 h-8"/>} label="Redo" onClick={props.onRedo} disabled={!props.canRedo} />
                         <ToolButton icon={<WandIcon className="w-8 h-8"/>} label="Format Code" onClick={props.onFormatCode} />
                         <ToolButton icon={<ClipboardIcon className="w-8 h-8"/>} label={copyButtonText} onClick={handleCopy} />
                         <ToolButton icon={<FolderOpenIcon className="w-8 h-8"/>} label="Load File" onClick={props.onLoadFile} />
                         <ToolButton icon={<DownloadIcon className="w-8 h-8"/>} label="Save File" onClick={props.onSaveFile} />
                         <ToolButton icon={<FlowchartIcon className="w-8 h-8" />} label="Flowchart" onClick={handleGenerateFlowchart} />
                         <ToolButton icon={<GraduationCapIcon className="w-8 h-8" />} label="Tutorial" onClick={props.onStartLearningMode} />
                         <ToolButton icon={<TerminalIcon className="w-8 h-8"/>} label="Show Console" onClick={handleSelectConsole} />
                         <ToolButton icon={<TrashIcon className="w-8 h-8"/>} label="Clear Console" onClick={props.onClearConsole} />
                         <ToolButton icon={<BookOpenIcon className="w-8 h-8"/>} label="Examples" onClick={handleShowExamples} />
                         <ToolButton icon={<LightbulbIcon className="w-8 h-8"/>} label="Reference" onClick={handleShowHints} />
                         <div className="flex col-span-3 sm:col-span-4 items-center justify-center gap-2 p-3 bg-[var(--bg-tertiary)] rounded-lg text-center text-[var(--text-secondary)] w-full h-24">
                            <button onClick={props.onZoomOut} className="p-3 rounded-full hover:bg-[var(--bg-hover)]"><ZoomOutIcon className="w-7 h-7"/></button>
                            <span className="font-mono text-lg w-16 text-center">{props.zoomLevel}%</span>
                            <button onClick={props.onZoomIn} className="p-3 rounded-full hover:bg-[var(--bg-hover)]"><ZoomInIcon className="w-7 h-7"/></button>
                         </div>
                    </div>
                     <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
                        <h3 className="text-sm font-semibold text-center text-[var(--text-muted)] mb-2">Appearance</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-grow p-1 bg-[var(--bg-primary)] rounded-lg">
                              <button onClick={() => setTheme('slate')} className={getThemeButtonClass('slate')}>Neon Night</button>
                              <button onClick={() => setTheme('dark')} className={getThemeButtonClass('dark')}>Onyx</button>
                              <button onClick={() => setTheme('light')} className={getThemeButtonClass('light')}>Daybreak</button>
                          </div>
                          <button 
                              onClick={handleShowColorSettings} 
                              className="p-3 bg-[var(--bg-primary)] rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                              aria-label="Customize colors"
                          >
                              <PaletteIcon className="w-5 h-5" />
                          </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};