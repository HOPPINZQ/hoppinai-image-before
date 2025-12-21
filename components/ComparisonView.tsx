
import React, { useState, useRef, useEffect } from 'react';

interface ComparisonViewProps {
  original: string;
  processed: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ original, processed }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = Math.max(0, Math.min(x - rect.left, rect.width));
    setSliderPos((relativeX / rect.width) * 100);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl cursor-col-resize group"
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* Original (Under) */}
      <img src={original} className="absolute inset-0 w-full h-full object-cover" alt="Original" />
      
      {/* Processed (Over) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img 
          src={processed} 
          className="absolute inset-0 w-full h-full object-cover" 
          style={{ width: `${10000 / sliderPos}%` }} // Simplified compensation
          alt="Processed" 
        />
        {/* We need a fixed width for the image to not stretch, but match original. 
            Better way: image stays 100% of container width, container is clipped. */}
      </div>
      
      {/* Correct overlay technique */}
      <div 
        className="absolute inset-0" 
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
         <img src={processed} className="w-full h-full object-cover" alt="Processed" />
      </div>

      {/* Slider handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-slate-200">
          <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7l-4 4m0 0l4 4m-4-4h18" />
          </svg>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-black/40 px-2 py-1 rounded text-xs backdrop-blur-sm">Predicted</div>
      <div className="absolute top-4 right-4 bg-black/40 px-2 py-1 rounded text-xs backdrop-blur-sm">Original</div>
    </div>
  );
};
