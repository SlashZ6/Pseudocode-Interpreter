import React, { useState } from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { ZoomInIcon } from './icons/ZoomInIcon';
import { ZoomOutIcon } from './icons/ZoomOutIcon';
import { TerminalIcon } from './icons/TerminalIcon';
import { ThemeSwitcher } from './ThemeSwitcher';
import { DownloadIcon } from './icons/DownloadIcon';
import { WandIcon } from './icons/WandIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { FolderOpenIcon } from './icons/FolderOpenIcon';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { MenuIcon } from './icons/MenuIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { BugIcon } from './icons/BugIcon';
import { StepOverIcon } from './icons/StepOverIcon';
import { PaletteIcon } from './icons/PaletteIcon';
import { FlowchartIcon } from './icons/FlowchartIcon';
import { GraduationCapIcon } from './icons/GraduationCapIcon';

export type SaveStatus = 'idle' | 'saving' | 'saved';

interface HeaderProps {
  onRun: () => void;
  onDebug: () => void;
  onStop: () => void;
  onStepOver: () => void;
  onContinue: () => void;
  isRunning: boolean;
  isDebugMode: boolean;
  isPaused: boolean;
  onShowHints: () => void;
  onShowExamples: () => void;
  onShowColorSettings: () => void;
  onGenerateFlowchart: () => void;
  onSaveFile: () => void;
  onLoadFile: () => void;
  onFormatCode: () => void;
  onCopyCode: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isConsoleVisible: boolean;
  onToggleConsole: () => void;
  saveStatus: SaveStatus;
  onShowTools: () => void;
  onStartLearningMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolButton: React.FC<{ onClick?: () => void; 'aria-label': string; children: React.ReactNode, className?: string, disabled?: boolean }> = 
  ({ onClick, 'aria-label': ariaLabel, children, className = '', disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
);

const ActionButton: React.FC<{ onClick?: () => void; 'aria-label': string; children: React.ReactNode; className?: string; disabled?: boolean; style?: React.CSSProperties }> =
  ({ onClick, 'aria-label': ariaLabel, children, className = '', disabled = false, style }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center px-4 py-2 text-white font-bold rounded-lg hover:brightness-110 disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:shadow-none disabled:brightness-100 disabled:cursor-not-allowed transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 active:scale-95 transform-gpu ${className}`}
        aria-label={ariaLabel}
        style={style}
    >
        {children}
    </button>
);


export const Header: React.FC<HeaderProps> = (props) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const handleCopy = () => {
    props.onCopyCode();
    setCopyButtonText('Copied!');
    setTimeout(() => setCopyButtonText('Copy'), 2000);
  };

  const getSaveStatusMessage = (): string => {
    switch (props.saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      default: return '';
    }
  };

  const renderExecutionControls = () => {
    if (props.isRunning) {
      return (
        <div className="flex items-center">
          {props.isDebugMode && (
            <>
              <ActionButton
                onClick={props.onContinue}
                disabled={!props.isPaused}
                className={`bg-[var(--accent-green)] focus:ring-[var(--shadow-color-green)] ${isDesktop ? 'shadow-[0_0_20px_var(--shadow-color-green)] hover:shadow-[0_0_25px_var(--shadow-color-green)]' : 'shadow-lg'}`}
                aria-label="Continue execution"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Continue
              </ActionButton>
              <ActionButton
                onClick={props.onStepOver}
                disabled={!props.isPaused}
                className={`bg-[var(--accent-secondary)] focus:ring-[var(--shadow-color-secondary)] ml-2 ${isDesktop ? 'shadow-[0_0_20px_var(--shadow-color-secondary)] hover:shadow-[0_0_25px_var(--shadow-color-secondary)]' : 'shadow-lg'}`}
                aria-label="Step Over"
              >
                <StepOverIcon className="w-5 h-5 mr-2" />
                Step Over
              </ActionButton>
            </>
          )}
          <ActionButton
            onClick={props.onStop}
            className={`bg-[var(--accent-red)] focus:ring-[var(--shadow-color-red)] ${props.isDebugMode ? 'ml-2' : ''} ${isDesktop ? 'shadow-[0_0_20px_var(--shadow-color-red)] hover:shadow-[0_0_25px_var(--shadow-color-red)]' : 'shadow-lg'}`}
            aria-label="Stop execution"
          >
            <StopIcon className="w-5 h-5 mr-2" />
            Stop
          </ActionButton>
        </div>
      );
    }

    return (
        <div className="flex items-center">
             <ActionButton
                onClick={props.onDebug}
                className={`bg-[var(--accent-secondary)] focus:ring-[var(--shadow-color-secondary)] ${isDesktop ? 'shadow-[0_0_20px_var(--shadow-color-secondary)] hover:shadow-[0_0_25px_var(--shadow-color-secondary)]' : 'shadow-lg'}`}
                aria-label="Debug code"
                data-tutorial-id="debug-button"
            >
                <BugIcon className="w-5 h-5 mr-2" />
                Debug
            </ActionButton>
            <ActionButton
                onClick={props.onRun}
                className={`bg-[var(--accent-green)] focus:ring-[var(--shadow-color-green)] ml-2 ${isDesktop ? 'shadow-[0_0_20px_var(--shadow-color-green)] hover:shadow-[0_0_25px_var(--shadow-color-green)]' : 'shadow-lg'}`}
                aria-label="Run code"
                data-tutorial-id="run-button"
            >
                <PlayIcon className="w-5 h-5 mr-2" />
                Run
            </ActionButton>
        </div>
    );
  };

  return (
    <header className={`bg-[var(--bg-secondary)] p-2 flex flex-wrap justify-between items-center z-10 gap-2 border-b border-[var(--border-primary)] ${isDesktop ? 'shadow-[0_0_25px_-5px_var(--shadow-color)]' : 'shadow-lg'}`}>
      <div className="flex items-center gap-2 sm:gap-4">
        <h1 className="text-xl font-bold text-[var(--text-secondary)]">
          <span className="text-[var(--accent-primary)]">Pseudo</span>
          <span className="hidden sm:inline">Code</span>
        </h1>
        <span className="text-xs text-[var(--text-muted)] w-20 transition-opacity hidden sm:block">{getSaveStatusMessage()}</span>
      </div>
      
      <div className="flex items-center flex-wrap justify-end gap-x-2">
        {isDesktop ? (
          <>
            <div className="flex items-center bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-primary)]">
                <ThemeSwitcher />
                <ToolButton onClick={props.onShowColorSettings} aria-label="Customize colors">
                    <PaletteIcon className="w-5 h-5" />
                </ToolButton>
            </div>

            <div className="flex items-center bg-[var(--bg-primary)] rounded-lg p-1 border border-[var(--border-primary)]">
              <ToolButton onClick={props.onZoomOut} aria-label="Zoom out"><ZoomOutIcon className="w-5 h-5" /></ToolButton>
              <span className="font-mono text-sm w-12 text-center text-[var(--text-secondary)] select-none">{props.zoomLevel}%</span>
              <ToolButton onClick={props.onZoomIn} aria-label="Zoom in"><ZoomInIcon className="w-5 h-5" /></ToolButton>
              <div className="w-px h-5 bg-[var(--border-primary)] mx-1"></div>
              <ToolButton onClick={props.onUndo} aria-label="Undo" disabled={!props.canUndo}><UndoIcon className="w-5 h-5" /></ToolButton>
              <ToolButton onClick={props.onRedo} aria-label="Redo" disabled={!props.canRedo}><RedoIcon className="w-5 h-5" /></ToolButton>
              <div className="w-px h-5 bg-[var(--border-primary)] mx-1"></div>
              <ToolButton onClick={props.onFormatCode} aria-label="Format code"><WandIcon className="w-5 h-5" /></ToolButton>
              <ToolButton onClick={handleCopy} aria-label="Copy code"><ClipboardIcon className="w-5 h-5" /></ToolButton>
              <div className="w-px h-5 bg-[var(--border-primary)] mx-1"></div>
              <ToolButton onClick={props.onLoadFile} aria-label="Load file"><FolderOpenIcon className="w-5 h-5" /></ToolButton>
              <ToolButton onClick={props.onSaveFile} aria-label="Save file"><DownloadIcon className="w-5 h-5" /></ToolButton>
            </div>

            <div className="flex items-center gap-x-2">
              <button
                onClick={props.onStartLearningMode}
                disabled={props.isRunning}
                className="flex items-center px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold rounded-lg shadow-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-secondary)] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Start learning mode"
              >
                  <GraduationCapIcon className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Tutorial</span>
              </button>
              <button
                onClick={props.onShowExamples}
                className="flex items-center px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold rounded-lg shadow-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-secondary)] focus:ring-opacity-75"
                aria-label="Show examples"
              >
                <BookOpenIcon className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Examples</span>
              </button>
              <button
                onClick={props.onShowHints}
                className="flex items-center px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold rounded-lg shadow-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-secondary)] focus:ring-opacity-75"
                aria-label="Show hints"
              >
                <LightbulbIcon className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Reference</span>
              </button>
              <button
                  onClick={props.onGenerateFlowchart}
                  disabled={props.isRunning}
                  className="flex items-center px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-[var(--text-secondary)] font-semibold rounded-lg shadow-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-secondary)] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Generate flowchart"
              >
                  <FlowchartIcon className="w-5 h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Flowchart</span>
              </button>
              
              <button
                onClick={props.onToggleConsole}
                className={`flex items-center px-3 py-2 sm:px-4 font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-4 focus:ring-opacity-50 ${
                  props.isConsoleVisible
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:ring-[var(--border-secondary)] border border-[var(--border-primary)]'
                    : 'bg-[var(--accent-primary)] text-[var(--text-inverted)] hover:brightness-110 focus:ring-[var(--shadow-color)]'
                }`}
                aria-label={props.isConsoleVisible ? 'Hide Console' : 'Show Console'}
              >
                <TerminalIcon className="w-5 h-5 sm:mr-2" />
                <span className="hidden sm:inline">Console</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <ToolButton onClick={props.onShowTools} aria-label="Open tools menu">
              <MenuIcon className="w-6 h-6" />
            </ToolButton>
          </>
        )}
        
        <div className="flex items-center">
            {renderExecutionControls()}
        </div>
      </div>
    </header>
  );
};