'use client';

import { useState, useEffect } from 'react';

export default function HeroHeading({ 
  headingLine1, 
  animatedLines = []
}: { 
  headingLine1?: string, 
  animatedLines?: { gradientText: string, trailingText: string }[]
}) {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Fallback if CMS array is empty or undefined
  const lines = animatedLines && animatedLines.length > 0 ? animatedLines : [
    { gradientText: "Exciting Solutions", trailingText: "for Campaigns." }
  ];

  useEffect(() => {
    if (lines.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % lines.length);
        setIsFading(false);
      }, 500); // fade duration
    }, 3500); // change every 3.5 seconds

    return () => clearInterval(interval);
  }, [lines.length]);

  return (
    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.1] tracking-tight mb-6 text-[#242038]">
      {headingLine1 || "Creating"}<br />
      <span className={`inline-block transition-opacity duration-500 text-[#B270FF] ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        {lines[index].gradientText}
      </span><br />
      <span className={`inline-block transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        {lines[index].trailingText}
      </span>
    </h1>
  );
}
