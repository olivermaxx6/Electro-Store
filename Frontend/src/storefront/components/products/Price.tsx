import React from 'react';
import { formatPrice } from '../../lib/format';
import { Currency } from '../../lib/types';
import { useStoreSettings } from '../../hooks/useStoreSettings';

interface PriceProps {
  price: number;
  oldPrice?: number;
  currency?: Currency;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
  className?: string;
}

const Price: React.FC<PriceProps> = ({
  price,
  oldPrice,
  currency,
  size = 'md',
  showDiscount = true,
  className = '',
}) => {
  const { settings } = useStoreSettings();
  const currentCurrency = currency || (settings?.currency as Currency) || 'USD';
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  const discountPct = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`font-semibold text-primary dark:text-white ${sizeClasses[size]}`}>
        {formatPrice(price, currentCurrency)}
      </span>
      
      {oldPrice && oldPrice > price && (
        <>
          <span className={`text-gray-500 dark:text-gray-400 line-through ${sizeClasses[size]}`}>
            {formatPrice(oldPrice, currentCurrency)}
          </span>
          
          {showDiscount && discountPct > 0 && (
            <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded-full font-medium">
              -{discountPct}%
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default Price;