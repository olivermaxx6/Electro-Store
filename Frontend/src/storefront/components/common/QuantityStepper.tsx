import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };
  
  const inputSizeClasses = {
    sm: 'w-12 text-sm',
    md: 'w-16 text-base',
    lg: 'w-20 text-lg',
  };
  
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };
  
  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };
  
  return (
    <div className={clsx('flex items-center border border-gray-300 rounded-md overflow-hidden', className)}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className={clsx(
          'flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size]
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className={clsx(
          'border-0 text-center focus:ring-0 focus:outline-none bg-white',
          inputSizeClasses[size]
        )}
        aria-label="Quantity"
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className={clsx(
          'flex items-center justify-center bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size]
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantityStepper;
