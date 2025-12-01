import * as React from 'react';

export function MaracaIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M8.83 8.83a5 5 0 0 1 7.07 0" />
      <path d="M17.41 17.41a.5.5 0 0 0 .71 0l2.12-2.12a.5.5 0 0 0 0-.71l-2.12-2.12a.5.5 0 0 0-.71 0L12 17.17" />
      <path d="M6.59 6.59a.5.5 0 0 1 .71 0l2.12 2.12a.5.5 0 0 1 0 .71L7.3 11.53a.5.5 0 0 1-.71 0L4.46 9.41a.5.5 0 0 1 0-.71L6.59 6.59z" />
      <path d="M12 22v-6" />
      <path d="m15.04 12.46 3.5-3.5" />
    </svg>
  );
}
