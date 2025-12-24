import { useState, useCallback } from 'react';

export const useHistory = <T,>(initialState: T) => {
  const [history, setHistory] = useState<{ past: T[], present: T, future: T[] }>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback((newState: T) => {
    setHistory(current => {
      if (newState === current.present) {
        return current;
      }
      return {
        past: [...current.past, current.present],
        present: newState,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(current => {
      if (current.past.length === 0) return current;
      const newPresent = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, current.past.length - 1);
      return {
        past: newPast,
        present: newPresent,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(current => {
      if (current.future.length === 0) return current;
      const newPresent = current.future[0];
      const newFuture = current.future.slice(1);
      return {
        past: [...current.past, current.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newInitialState: T) => {
    setHistory({
      past: [],
      present: newInitialState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
};