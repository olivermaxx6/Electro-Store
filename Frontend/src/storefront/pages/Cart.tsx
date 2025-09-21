import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal, setShippingCost, clearCart } from '../store/cartSlice';
import { selectProducts, setProducts } from '../store/productsSlice';
import { selectCurrentUser } from '../store/userSlice';
import { productRepo } from '../lib/repo';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import Price from '../components/products/Price';
import Placeholder from '../components/common/Placeholder';
import TitleUpdater from '../components/common/TitleUpdater';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const cartItems = useSelector(selectCartItems(userId));
  const products = useSelector(selectProducts);
  const cartTotal = useSelector(selectCartTotal(userId));
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const { settings, loading: settingsLoading } = useStoreSettings();

  // Load products if they're not already loaded
  useEffect(() => {
    const loadProductsIfNeeded = async () => {
      if (products.length === 0) {
        try {
          setIsLoadingProducts(true);
          const productsData = await productRepo.getAll();
          dispatch(setProducts(productsData));
        } catch (error) {
          console.error('Failed to load products for cart:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }
    };

    loadProductsIfNeeded();
  }, [dispatch, products.length]);
  
  // Simple product matching like wishlist
  const cartProducts = cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return product ? { ...product, qty: cartItem.qty } : null;
  }).filter(Boolean);
  
  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart({ productId, userId }));
  };

  
  const handleUpdateQuantity = (productId: string, qty: number) => {
    dispatch(updateQuantity({ productId, qty, userId }));
  };
  
  // Dynamic shipping cost based on admin settings
  const standardShippingRate = settings && !settingsLoading ? parseFloat(settings?.standard_shipping_rate?.toString() || '0') || 0 : 0;
  const expressShippingRate = settings && !settingsLoading ? parseFloat(settings?.express_shipping_rate?.toString() || '0') || 0 : 0;
  
  
  
  // Shipping selection state
  const [selectedShipping, setSelectedShipping] = useState<string>('standard');
  
  // Calculate shipping cost based on selection
  const getShippingCost = () => {
    if (cartTotal > 50) return 0; // Free shipping over $50
    return selectedShipping === 'express' ? expressShippingRate : standardShippingRate;
  };
  
  const shippingCost = getShippingCost();
  const finalTotal = cartTotal + shippingCost;

  // Update shipping cost in store when settings or selection change
  useEffect(() => {
    if (settings) {
      dispatch(setShippingCost({ shippingCost, userId }));
    }
  }, [settings, shippingCost, dispatch, userId]);
  
  // Show loading state if we have cart items but products are still loading
  if (cartProducts.length === 0 && isLoadingProducts && cartItems.length > 0) {
    return <LoadingScreen message="Loading your cart..." />;
  }

  // Show empty cart message
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <TitleUpdater pageTitle="Cart" />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <div className="text-gray-400 dark:text-slate-500 text-4xl">🛒</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start shopping to fill it up!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 bg-blue-600 dark:bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center space-x-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="Cart" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Cart Items ({cartItems.length})</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => dispatch(clearCart({ userId }))}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Cart</span>
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {cartProducts.map((product) => (
                  <div key={product!.id} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {product!.image ? (
                          <img 
                            src={product!.image} 
                            alt={product!.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Placeholder size="md" className={`w-16 h-16 sm:w-20 sm:h-20 ${product!.image ? 'hidden' : ''}`}>
                          <div className="text-gray-400 dark:text-gray-500 text-xs">Product</div>
                        </Placeholder>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${product!.id}`}
                          className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                        >
                          {product!.title}
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                          Brand: {product!.brand || 'N/A'}
                        </p>
                        <div className="mt-2">
                          <Price price={product!.price} oldPrice={product!.oldPrice} size="sm" />
                        </div>
                      </div>
                      
                      {/* Mobile Layout - Bottom Section */}
                      <div className="w-full sm:w-auto flex justify-between items-center">
                        {/* Quantity Controls */}
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                              onClick={() => handleUpdateQuantity(product!.id, product!.qty - 1)}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600"
                              disabled={product!.qty <= 1}
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="w-10 sm:w-12 text-center font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-800 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-gray-200 dark:border-slate-600 text-sm sm:text-base">
                              {product!.qty}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(product!.id, product!.qty + 1)}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600"
                              disabled={product!.qty >= (product!.stock || 1)}
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                          {product!.stock && (
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              product!.qty >= product!.stock 
                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' 
                                : product!.qty >= product!.stock * 0.8 
                                  ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            }`}>
                              {product!.qty >= product!.stock ? 'Max Stock' : `${product!.stock - product!.qty} left`}
                            </div>
                          )}
                        </div>
                        
                        {/* Subtotal and Remove Button */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">
                            <Price price={product!.price * product!.qty} size="sm" />
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(product!.id)}
                            className="p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6 sticky top-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              
              {/* Shipping Options */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Shipping Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={selectedShipping === 'standard'}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                      className="text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Standard Shipping
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        5-7 business days
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {standardShippingRate === 0 ? 'Free' : <Price price={standardShippingRate} size="sm" />}
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={selectedShipping === 'express'}
                      onChange={(e) => setSelectedShipping(e.target.value)}
                      className="text-blue-600 dark:text-blue-400 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Express Shipping
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        2-3 business days
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {expressShippingRate === 0 ? 'Free' : <Price price={expressShippingRate} size="sm" />}
                    </div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="font-medium text-sm sm:text-base"><Price price={cartTotal} size="sm" /></span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-medium text-sm sm:text-base">
                    {shippingCost === 0 ? 'Free' : <Price price={shippingCost} size="sm" />}
                  </span>
                </div>
                
                
                <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-semibold text-primary">
                      <Price price={finalTotal} size="sm" />
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Coupon Code */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Coupon Code
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-red-600 dark:bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors text-center font-medium block text-sm sm:text-base"
              >
                Proceed to Checkout
              </Link>
              
              {/* Security Badge */}
              <div className="mt-3 sm:mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>🔒</span>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;