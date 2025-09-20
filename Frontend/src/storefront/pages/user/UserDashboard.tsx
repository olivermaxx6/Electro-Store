import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Settings, 
  MessageCircle, 
  Package,
  Calendar,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { selectCurrentUser } from '../../store/userSlice';
import { selectCartItemCount } from '../../store/cartSlice';
import { selectWishlistCount } from '../../store/wishlistSlice';
import { signOut } from '../../store/userSlice';
import { useStore } from '../../contexts/StoreContext';
import { formatPrice } from '../../lib/format';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import ThemeToggle from '../../components/common/ThemeToggle';

const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { storeSettings } = useStore();
  const { settings } = useStoreSettings();
  const currentUser = useSelector(selectCurrentUser);
  const cartCount = useSelector(selectCartItemCount(currentUser?.id || 'guest'));
  const wishlistCount = useSelector(selectWishlistCount(currentUser?.id || 'guest'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(signOut());
    navigate('/');
  };

  // Mock data for demonstration
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      total: 299.99,
      status: 'Delivered',
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      total: 149.99,
      status: 'Shipped',
      items: 2
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      total: 89.99,
      status: 'Processing',
      items: 1
    }
  ];

  const mockCartItems = [
    {
      id: '1',
      name: 'Wireless Headphones',
      price: 99.99,
      quantity: 1,
      image: '/placeholder-product.jpg'
    },
    {
      id: '2',
      name: 'Smart Watch',
      price: 199.99,
      quantity: 1,
      image: '/placeholder-product.jpg'
    }
  ];

  const mockWishlistItems = [
    {
      id: '3',
      name: 'Gaming Keyboard',
      price: 79.99,
      image: '/placeholder-product.jpg'
    },
    {
      id: '4',
      name: 'Wireless Mouse',
      price: 49.99,
      image: '/placeholder-product.jpg'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'chat', label: 'Chat with Admin', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{mockOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cart Items</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{cartCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wishlist Items</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{wishlistCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
        <div className="space-y-4">
          {mockOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{order.id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.items} items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">{formatPrice(order.total, (settings?.currency as any) || 'USD')}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Link
            to="/user/orders"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
          >
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      {mockOrders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{order.id}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ordered on {order.date}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatPrice(order.total, (settings?.currency as any) || 'USD')}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {order.status}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">{order.items} items</p>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCart = () => (
    <div className="space-y-4">
      {mockCartItems.map((item) => (
        <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quantity: {item.quantity}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.price, (settings?.currency as any) || 'USD')}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6">
        <Link
          to="/cart"
          className="w-full bg-red-600 dark:bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors text-center block"
        >
          Go to Cart
        </Link>
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-4">
      {mockWishlistItems.map((item) => (
        <div key={item.id} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
              <Heart className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Added to wishlist</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.price, (settings?.currency as any) || 'USD')}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6">
        <Link
          to="/wishlist"
          className="w-full bg-red-600 dark:bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors text-center block"
        >
          Go to Wishlist
        </Link>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="text-center">
        <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Chat with Admin</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Need help? Start a conversation with our admin team.
        </p>
        <button className="bg-red-600 dark:bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors">
          Start Chat
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={currentUser?.name || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={currentUser?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              readOnly
            />
          </div>
        </div>
        <div className="mt-6">
          <Link
            to="/user/settings"
            className="bg-red-600 dark:bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
          >
            Edit Settings
          </Link>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'cart':
        return renderCart();
      case 'wishlist':
        return renderWishlist();
      case 'chat':
        return renderChat();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 dark:bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {storeSettings?.store_name || 'Store'}<span className="text-red-600 dark:text-blue-400">.</span>
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, <span className="font-semibold">{currentUser?.name}</span>
              </span>
              <ThemeToggle size="sm" />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-100 dark:bg-blue-900 text-red-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h1>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
