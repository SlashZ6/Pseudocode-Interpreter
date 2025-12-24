import React from 'react';

interface ScopePanelProps {
    scope: Record<string, any>;
    zoomLevel: number;
}

const formatValue = (value: any): string => {
    if (typeof value === 'string') {
        return `"${value}"`;
    }
    if (value === null) {
        return 'null';
    }
    if (typeof value === 'number' && value.toString().includes('.')) {
        return value.toFixed(2);
    }
    return String(value);
}

export const ScopePanel: React.FC<ScopePanelProps> = ({ scope, zoomLevel }) => {
    const scopeEntries = Object.entries(scope);

    return (
        <div 
            className="flex-grow p-4 font-mono text-[var(--text-primary)] overflow-y-auto h-full"
            style={{ fontSize: `${zoomLevel}%` }}
        >
            {scopeEntries.length === 0 ? (
                <div className="text-[var(--text-muted)] text-center pt-8">
                    <p>No variables in the current scope.</p>
                    <p className="text-xs mt-1">Start debugging or step into the program to see variables here.</p>
                </div>
            ) : (
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-[var(--border-primary)]">
                            <th className="p-2 text-[var(--text-muted)] font-semibold">Variable</th>
                            <th className="p-2 text-[var(--text-muted)] font-semibold">Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scopeEntries.map(([name, value]) => (
                            <tr key={name} className="border-b border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]">
                                <td className="p-2 text-[var(--syntax-identifier)]">{name}</td>
                                <td className="p-2 text-[var(--text-secondary)]">
                                    <span className={typeof value === 'string' ? 'text-[var(--syntax-string)]' : 'text-[var(--syntax-number)]'}>
                                        {formatValue(value)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
