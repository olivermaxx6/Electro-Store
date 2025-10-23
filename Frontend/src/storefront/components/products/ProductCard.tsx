import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Product } from '../../lib/types';
import { addToCart } from '../../store/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../../store/wishlistSlice';
import { selectCurrentUser } from '../../store/userSlice';
import { addToast } from '../../store/uiSlice';
import { incrementProductView } from '../../../lib/productsApi';
import { formatPrice } from '../../lib/format';
import { useStoreSettings } from '../../hooks/useStoreSettings';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const isInWishlist = useSelector(selectIsInWishlist(product.id, userId));
  const { settings } = useStoreSettings();
  
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

  // Calculate discounted price
  const discountedPrice = product.discount_rate && product.discount_rate > 0 
    ? product.price * (1 - product.discount_rate / 100)
    : product.price;

  // Amazon-style product card with definite dimensions
  return (
    <div className={`group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-lg transition-all duration-300 h-full flex flex-col product-card ${className}`}>
      <Link 
        to={`/product/${product.id}`} 
        className="block h-full flex flex-col"
        onClick={async () => {
          try {
            await incrementProductView(product.id);
          } catch (error) {
            console.error('Failed to increment product view:', error);
          }
        }}
      >
        {/* Product Image - Fixed Square Dimensions */}
        <div className="relative w-full h-64 bg-gray-100 dark:bg-slate-700 rounded-t-lg overflow-hidden flex-shrink-0">
          {(() => {
            // Use main_image field from backend, fallback to first image
            const mainImage = product.main_image || product.images?.[0]?.image || product.images?.[0];
            return mainImage ? (
              <img 
                src={mainImage.startsWith('http') ? mainImage : `http://127.0.0.1:8001${mainImage}`}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // If image fails to load, show Amazon-style fallback
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                        <div class="text-center p-4">
                          <div class="w-20 h-20 mx-auto mb-3 bg-gray-300 dark:bg-slate-500 rounded-lg flex items-center justify-center">
                            <svg class="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <span class="text-sm text-gray-600 dark:text-gray-400 font-medium leading-tight">${product.title}</span>
                        </div>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-300 dark:bg-slate-500 rounded-lg flex items-center justify-center">
                    <svg className="w-10 h-10 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-tight">{product.title}</span>
                </div>
              </div>
            );
          })()}
          
          {/* Amazon-Style Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.is_top_selling && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium shadow-sm">
                #1 Best Seller
              </span>
            )}
            {product.isNew && !product.is_top_selling && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium shadow-sm">
                New
              </span>
            )}
            {product.discount_rate && product.discount_rate > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium shadow-sm">
                Save {product.discount_rate}%
              </span>
            )}
          </div>
          
          {/* Amazon-Style Action Buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleWishlistToggle}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                  isInWishlist 
                    ? 'bg-red-600 text-white' 
                    : 'bg-white text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>
              
              <button
                className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 shadow-lg"
                title="Quick view"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Amazon-Style Product Info - Flexible Height */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Rating */}
          <div className="mb-2 flex items-center gap-2">
            {product.average_rating && product.average_rating > 0 ? (
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${
                        i < Math.floor(product.average_rating) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                  {product.average_rating.toFixed(1)}
                </span>
                {product.review_count > 0 && (
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    ({product.review_count})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-gray-300" />
                  ))}
                </div>
                <span className="ml-1 text-xs text-gray-500">No rating</span>
              </div>
            )}
            {product.view_count !== undefined && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({product.view_count} views)
              </span>
            )}
          </div>
          
          {/* Product Title */}
          <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm leading-tight flex-1">
            {product.title}
          </h3>
          
          {/* Brand */}
          {product.brand_data && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              by {product.brand_data.name}
            </p>
          )}
          
          {/* Price */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {product.discount_rate && product.discount_rate > 0 && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price, settings?.currency || 'GBP')}
                </span>
              )}
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(discountedPrice, settings?.currency || 'GBP')}
              </span>
              {product.discount_rate && product.discount_rate > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  You save {formatPrice(product.price - discountedPrice, settings?.currency || 'GBP')}
                </span>
              )}
            </div>
          </div>
          
          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="mb-3">
              {product.stock > 0 ? (
                <span className="text-xs text-green-600 font-medium">
                  ✓ In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-xs text-red-600 font-medium">
                  ✗ Out of Stock
                </span>
              )}
            </div>
          )}
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-600 dark:bg-blue-600 hover:bg-red-700 dark:hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm mt-auto"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;