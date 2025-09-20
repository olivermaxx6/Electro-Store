import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Product } from '../../lib/types';
import { addToCart } from '../../store/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../../store/wishlistSlice';
import { selectCurrentUser } from '../../store/userSlice';
import { addToast } from '../../store/uiSlice';
import { incrementProductView } from '../../../lib/productsApi';
import Placeholder from '../common/Placeholder';
import Price from './Price';
import Stars from './Stars';
import Badge from '../common/Badge';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const isInWishlist = useSelector(selectIsInWishlist(product.id, userId));
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      dispatch(addToCart({ productId: product.id, qty: 1, userId }));
      
      dispatch(addToast({
        message: 'Added to cart!',
        type: 'success',
      }));
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
    }
  };
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: product.id, userId }));
      dispatch(addToast({
        message: 'Removed from wishlist',
        type: 'info',
      }));
    } else {
      dispatch(addToWishlist({ productId: product.id, userId }));
      dispatch(addToast({
        message: 'Added to wishlist!',
        type: 'success',
      }));
    }
  };
  
  return (
    <div className={`group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-lg transition-all duration-300 ${className}`}>
      <Link 
        to={`/product/${product.id}`} 
        className="block"
        onClick={async () => {
          try {
            await incrementProductView(product.id);
          } catch (error) {
            console.error('Failed to increment product view:', error);
          }
        }}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-700 rounded-t-lg">
          {product.image ? (
            <img 
              src={product.image.startsWith('http') ? product.image : `http://127.0.0.1:8001${product.image}`}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Placeholder ratio="1/1" className={`w-full h-full ${product.image ? 'hidden' : ''}`}>
            <div className="text-muted-light text-sm flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-xs">Product Image</span>
              </div>
            </div>
          </Placeholder>
          
          {/* Badges */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col space-y-1 sm:space-y-2">
            {product.is_top_selling && (
              <span className="bg-orange-500 dark:bg-orange-600 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium shadow-sm">
                TOP
              </span>
            )}
            {product.isNew && !product.is_top_selling && (
              <span className="bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium shadow-sm">
                NEW
              </span>
            )}
            {product.discount_rate && product.discount_rate > 0 && (
              <span className="bg-red-500 dark:bg-red-600 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium shadow-sm">
                -{product.discount_rate}%
              </span>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="flex flex-col space-y-1 sm:space-y-2">
              <button
                onClick={handleWishlistToggle}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isInWishlist 
                    ? 'bg-red-600 dark:bg-blue-600 text-white' 
                    : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-600'
                }`}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center hover:text-red-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-600 transition-all duration-300 shadow-lg"
                title="Quick view"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4 sm:p-6">
          <div className="mb-2 sm:mb-3 flex items-center justify-between">
            <Stars rating={product.rating || 0} count={product.ratingCount} size="sm" />
            {product.viewCount !== undefined && (
              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{product.viewCount}</span>
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 hover:text-red-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base lg:text-lg leading-tight">
            {product.title}
          </h3>
          
          <div className="mb-3 sm:mb-4">
            <Price 
              price={product.price} 
              oldPrice={product.oldPrice} 
              size="sm"
            />
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 dark:bg-blue-600 text-white py-2 sm:py-3 rounded-md font-medium hover:bg-red-700 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;