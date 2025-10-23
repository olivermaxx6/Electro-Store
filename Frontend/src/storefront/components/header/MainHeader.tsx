import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCartItemCount } from '../../store/cartSlice';
import { selectWishlistCount } from '../../store/wishlistSlice';
import { selectCurrentUser } from '../../store/userSlice';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { LogoImage } from '../../lib/logoUtils';

const MainHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const cartCount = useSelector(selectCartItemCount(userId));
  const wishlistCount = useSelector(selectWishlistCount(userId));
  const { settings: storeSettings } = useStoreSettings();
  
  // Note: Cart loading is handled by Redux persist automatically
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
      <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <LogoImage 
              src={storeSettings?.store_logo}
              alt={storeSettings?.store_name || 'Store'}
              className="w-8 h-8 rounded-full object-cover"
              fallbackText={storeSettings?.store_name ? storeSettings.store_name.charAt(0).toUpperCase() : 'S'}
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {storeSettings?.store_name || 'Store'}<span className="text-red-600 dark:text-blue-400">.</span>
            </span>
          </Link>
          

          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full lg:flex-1 lg:max-w-lg lg:mx-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </form>
          

          
          {/* Mini Cart, Wishlist, and User */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 dark:bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 dark:bg-blue-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Icon */}
            <Link
              to={currentUser ? "/user/dashboard" : "/user/sign-in"}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
            >
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainHeader;