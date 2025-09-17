import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

interface StarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const Stars: React.FC<StarsProps> = ({
  rating,
  count,
  size = 'md',
  showCount = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  const stars = Array.from({ length: 5 }, (_, index) => {
    const starRating = index + 1;
    const isFilled = starRating <= Math.floor(rating);
    const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;
    
    return (
      <Star
        key={index}
        className={clsx(
          sizeClasses[size],
          isFilled || isHalfFilled ? 'text-star fill-current' : 'text-gray-300',
          className
        )}
        aria-hidden="true"
      />
    );
  });
  
  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center" role="img" aria-label={`${rating} out of 5 stars`}>
        {stars}
      </div>
      
      {showCount && count !== undefined && (
        <span className={`text-gray-500 ${textSizeClasses[size]}`}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default Stars;