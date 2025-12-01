'use client';

import React, { useState, useEffect } from 'react';

const Star = ({ style }: { style: React.CSSProperties }) => {
  return <div className="star" style={style}></div>;
};

export const Stars = ({ count = 50 }: { count?: number }) => {
  const [stars, setStars] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const createStars = () => {
      const newStars = Array.from({ length: count }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 5 + 5}s`,
          animationDelay: `${Math.random() * 5}s`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
        };
        return <Star key={i} style={style} />;
      });
      setStars(newStars);
    };

    createStars();
  }, [count]);

  return <>{stars}</>;
};
