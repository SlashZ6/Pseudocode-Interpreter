import React from 'react';

type MobileView = 'editor' | 'console';

interface ViewSwitcherProps {
  activeView: MobileView;
  onViewChange: (view: MobileView) => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, onViewChange }) => {
  const getButtonClass = (view: MobileView) => {
    const baseClass = "w-full py-3 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]";
    if (activeView === view) {
      return `${baseClass} bg-[var(--bg-tertiary)] text-[var(--text-primary)]`;
    }
    return `${baseClass} bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]`;
  };

  return (
    <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden shadow-sm">
      <button
        onClick={() => onViewChange('editor')}
        className={`${getButtonClass('editor')} rounded-l-md`}
        aria-pressed={activeView === 'editor'}
      >
        Editor
      </button>
      <div className="w-px bg-[var(--border-primary)]"></div>
      <button
        onClick={() => onViewChange('console')}
        className={`${getButtonClass('console')} rounded-r-md`}
        aria-pressed={activeView === 'console'}
      >
        Console
      </button>
    </div>
  );
};