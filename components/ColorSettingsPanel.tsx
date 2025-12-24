import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { useTheme, SYNTAX_TOKEN_MAP } from './ThemeContext';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ColorSettingsPanelProps {
    onClose: () => void;
}

const ColorSettingRow: React.FC<{ token: string; label: string }> = ({ token, label }) => {
    const { getSyntaxColor, setCustomColorProperty } = useTheme();
    const color = getSyntaxColor(token); // Read directly from context
    const inputRef = useRef<HTMLInputElement>(null);

    // FIX: Inline styles in React do not support pseudo-elements. This effect injects a
    // <style> tag to apply custom styling to the color input's swatch using its ID.
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            #color-${token}::-webkit-color-swatch-wrapper { padding: 0; }
            #color-${token}::-webkit-color-swatch { border: none; border-radius: 0.375rem; }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, [token]);

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setCustomColorProperty(token, newColor); // Update context directly
    };

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
            <label 
                htmlFor={`color-${token}`} 
                className="text-sm text-[var(--text-secondary)] capitalize cursor-pointer"
                onClick={() => inputRef.current?.click()}
            >
                {label}
            </label>
            <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[var(--text-muted)]">{color}</span>
                <input
                    ref={inputRef}
                    id={`color-${token}`}
                    type="color"
                    value={color}
                    onChange={handleColorChange}
                    // The color swatch is its own label, essentially
                    aria-label={`${label} color picker`}
                    className="w-8 h-8 p-0 border-none rounded-md cursor-pointer bg-transparent appearance-none"
                />
            </div>
        </div>
    );
};

export const ColorSettingsPanel: React.FC<ColorSettingsPanelProps> = ({ onClose }) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);
    const { resetCustomColors } = useTheme();
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 200);
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

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset all custom colors for this theme?')) {
            resetCustomColors();
        }
    };

    const backdropClasses = `fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`;
    const panelClasses = `bg-[var(--bg-secondary)] bg-opacity-80 w-full h-full sm:h-auto rounded-none sm:rounded-xl sm:max-w-md sm:max-h-[85vh] flex flex-col border border-[var(--border-primary)] transition-all duration-200 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} ${isDesktop ? 'shadow-[0_0_50px_-15px_var(--shadow-color-secondary)]' : 'shadow-2xl'}`;

    return (
        <div className={backdropClasses} onClick={handleBackdropClick} role="dialog" aria-modal="true">
            <div ref={panelRef} className={panelClasses}>
                <header className="flex justify-between items-center p-4 border-b border-[var(--border-primary)] flex-shrink-0">
                    <h2 className="text-lg font-bold text-[var(--text-secondary)]">Customize Syntax Colors</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-[var(--bg-hover)]" aria-label="Close color settings">
                        <XIcon className="w-6 h-6 text-[var(--text-muted)]"/>
                    </button>
                </header>
                <main className="p-4 overflow-y-auto space-y-2">
                    {Object.entries(SYNTAX_TOKEN_MAP).map(([token, label]) => (
                        <ColorSettingRow key={token} token={token} label={label} />
                    ))}
                </main>
                <footer className="flex justify-between items-center p-4 border-t border-[var(--border-primary)] flex-shrink-0">
                     <button
                        onClick={handleReset}
                        className="px-4 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm font-semibold rounded-md shadow-sm hover:bg-[var(--bg-hover)] transition-colors"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleClose}
                        className="px-4 py-1.5 bg-[var(--accent-secondary)] text-white text-sm font-semibold rounded-md shadow-sm hover:brightness-110 transition-colors"
                    >
                        Done
                    </button>
                </footer>
            </div>
        </div>
    );
};