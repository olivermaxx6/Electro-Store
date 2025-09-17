import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Minus, Plus, ArrowLeft } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal } from '../store/cartSlice';
import { selectProducts } from '../store/productsSlice';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import Price from '../components/products/Price';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const products = useSelector(selectProducts);
  const cartTotal = useSelector(selectCartTotal);
  
  const cartProducts = cartItems.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return product ? { ...product, qty: cartItem.qty } : null;
  }).filter(Boolean);
  
  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };
  
  const handleUpdateQuantity = (productId: string, qty: number) => {
    dispatch(updateQuantity({ productId, qty }));
  };
  
  const shippingCost = cartTotal > 50 ? 0 : 9.99;
  const finalTotal = cartTotal + shippingCost;
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          
          <div className="text-center py-16">
            <Placeholder size="lg" className="mx-auto mb-6">
              <div className="text-gray-400">Empty Cart</div>
            </Placeholder>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cartProducts.map((product) => (
                  <div key={product!.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Placeholder size="md" className="w-20 h-20">
                          <div className="text-gray-400 text-xs">Product</div>
                        </Placeholder>
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${product!.id}`}
                          className="text-lg font-medium text-gray-900 hover:text-primary transition-colors"
                        >
                          {product!.title}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Brand: {product!.brand || 'N/A'}
                        </p>
                        <div className="mt-2">
                          <Price price={product!.price} oldPrice={product!.oldPrice} size="sm" />
                        </div>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(product!.id, product!.qty - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{product!.qty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(product!.id, product!.qty + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Subtotal */}
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          <Price price={product!.price * product!.qty} size="sm" />
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(product!.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-primary hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium"><Price price={cartTotal} size="sm" /></span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? 'Free' : <Price price={shippingCost} size="sm" />}
                  </span>
                </div>
                
                {cartTotal < 50 && (
                  <div className="text-sm text-gray-500">
                    Add <Price price={50 - cartTotal} size="sm" /> more for free shipping
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-primary">
                      <Price price={finalTotal} size="sm" />
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-600 transition-colors text-center font-medium block"
              >
                Proceed to Checkout
              </Link>
              
              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
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