import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { LearningStep, LearningTopicGuide, learningGuides } from '../services/learningSteps';
import { XIcon } from './icons/XIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface LearningModeGuideProps {
  onExit: () => void;
  onLoadCode: (code: string) => void;
}

const PADDING = 10;
const TOOLTIP_OFFSET = 12;

const TopicHighlighter: React.FC<{ step: LearningStep | null }> = ({ step }) => {
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useLayoutEffect(() => {
        const updateRect = () => {
            if (!step || !step.targetId) {
                setTargetRect(null);
                return;
            }
            const targetElement = document.querySelector(`[data-tutorial-id='${step.targetId}']`);
            const rect = targetElement ? targetElement.getBoundingClientRect() : null;
            setTargetRect(rect);
        };

        updateRect();
        
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);
        
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [step]);

    if (!targetRect) return null;

    const highlightStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${targetRect.top - PADDING / 2}px`,
        left: `${targetRect.left - PADDING / 2}px`,
        width: `${targetRect.width + PADDING}px`,
        height: `${targetRect.height + PADDING}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        border: '2px solid var(--accent-primary)',
        borderRadius: '8px',
        zIndex: 50,
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out',
    };
    
    return <div style={highlightStyle} />;
};


export const LearningModeGuide: React.FC<LearningModeGuideProps> = ({ onExit, onLoadCode }) => {
    const [activeGuide, setActiveGuide] = useState<LearningTopicGuide | null>(null);
    const [stepIndex, setStepIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
    const panelRef = useRef<HTMLDivElement>(null);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const handleExit = () => {
        setIsClosing(true);
        setTimeout(onExit, 300);
    };

    const handleSelectGuide = (guide: LearningTopicGuide) => {
        setActiveGuide(guide);
        setStepIndex(0);
    };

    const handleNext = () => {
        if (!activeGuide) return;
        if (stepIndex < activeGuide.steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            setActiveGuide(null);
        }
    };
    
    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    };

    const handleBackToTopics = () => {
        setActiveGuide(null);
    };

    const currentStep = activeGuide ? activeGuide.steps[stepIndex] : null;
    const hasHighlight = !!(currentStep && currentStep.targetId);

    // Determine panel style based on screen size and if there's a target element
    const panelDisplayMode = isDesktop
        ? (hasHighlight ? 'tooltip' : 'centered')
        : 'bottom-sheet';

    useEffect(() => {
        if (currentStep?.code) {
            onLoadCode(currentStep.code);
        } else if (!activeGuide) {
            onLoadCode(`// Select a topic to begin the tutorial.`);
        }
    }, [currentStep, activeGuide, onLoadCode]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleExit();
            if (!activeGuide) return;
            if (event.key === 'ArrowRight') handleNext();
            if (event.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGuide, stepIndex]);
    
    // This effect is only for positioning desktop tooltips
    useLayoutEffect(() => {
        if (panelDisplayMode !== 'tooltip' || !panelRef.current || !currentStep?.targetId) {
            setPanelStyle({});
            return;
        }

        const targetElement = document.querySelector(`[data-tutorial-id='${currentStep.targetId}']`);
        if (!targetElement) {
             setPanelStyle({}); // Fallback to center if target not found
             return;
        }
        
        const targetRect = targetElement.getBoundingClientRect();
        const panelRect = panelRef.current.getBoundingClientRect();
        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;

        let top = 0;
        let left = 0;
        const position = currentStep.position || 'right';

        switch (position) {
            case 'right':
                left = targetRect.right + TOOLTIP_OFFSET;
                top = targetRect.top + targetRect.height / 2 - panelRect.height / 2;
                break;
            case 'left':
                left = targetRect.left - panelRect.width - TOOLTIP_OFFSET;
                top = targetRect.top + targetRect.height / 2 - panelRect.height / 2;
                break;
            case 'bottom':
                top = targetRect.bottom + TOOLTIP_OFFSET;
                left = targetRect.left + targetRect.width / 2 - panelRect.width / 2;
                break;
            case 'top':
                top = targetRect.top - panelRect.height - TOOLTIP_OFFSET;
                left = targetRect.left + targetRect.width / 2 - panelRect.width / 2;
                break;
            case 'center':
            default:
                top = winHeight / 2 - panelRect.height / 2;
                left = winWidth / 2 - panelRect.width / 2;
        }

        left = Math.max(PADDING, Math.min(left, winWidth - panelRect.width - PADDING));
        top = Math.max(PADDING, Math.min(top, winHeight - panelRect.height - PADDING));
        
        setPanelStyle({ top: `${top}px`, left: `${left}px` });
    }, [currentStep, panelDisplayMode]);

    // This effect calculates the height of the bottom-sheet panel and sets a CSS variable
    // so the main content area can be padded accordingly, preventing overlap.
    useLayoutEffect(() => {
        const root = document.documentElement;
        if (panelDisplayMode !== 'bottom-sheet' || !panelRef.current) {
            root.style.removeProperty('--learning-guide-height');
            return;
        }

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const height = entry.contentRect.height;
                root.style.setProperty('--learning-guide-height', `${height}px`);
            }
        });

        observer.observe(panelRef.current);

        return () => {
            observer.disconnect();
            root.style.removeProperty('--learning-guide-height');
        };
    }, [panelDisplayMode, activeGuide, currentStep]);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
            handleExit();
        }
    };
    
    const panelContent = (
        <React.Fragment>
             <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                <div className="flex items-center gap-4">
                    {activeGuide && (
                        <button onClick={handleBackToTopics} className="p-1 rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </button>
                    )}
                    <h2 className="text-lg font-bold text-[var(--text-secondary)] flex items-center gap-2">
                        <BookOpenIcon className="w-6 h-6 text-[var(--accent-primary)]" />
                        {activeGuide ? activeGuide.topic : 'Learning Center'}
                    </h2>
                </div>
                <button onClick={handleExit} className="p-1 rounded-full hover:bg-[var(--bg-hover)]" aria-label="Close Learning Center">
                    <XIcon className="w-6 h-6 text-[var(--text-muted)]"/>
                </button>
            </header>
            <main className="p-6 overflow-y-auto flex-grow">
                {!activeGuide ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {learningGuides.map(guide => (
                            <button key={guide.topic} onClick={() => handleSelectGuide(guide)} className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-primary)] text-left hover:border-[var(--accent-primary)] transition-all hover:scale-105">
                                <h3 className="font-bold text-lg text-[var(--text-primary)]">{guide.topic}</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">{guide.description}</p>
                            </button>
                        ))}
                    </div>
                ) : (
                    currentStep && (
                        <div className="flex flex-col h-full">
                            <div className="flex-grow space-y-4">
                                <h3 className="text-xl font-bold text-[var(--accent-primary)]">{currentStep.title}</h3>
                                <p 
                                    className="text-md text-[var(--text-secondary)] leading-relaxed" 
                                    dangerouslySetInnerHTML={{ __html: currentStep.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--text-primary)]">$1</strong>') }}
                                />
                            </div>
                            <footer className="mt-6 pt-4 border-t border-[var(--border-primary)] flex justify-between items-center">
                                <span className="text-sm font-mono text-[var(--text-muted)]">Step {stepIndex + 1} of {activeGuide.steps.length}</span>
                                <div className="flex items-center gap-3">
                                    <button onClick={handlePrev} disabled={stepIndex === 0} className="px-4 py-1.5 bg-[var(--bg-tertiary)] text-sm font-semibold rounded-md shadow-sm hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                                        Previous
                                    </button>
                                    <button onClick={handleNext} className="px-4 py-1.5 bg-[var(--accent-secondary)] text-white text-sm font-semibold rounded-md shadow-sm hover:brightness-110">
                                        {stepIndex === activeGuide.steps.length - 1 ? 'Finish Topic' : 'Next'}
                                    </button>
                                </div>
                            </footer>
                        </div>
                    )
                )}
            </main>
        </React.Fragment>
    );

    const highlighter = hasHighlight ? <TopicHighlighter step={currentStep} /> : null;

    if (panelDisplayMode === 'bottom-sheet') {
        // Ensure backdrop sits above highlighter (z-60 > z-50) to make text readable
        // If highlighter exists, let it handle the dimming (bg-transparent)
        const backdropColor = hasHighlight ? 'bg-transparent' : 'bg-black/60';
        // Allow scrolling/interaction on mobile if we are highlighting something
        const pointerEvents = hasHighlight ? 'pointer-events-none' : 'pointer-events-auto';

        const backdropClasses = `fixed inset-0 z-[60] flex items-end justify-center transition-colors duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'} ${backdropColor} ${pointerEvents}`;
        const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 backdrop-blur-sm rounded-t-2xl shadow-2xl w-full max-w-2xl flex flex-col border-t border-[var(--border-primary)] transition-transform duration-300 transform-gpu ${isClosing ? 'translate-y-full' : 'translate-y-0'} max-h-[75vh] sm:max-h-[85vh] pointer-events-auto`;

        return (
            <>
                {highlighter}
                <div className={backdropClasses} onClick={hasHighlight ? undefined : handleBackdropClick}>
                    <div ref={panelRef} className={panelClasses} onClick={(e) => e.stopPropagation()}>
                        {panelContent}
                    </div>
                </div>
            </>
        );
    }
    
    if (panelDisplayMode === 'tooltip') {
        const tooltipPanelClasses = `fixed z-[51] bg-[var(--bg-secondary)]/95 backdrop-blur-sm shadow-[0_0_50px_-15px_var(--shadow-color-secondary)] flex flex-col border border-[var(--border-primary)] transition-all duration-300 rounded-xl max-w-sm ${isClosing ? 'opacity-0' : 'opacity-100'}`;
        
        return (
            <>
                {highlighter}
                <div ref={panelRef} className={tooltipPanelClasses} style={panelStyle}>
                    {panelContent}
                </div>
            </>
        );
    }

    // Default: Desktop Centered
    const backdropClasses = `fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`;
    const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 backdrop-blur-sm shadow-[0_0_50px_-15px_var(--shadow-color-secondary)] w-full h-full sm:h-auto rounded-none sm:rounded-xl sm:max-w-4xl sm:max-h-[85vh] flex flex-col border border-[var(--border-primary)] transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`;

    return (
        <div 
            className={backdropClasses}
            onClick={handleBackdropClick}
        >
            <div 
                ref={panelRef} 
                className={panelClasses}
                onClick={(e) => e.stopPropagation()}
            >
                {panelContent}
            </div>
        </div>
    );
};

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);