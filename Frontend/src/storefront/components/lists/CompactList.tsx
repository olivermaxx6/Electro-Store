import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../lib/types';
import Placeholder from '../common/Placeholder';
import Price from '../products/Price';

interface CompactListProps {
  title: string;
  products: Product[];
  className?: string;
}

const CompactList: React.FC<CompactListProps> = ({
  title,
  products,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors"
          >
            <div className="flex-shrink-0">
              <Placeholder size="sm" className="w-16 h-16">
                <div className="text-gray-400 text-xs">Thumb</div>
              </Placeholder>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {product.title}
              </h4>
              <div className="mt-1">
                <Price price={product.price} oldPrice={product.oldPrice} size="sm" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CompactList;