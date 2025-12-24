import React, { useState, useEffect, useRef } from 'react';
import { SendIcon } from './icons/SendIcon';

interface InputBarProps {
  onSubmit: (value: string) => void;
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus the input field when it appears
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || inputValue.length === 0) {
      onSubmit(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center mt-2">
      <span className="text-[var(--accent-primary)] mr-2">{'$'}</span>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-grow bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--border-focus)] text-[var(--text-primary)]"
        autoComplete="off"
      />
      <button
        type="submit"
        className="ml-2 p-2 bg-[var(--accent-primary)] text-[var(--text-inverted)] rounded-lg hover:brightness-110 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)] focus:ring-[var(--border-focus)] disabled:bg-[var(--disabled-bg)]"
        aria-label="Submit input"
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
};