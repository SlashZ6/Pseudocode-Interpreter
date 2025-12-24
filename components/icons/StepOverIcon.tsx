import React from 'react';

export const StepOverIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.25v-10.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 17.25h13.5" />
  </svg>
);
