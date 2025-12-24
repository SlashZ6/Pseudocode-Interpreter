import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header, SaveStatus } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { interpret } from './services/interpreter';
import { InterpreterError, ProgramStoppedError } from './services/interpreterTypes';
import { ResizablePanels } from './components/ResizablePanels';
import { loadCode, saveCode } from './services/db';
import { formatCode } from './services/formatter';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ToolsPanel } from './components/ToolsPanel';
import { ViewSwitcher } from './components/ViewSwitcher';
import { useHistory } from './hooks/useHistory';
import { HintPanel } from './components/HintPanel';
import { ExamplesPanel } from './components/ExamplesPanel';
import { exampleCodes } from './services/examples';
import { BottomPanel } from './components/BottomPanel';
import { DebuggerState } from './models';
import { ColorSettingsPanel } from './components/ColorSettingsPanel';
import { FlowchartData, generateFlowchartData } from './services/flowchartGenerator';
import { LearningModeGuide } from './components/LearningModeGuide';
import { FlowchartPanel } from './components/FlowchartPanel';

const defaultCode = `// Welcome to the Pseudocode Interpreter!
// Write your code here and press 'Run' or 'Debug'.

Module main()
    Declare String name
    
    Display "Hello! What should I call you?"
    Input name
    
    Display "Welcome, ", name, "!"
    Display "Let's start coding."
End Module
`;

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

type MobileView = 'editor' | 'console';

function App() {
  const { 
    state: code, 
    set: setCode, 
    undo, 
    redo,
    reset: resetCode,
    canUndo,
    canRedo
  } = useHistory<string>('');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAwaitingInput, setIsAwaitingInput] = useState<boolean>(false);
  const [isHintVisible, setIsHintVisible] = useState<boolean>(false);
  const [isExamplesPanelVisible, setIsExamplesPanelVisible] = useState<boolean>(false);
  const [isToolsPanelVisible, setIsToolsPanelVisible] = useState<boolean>(false);
  const [isColorSettingsVisible, setIsColorSettingsVisible] = useState<boolean>(false);
  const [isFlowchartVisible, setIsFlowchartVisible] = useState<boolean>(false);
  const [isLearningCenterOpen, setIsLearningCenterOpen] = useState(false);
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isOutputVisible, setIsOutputVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeMobileView, setActiveMobileView] = useState<MobileView>('editor');

  // Debugger State
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [executionLine, setExecutionLine] = useState<number | null>(null);
  const [currentScope, setCurrentScope] = useState<Record<string, any>>({});
  
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const inputResolverRef = useRef<((value: string | null) => void) | null>(null);
  const stopExecutionRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debuggerIterator = useRef<AsyncGenerator<DebuggerState, void, unknown> | null>(null);

  useEffect(() => {
    loadCode().then(savedCode => {
      resetCode(savedCode ?? defaultCode);
    }).catch(error => {
      console.error("Failed to load code from DB:", error);
      resetCode(defaultCode);
    }).finally(() => {
      setTimeout(() => setIsLoaded(true), 250);
    });
  }, [resetCode]);

  useEffect(() => {
    if (!isLoaded || isLearningCenterOpen) return;
    setSaveStatus('saving');
    const handler = setTimeout(() => {
      saveCode(code).then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }).catch(error => {
        console.error("Failed to save code:", error);
        setSaveStatus('idle');
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [code, isLoaded, isLearningCenterOpen]);
  
  const cleanupExecution = () => {
    setIsRunning(false);
    setIsAwaitingInput(false);
    inputResolverRef.current = null;
    setIsDebugMode(false);
    setIsPaused(false);
    debuggerIterator.current = null;
    // Don't clear executionLine on cleanup, so the last executed line remains highlighted
  };
  
  const handleStartLearningMode = () => {
    setOutput([]);
    setErrorLine(null);
    setExecutionLine(null);
    setIsLearningCenterOpen(true);
  };
  
  const handleExitLearningMode = () => {
    setIsLearningCenterOpen(false);
    resetCode(defaultCode);
  };

  const handleLoadLearningCode = useCallback((codeToLoad: string) => {
      setCode(codeToLoad);
      setErrorLine(null);
      setExecutionLine(null);
  }, [setCode]);

  const handleStart = useCallback(async (mode: 'run' | 'debug') => {
    if (!isDesktop) {
        setActiveMobileView('console');
    }
    setErrorLine(null);
    setExecutionLine(null);
    setCurrentScope({});
    stopExecutionRef.current = false;
    setIsRunning(true);
    setOutput(['Running program...']);
    
    const displayProvider = (values: any[]) => {
      const line = values.map(v => {
        if (typeof v === 'number' && v.toString().includes('.')) {
           return v.toFixed(2);
        }
        return String(v);
      }).join('');
      setOutput(prev => [...prev, line]);
    };

    const inputProvider = (promptMessage: string): Promise<string | null> => {
      setOutput(prev => [...prev, promptMessage]);
      setIsAwaitingInput(true);
      return new Promise(resolve => {
        inputResolverRef.current = resolve;
      });
    };
    
    try {
      if (mode === 'debug') {
        setIsDebugMode(true);
        const generator = interpret(code, displayProvider, inputProvider, () => stopExecutionRef.current, 'debug');
        debuggerIterator.current = generator as AsyncGenerator<DebuggerState, void, unknown>;
        await handleStepOver(); // Execute the first step to pause at the beginning
      } else {
        const runner = interpret(code, displayProvider, inputProvider, () => stopExecutionRef.current, 'run');
        await (runner as Promise<void>);
        setOutput(prev => [...prev, 'Program finished.']);
        cleanupExecution();
      }
    } catch (e) {
      if (e instanceof ProgramStoppedError) {
        setOutput(prev => [...prev, `Program stopped by user.`]);
      } else if (e instanceof InterpreterError) {
        setOutput(prev => [...prev, `Error on line ${e.lineNumber}: ${e.message}`]);
        setErrorLine(e.lineNumber);
        if (!isDesktop) setActiveMobileView('editor');
      } else if (e instanceof Error) {
        setOutput(prev => [...prev, `Runtime Error: ${e.message}`]);
      } else {
        setOutput(prev => [...prev, 'An unknown error occurred.']);
      }
      cleanupExecution();
    }
  }, [code, isDesktop]);

  const handleStepOver = useCallback(async () => {
    if (!debuggerIterator.current) return;
    
    setIsPaused(false);
    // FIX: Avoid destructuring to help TypeScript with type narrowing.
    const result = await debuggerIterator.current.next();

    // FIX: Using a guard clause for the 'done' case allows TypeScript to correctly infer
    // that in the remaining code path, `result.value` is of type `DebuggerState`, resolving the type error.
    if (result.done) {
        setOutput(prev => [...prev, 'Program finished.']);
        cleanupExecution();
        return;
    }
    
    setExecutionLine(result.value.lineNumber);
    setCurrentScope(result.value.scope);
    setIsPaused(true);
  }, []);

  const handleContinue = useCallback(async () => {
    if (!debuggerIterator.current) return;

    setIsPaused(false);
    setExecutionLine(null);

    let result;
    do {
        result = await debuggerIterator.current.next();
        // We don't update state here to let it run at full speed
    } while (!result.done);

    setOutput(prev => [...prev, 'Program finished.']);
    cleanupExecution();
  }, []);

  const handleStop = useCallback(() => {
    stopExecutionRef.current = true;
    if (inputResolverRef.current) {
        inputResolverRef.current(null);
    }
    // If debugger is paused, we need to advance it one step to catch the stop signal
    if (debuggerIterator.current && isPaused) {
        debuggerIterator.current.next();
    }
    cleanupExecution();
  }, [isPaused]);

  const handleInputSubmit = (value: string) => {
    setOutput(prev => [...prev, `$ ${value}`]);
    if (inputResolverRef.current) {
        inputResolverRef.current(value);
    }
    setIsAwaitingInput(false);
    inputResolverRef.current = null;
  };

  const handleShowHints = () => setIsHintVisible(true);
  const handleCloseHints = () => setIsHintVisible(false);
  const handleShowTools = () => setIsToolsPanelVisible(true);
  const handleCloseTools = () => setIsToolsPanelVisible(false);
  const handleShowExamples = () => setIsExamplesPanelVisible(true);
  const handleCloseExamples = () => setIsExamplesPanelVisible(false);
  const handleShowColorSettings = () => setIsColorSettingsVisible(true);
  const handleCloseColorSettings = () => setIsColorSettingsVisible(false);

  const handleGenerateFlowchart = useCallback(() => {
    setErrorLine(null);
    try {
        const data = generateFlowchartData(code);
        setFlowchartData(data);
        setIsFlowchartVisible(true);
    } catch (e) {
        if (e instanceof InterpreterError) {
            setOutput(prev => [`Flowchart generation failed.`, `Error on line ${e.lineNumber}: ${e.message}`]);
            setErrorLine(e.lineNumber);
            if (!isDesktop) setActiveMobileView('console');
        } else if (e instanceof Error) {
            setOutput(prev => [`Flowchart generation failed.`, `Error: ${e.message}`]);
            if (!isDesktop) setActiveMobileView('console');
        } else {
            setOutput(prev => ['An unknown error occurred during flowchart generation.']);
            if (!isDesktop) setActiveMobileView('console');
        }
    }
  }, [code, isDesktop]);

  const handleCloseFlowchart = () => setIsFlowchartVisible(false);

  const handleLoadExample = (exampleCode: string) => {
    const isPristineExample = exampleCodes.has(code);
    const isDefault = code === defaultCode;
    const isEditorEmpty = code.trim() === '';

    const requiresConfirmation = !isPristineExample && !isDefault && !isEditorEmpty;

    if (requiresConfirmation) {
        if (!window.confirm("Loading an example will replace your current code. Are you sure you want to continue?")) {
            return;
        }
    }
    resetCode(exampleCode);
    setErrorLine(null);
    setExecutionLine(null);
    handleCloseExamples();
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  const handleToggleConsole = () => setIsOutputVisible(prev => !prev);

  const handleSaveFile = useCallback(() => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pseudocode.txt';
    a.click();
    URL.revokeObjectURL(url);
    handleCloseTools();
  }, [code]);

  const handleFormatCode = () => {
    try {
      const formatted = formatCode(code);
      setCode(formatted);
    } catch (error) {
      console.error("Formatting failed:", error);
    }
    handleCloseTools();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };
  
  const handleLoadFileClick = () => {
    fileInputRef.current?.click();
    handleCloseTools();
  };
  
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          resetCode(text);
          setErrorLine(null);
          setExecutionLine(null);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };
  
  const handleClearConsole = () => {
    setOutput([]);
    handleCloseTools();
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-[var(--accent-primary)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-[var(--text-secondary)]">Loading your code...</p>
        </div>
      </div>
    );
  }
  
  const editorPanel = <CodeEditor code={code} setCode={setCode} zoomLevel={zoomLevel} errorLine={errorLine} executionLine={executionLine} />;
  const bottomPanel = <BottomPanel output={output} isAwaitingInput={isAwaitingInput} onInputSubmit={handleInputSubmit} zoomLevel={zoomLevel} onClearConsole={handleClearConsole} scope={currentScope} isDebugMode={isDebugMode} />;
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] text-[var(--text-primary)]">
      <Header 
        onRun={() => handleStart('run')}
        onDebug={() => handleStart('debug')}
        onStop={handleStop} 
        onStepOver={handleStepOver}
        onContinue={handleContinue}
        isRunning={isRunning}
        isDebugMode={isDebugMode}
        isPaused={isPaused}
        onShowHints={handleShowHints}
        onShowExamples={handleShowExamples}
        onShowColorSettings={handleShowColorSettings}
        onGenerateFlowchart={handleGenerateFlowchart}
        onSaveFile={handleSaveFile}
        onLoadFile={handleLoadFileClick}
        onFormatCode={handleFormatCode}
        onCopyCode={handleCopyCode}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isConsoleVisible={isOutputVisible}
        onToggleConsole={handleToggleConsole}
        saveStatus={saveStatus}
        onShowTools={handleShowTools}
        onStartLearningMode={handleStartLearningMode}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <main 
        className="flex-grow flex flex-col p-2 sm:p-4 overflow-hidden transition-[padding-bottom] duration-300"
        style={isLearningCenterOpen && !isDesktop ? { paddingBottom: 'var(--learning-guide-height)' } : undefined}
      >
        {isDesktop ? (
            <ResizablePanels isSecondPanelVisible={isOutputVisible}>
              {editorPanel}
              {bottomPanel}
            </ResizablePanels>
        ) : (
            <div className="flex-grow flex flex-col overflow-hidden">
                <ViewSwitcher activeView={activeMobileView} onViewChange={setActiveMobileView} />
                <div className="flex-grow mt-2 overflow-hidden">
                    {activeMobileView === 'editor' ? editorPanel : bottomPanel}
                </div>
            </div>
        )}
      </main>

      {isLearningCenterOpen && (
          <LearningModeGuide
              onExit={handleExitLearningMode}
              onLoadCode={handleLoadLearningCode}
          />
      )}
      {isHintVisible && <HintPanel onClose={handleCloseHints} />}
      {isExamplesPanelVisible && <ExamplesPanel onClose={handleCloseExamples} onLoad={handleLoadExample} />}
      {isToolsPanelVisible && 
        <ToolsPanel 
            onClose={handleCloseTools} 
            onFormatCode={handleFormatCode}
            onCopyCode={handleCopyCode}
            onLoadFile={handleLoadFileClick}
            onSaveFile={handleSaveFile}
            zoomLevel={zoomLevel}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onClearConsole={handleClearConsole}
            onShowHints={handleShowHints}
            onShowExamples={handleShowExamples}
            onShowColorSettings={handleShowColorSettings}
            onGenerateFlowchart={handleGenerateFlowchart}
            onStartLearningMode={() => { handleCloseTools(); handleStartLearningMode(); }}
            onSelectConsole={() => setActiveMobileView('console')}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
        />
      }
      {isColorSettingsVisible && <ColorSettingsPanel onClose={handleCloseColorSettings} />}
      {isFlowchartVisible && flowchartData && <FlowchartPanel data={flowchartData} onClose={handleCloseFlowchart} />}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelected}
        className="hidden" 
        accept=".txt,.ps, .pseudo"
      />
    </div>
  );
}

export default App;