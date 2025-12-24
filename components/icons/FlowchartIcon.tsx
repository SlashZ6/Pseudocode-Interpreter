import React from 'react';

export const FlowchartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 1.5m-2.25-1.5a2.25 2.25 0 00-2.25 2.25V21a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0018 21v-2.25a2.25 2.25 0 00-2.25-2.25m-7.5 0h7.5"
    />
  </svg>
);