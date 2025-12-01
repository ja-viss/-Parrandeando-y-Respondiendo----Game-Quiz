import * as React from 'react';

export function CuatroIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M11.98 12.54c-1.12 1.12-2.93 1.12-4.05 0a2.86 2.86 0 0 1 0-4.05c1.12-1.12 2.93-1.12 4.05 0" />
      <path d="m12 12.5 6.5 6.5" />
      <path d="M12.53 4.2a2.86 2.86 0 0 1 4.05 0c1.12 1.12 1.12 2.93 0 4.05l-4.05 4.05" />
      <path d="M19 12h2" />
      <path d="M12 19v2" />
      <path d="M19.5 19.5 21 21" />
      <path d="m5 12-2.5 2.5" />
      <path d="m6.5 17.5 5-5" />
    </svg>
  );
}
