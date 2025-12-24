import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { PaletteIcon } from './icons/PaletteIcon';

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themes = [
    { name: 'slate', label: 'Neon Night' },
    { name: 'dark', label: 'Onyx' },
    { name: 'light', label: 'Daybreak' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: 'slate' | 'dark' | 'light') => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold rounded-lg shadow-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-opacity-75"
        aria-label="Change theme"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <PaletteIcon className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-xl z-20">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => handleThemeChange(t.name as 'slate' | 'dark' | 'light')}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                theme === t.name
                  ? 'bg-[var(--accent-secondary)] text-white'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              } ${t.name === themes[0].name ? 'rounded-t-lg' : ''} ${t.name === themes[themes.length - 1].name ? 'rounded-b-lg' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};