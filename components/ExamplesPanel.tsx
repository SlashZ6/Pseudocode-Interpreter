import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { examples } from '../services/examples';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ExamplesPanelProps {
    onClose: () => void;
    onLoad: (code: string) => void;
}

const categories = ['Basics', 'Conditionals', 'Loops', 'Functions & Modules', 'Recursion & Arrays'];

export const ExamplesPanel: React.FC<ExamplesPanelProps> = ({ onClose, onLoad }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
            handleClose();
        }
    };

    const backdropClasses = `fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`;
    const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 w-full h-full sm:h-auto rounded-none sm:rounded-xl sm:max-w-4xl sm:max-h-[85vh] flex flex-col border border-[var(--border-primary)] transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isDesktop ? 'shadow-[0_0_50px_-15px_var(--shadow-color-secondary)]' : 'shadow-2xl'}`;

    return (
        <div 
            className={backdropClasses}
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
        >
            <div ref={panelRef} className={panelClasses}>
                <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--text-secondary)]">Code Examples</h2>
                    <button 
                        onClick={handleClose} 
                        className="p-1 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
                        aria-label="Close examples"
                    >
                        <XIcon className="w-6 h-6 text-[var(--text-muted)]"/>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    {categories.map(category => (
                        <section key={category}>
                            <h3 className="text-md font-semibold text-[var(--text-secondary)] mb-3 border-b border-[var(--border-primary)] pb-2">{category}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {examples.filter(ex => ex.category === category).map(example => (
                                    <div key={example.title} className="bg-[var(--bg-tertiary)] p-4 rounded-lg border border-[var(--border-primary)] flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)]">{example.title}</h4>
                                            <p className="text-sm text-[var(--text-secondary)] mt-1 mb-3">{example.description}</p>
                                        </div>
                                        <button 
                                            onClick={() => onLoad(example.code)}
                                            className="self-start px-3 py-1.5 bg-[var(--accent-primary)] text-[var(--text-inverted)] text-sm font-semibold rounded-md shadow-sm hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-tertiary)] focus:ring-[var(--border-focus)] active:scale-95"
                                        >
                                            Load Example
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </main>
            </div>
        </div>
    );
};