import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { selectWishlistItems } from '../store/wishlistSlice';
import { selectProducts } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { removeFromWishlist } from '../store/wishlistSlice';
import { addToast } from '../store/uiSlice';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import Price from '../components/products/Price';

const Wishlist: React.FC = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector(selectWishlistItems);
  const products = useSelector(selectProducts);
  
  const wishlistProducts = wishlistItems.map(wishlistItem => {
    const product = products.find(p => p.id === wishlistItem.productId);
    return product ? { ...product, addedAt: wishlistItem.addedAt } : null;
  }).filter(Boolean);
  
  const handleMoveToCart = (productId: string) => {
    dispatch(addToCart({ productId, qty: 1 }));
    dispatch(removeFromWishlist(productId));
    dispatch(addToast({
      message: 'Moved to cart!',
      type: 'success',
    }));
  };
  
  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    dispatch(addToast({
      message: 'Removed from wishlist',
      type: 'info',
    }));
  };
  
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Save items you love for later by adding them to your wishlist.</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Start Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Wishlist ({wishlistItems.length})</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistProducts.map((product) => (
            <div key={product!.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product!.id}`} className="block">
                <Placeholder ratio="4/3" className="w-full h-48">
                  <div className="text-gray-400 dark:text-gray-500">Product Image</div>
                </Placeholder>
              </Link>
              
              <div className="p-4">
                <Link
                  to={`/product/${product!.id}`}
                  className="block font-medium text-gray-900 dark:text-white hover:text-primary transition-colors mb-2"
                >
                  {product!.title}
                </Link>
                
                <div className="mb-3">
                  <Price price={product!.price} oldPrice={product!.oldPrice} size="sm" />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleMoveToCart(product!.id)}
                    className="flex-1 bg-primary dark:bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-primary-600 dark:hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(product!.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;