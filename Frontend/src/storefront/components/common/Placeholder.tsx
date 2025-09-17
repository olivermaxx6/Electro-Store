import React from 'react';
import { Image } from 'lucide-react';

interface PlaceholderProps {
  ratio?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

const Placeholder: React.FC<PlaceholderProps> = ({
  ratio = '4/3',
  size,
  className = '',
  ariaLabel = 'Placeholder image',
  children,
}) => {
  const aspectRatio = ratio.split('/').map(Number);
  const paddingBottom = `${(aspectRatio[1] / aspectRatio[0]) * 100}%`;
  
  const sizeClass = size ? sizeClasses[size] : '';
  
  return (
    <div
      className={`
        relative bg-gray-100 border border-dashed border-gray-300 
        flex items-center justify-center overflow-hidden
        ${sizeClass}
        ${className}
      `}
      style={!size ? { paddingBottom } : undefined}
      aria-label={ariaLabel}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <Image 
            className="w-8 h-8 text-gray-400" 
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default Placeholder;