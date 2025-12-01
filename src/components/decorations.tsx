import React from 'react';

const GarlandSVG = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
    </defs>
    <path
      d="M 200,0 A 200,200 0 0 0 0,200"
      stroke="#228B22"
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 200,0 A 200,200 0 0 0 0,200"
      stroke="#3CB371"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="140" cy="25" r="6" fill="#FFD700" filter="url(#glow)"/>
    <circle cx="95" cy="80" r="6" fill="#DC143C" filter="url(#glow)"/>
    <circle cx="45" cy="125" r="6" fill="#4169E1" filter="url(#glow)"/>
     <circle cx="15" cy="160" r="6" fill="#FFD700" filter="url(#glow)"/>
  </svg>
);


export const ChristmasDecorations = () => {
  return (
    <>
      <div className="christmas-garland garland-left">
        <GarlandSVG />
      </div>
      <div className="christmas-garland garland-right">
        <GarlandSVG />
      </div>
    </>
  );
};
