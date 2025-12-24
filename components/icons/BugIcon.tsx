import React from 'react';

export const BugIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path fillRule="evenodd" d="M12 21a9 9 0 009-9V8.25a3 3 0 00-3-3H6a3 3 0 00-3 3V12a9 9 0 009 9zm-1.05-5.05a.75.75 0 011.06 0l1.25 1.25a.75.75 0 01-1.06 1.06L12 17.06l-1.25 1.25a.75.75 0 01-1.06-1.06l1.25-1.25zM12 6a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V6.75A.75.75 0 0112 6z" clipRule="evenodd" />
    <path d="M9.75 4.5a.75.75 0 01.75-.75h3a.75.75 0 010 1.5h-3a.75.75 0 01-.75-.75z" />
  </svg>
);
