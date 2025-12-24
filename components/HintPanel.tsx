import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface HintPanelProps {
    onClose: () => void;
}

const HintItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <span className={`inline-block bg-[var(--bg-tertiary)] px-3 py-1 rounded-full text-sm font-mono border border-[var(--border-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)] transition-colors cursor-default ${className}`}>
        {children}
    </span>
);

export const HintPanel: React.FC<HintPanelProps> = ({ onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 200); // match transition duration
    };

    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Close on outside click
    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
            handleClose();
        }
    };

    const keywords = [
        'Module', 'End Module', 'Function', 'End Function', 'Call', 'Return',
        'Constant', 'Declare', 'Set', 'Display', 'Input', 'If', 'Then', 'Else',
        'End If', 'Do', 'Until', 'While', 'End While', 'For', 'To', 'End For', 'And', 'Or', 'Not', 'Tap', 'Mod'
    ];
    const dataTypes = ['Integer', 'Real', 'String', 'Ref'];
    const operators = ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '()', '[]', ','];
    const functions = [
        'random(min, max)', 'power(base, exp)', 'sqrt(n)', 'abs(n)', 'round(n)', 'sin(n)', 'cos(n)', 'tan(n)',
        'toInteger(n)', 'toReal(n)', 'stringToInteger(s)', 'stringToReal(s)', 'isInteger(s)', 'isReal(s)',
        'currencyFormat(n)', 'length(s)', 'toUpper(s)', 'toLower(s)', 'append(s1, s2)', 'contains(s1, s2)',
        'substring(s, start, end)'
    ];

    const backdropClasses = `fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`;
    const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 w-full h-full sm:h-auto rounded-none sm:rounded-xl sm:max-w-4xl sm:max-h-[85vh] flex flex-col border border-[var(--border-primary)] transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isDesktop ? 'shadow-[0_0_50px_-15px_var(--shadow-color-secondary)]' : 'shadow-2xl'}`;

    return (
        <div 
            className={backdropClasses}
            onClick={handleBackdropClick}
            aria-modal="true"
            role="dialog"
        >
            <div 
                ref={panelRef} 
                className={panelClasses}
            >
                <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--text-secondary)]">Pseudocode Reference</h2>
                    <button 
                        onClick={handleClose} 
                        className="p-1 rounded-full hover:bg-[var(--bg-hover)] transition-colors"
                        aria-label="Close hints"
                    >
                        <XIcon className="w-6 h-6 text-[var(--text-muted)]"/>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    <section>
                        <h3 className="text-md font-semibold text-[var(--text-secondary)] mb-3">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                            {keywords.map(kw => <HintItem key={kw} className="text-[var(--syntax-keyword)] font-semibold">{kw}</HintItem>)}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-md font-semibold text-[var(--text-secondary)] mb-3">Data Types</h3>
                        <div className="flex flex-wrap gap-2">
                            {dataTypes.map(dt => <HintItem key={dt} className="text-[var(--syntax-dataType)]">{dt}</HintItem>)}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-md font-semibold text-[var(--text-secondary)] mb-3">Operators & Symbols</h3>
                        <div className="flex flex-wrap gap-2">
                            {operators.map(op => <HintItem key={op} className="text-[var(--syntax-operator)]">{op}</HintItem>)}
                        </div>
                    </section>
                    <section>
                        <h3 className="text-md font-semibold text-[var(--text-secondary)] mb-3">Built-in Functions</h3>
                        <div className="flex flex-wrap gap-2">
                            {functions.map(fn => <HintItem key={fn} className="text-[var(--syntax-identifier)]">{fn}</HintItem>)}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
};