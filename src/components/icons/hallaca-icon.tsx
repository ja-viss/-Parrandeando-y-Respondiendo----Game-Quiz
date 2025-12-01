import * as React from 'react';

export function HallacaIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21.5 11.5c-1.2-1.2-2.8-2-4.5-2s-3.3.8-4.5 2-2.8 2-4.5 2-3.3-.8-4.5-2" />
      <path d="M2.5 12.5c1.2 1.2 2.8 2 4.5 2s3.3-.8 4.5-2 2.8-2 4.5-2 3.3.8 4.5 2" />
      <path d="M2.5 11.5 12 3l9.5 8.5" />
      <path d="m12 3-2 2.5" />
      <path d="m14 5.5-2 2.5" />
      <path d="m12 21 9.5-8.5" />
      <path d="M2.5 12.5 12 21" />
    </svg>
  );
}
