import * as React from 'react';

export function CarolersIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12 12a3 3 0 1 0-3-3" />
      <path d="M18.5 12a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M12 13.5a3 3 0 0 0-3 3v2" />
      <path d="M18.5 14.5a2.5 2.5 0 0 0-2.5 2.5v2.5" />
      <path d="M12 12a3 3 0 0 1 3-3" />
      <path d="M6.5 12a2.5 2.5 0 1 1 2.5-2.5" />
      <path d="M12 13.5a3 3 0 0 1 3 3v2" />
      <path d="M6.5 14.5a2.5 2.5 0 0 1 2.5 2.5v2.5" />
    </svg>
  );
}
