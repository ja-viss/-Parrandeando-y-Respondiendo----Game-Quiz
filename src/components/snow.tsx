'use client';

import React, { useState, useEffect } from 'react';

const Snowflake = ({ style }: { style: React.CSSProperties }) => {
  return <div className="snowflake" style={style}></div>;
};

export const Snow = ({ count = 20 }: { count?: number }) => {
  const [snowflakes, setSnowflakes] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const createSnowflakes = () => {
      const newSnowflakes = Array.from({ length: count }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          top: `${-10 + Math.random() * 10}%`,
          animationDuration: `${Math.random() * 5 + 8}s`, // Slower duration
          animationDelay: `${Math.random() * 5}s`,
          width: `${Math.random() * 3 + 2}px`,
          height: `${Math.random() * 3 + 2}px`,
        };
        return <Snowflake key={i} style={style} />;
      });
      setSnowflakes(newSnowflakes);
    };

    createSnowflakes();
  }, [count]);

  return <div className="fixed top-0 left-0 w-full h-full pointer-events-none">{snowflakes}</div>;
};
