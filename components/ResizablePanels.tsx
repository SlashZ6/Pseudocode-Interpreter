import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ResizablePanelsProps {
  children: [React.ReactNode, React.ReactNode];
  isSecondPanelVisible: boolean;
}

const MIN_PERCENTAGE = 15;
const SPLIT_STORAGE_KEY = 'pseudocode-interpreter-split-position';

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({ children, isSecondPanelVisible }) => {
  const [splitPosition, setSplitPosition] = useState(() => {
    try {
        const savedPosition = localStorage.getItem(SPLIT_STORAGE_KEY);
        return savedPosition ? parseFloat(savedPosition) : 50;
    } catch (error) {
        console.warn("Could not access localStorage for split position.", error);
        return 50;
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  
  const isDesktop = useMediaQuery('(min-width: 768px)'); 

  const [leftPanel, rightPanel] = children;

  useEffect(() => {
    try {
      localStorage.setItem(SPLIT_STORAGE_KEY, String(splitPosition));
    } catch (error) {
      console.warn("Could not save split position to localStorage.", error);
    }
  }, [splitPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = isDesktop ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent default touch behavior like scrolling
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.userSelect = '';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    let newSplit;
    if (isDesktop) {
        const position = e.clientX - containerRect.left;
        newSplit = (position / containerRect.width) * 100;
    } else {
        const position = e.clientY - containerRect.top;
        newSplit = (position / containerRect.height) * 100;
    }

    if (newSplit < MIN_PERCENTAGE) newSplit = MIN_PERCENTAGE;
    if (newSplit > 100 - MIN_PERCENTAGE) newSplit = 100 - MIN_PERCENTAGE;

    setSplitPosition(newSplit);
  }, [isDesktop]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    
    const touch = e.touches[0];
    if (!touch) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    let newSplit;
    if (isDesktop) {
        const position = touch.clientX - containerRect.left;
        newSplit = (position / containerRect.width) * 100;
    } else {
        const position = touch.clientY - containerRect.top;
        newSplit = (position / containerRect.height) * 100;
    }

    if (newSplit < MIN_PERCENTAGE) newSplit = MIN_PERCENTAGE;
    if (newSplit > 100 - MIN_PERCENTAGE) newSplit = 100 - MIN_PERCENTAGE;

    setSplitPosition(newSplit);
  }, [isDesktop]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  const firstPanelStyle = isDesktop 
    ? { width: isSecondPanelVisible ? `calc(${splitPosition}% - 6px)` : '100%' }
    : { height: isSecondPanelVisible ? `calc(${splitPosition}% - 6px)` : '100%' };
    
  const secondPanelStyle = isDesktop 
    ? { width: `calc(${100 - splitPosition}% - 6px)` }
    : { height: `calc(${100 - splitPosition}% - 6px)` };

  return (
    <div ref={containerRef} className="flex flex-col md:flex-row w-full h-full gap-3">
      <div 
        className="transition-all duration-150"
        style={firstPanelStyle}
      >
        {leftPanel}
      </div>

      {isSecondPanelVisible && (
        <>
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="flex-shrink-0 w-full h-3 md:w-3 md:h-full flex items-center justify-center cursor-row-resize md:cursor-col-resize group"
            role="separator"
            aria-orientation={isDesktop ? 'vertical' : 'horizontal'}
            aria-label="Resize panels"
          >
            <div className="w-1 h-8 md:w-8 md:h-1 bg-[var(--border-primary)] rounded-full group-hover:bg-[var(--accent-primary)] transition-colors duration-150"></div>
          </div>
          <div style={secondPanelStyle}>
            {rightPanel}
          </div>
        </>
      )}
    </div>
  );
};