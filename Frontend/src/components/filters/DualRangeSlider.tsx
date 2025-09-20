import React, { useState, useRef, useEffect } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
}

const DualRangeSlider: React.FC<DualRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 50,
  formatValue = (val) => `$${val}`,
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPercentage = (percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step);
      onChange([Math.max(min, newMin), value[1]]);
    } else {
      const newMax = Math.max(newValue, value[0] + step);
      onChange([value[0], Math.min(max, newMax)]);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, value]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className="w-full py-4">
      <div className="relative h-10 flex items-center">
        <div
          ref={sliderRef}
          className="relative w-full h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full cursor-pointer"
        >
          {/* Range track */}
          <div 
            className="absolute h-full bg-gradient-to-r from-red-600 to-red-400 dark:from-blue-500 dark:to-blue-400 rounded-full transition-all duration-150"
            style={{ 
              left: `${minPercentage}%`, 
              width: `${maxPercentage - minPercentage}%` 
            }}
          />
          
          {/* Min thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-slate-800 border-[3px] border-red-600 dark:border-blue-500 rounded-full cursor-grab shadow-md transition-all duration-150 hover:scale-110 hover:shadow-lg active:scale-125 active:cursor-grabbing active:shadow-xl active:shadow-red-100 dark:active:shadow-blue-100 z-10"
            style={{ left: `calc(${minPercentage}% - 10px)` }}
            onMouseDown={handleMouseDown('min')}
          />
          
          {/* Max thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-slate-800 border-[3px] border-red-600 dark:border-blue-500 rounded-full cursor-grab shadow-md transition-all duration-150 hover:scale-110 hover:shadow-lg active:scale-125 active:cursor-grabbing active:shadow-xl active:shadow-red-100 dark:active:shadow-blue-100 z-10"
            style={{ left: `calc(${maxPercentage}% - 10px)` }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
      </div>
      
      <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>
    </div>
  );
};

export default DualRangeSlider;
