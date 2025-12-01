import * as React from 'react';

export function GingerbreadManIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 11.3a5 5 0 1 0-12 0" />
      <path d="M21 14.3a2.5 2.5 0 0 0-5 0v.7a2.5 2.5 0 0 1-5 0v-.7a2.5 2.5 0 0 0-5 0v.7a2.5 2.5 0 1 0 5 0v-1.5a2.5 2.5 0 1 1 5 0v1.5a2.5 2.5 0 1 0 5 0z" />
      <path d="M6 18.5a2.5 2.5 0 1 0 5 0v-1.7a2.5 2.5 0 1 1 5 0v1.7a2.5 2.5 0 1 0 5 0" />
      <path d="M9.5 8.5v.01" />
      <path d="M14.5 8.5v.01" />
    </svg>
  );
}
