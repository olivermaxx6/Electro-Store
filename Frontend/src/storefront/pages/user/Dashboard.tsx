import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  Settings, 
  MessageCircle, 
  LogOut,
  Package,
  Clock,
  CheckCircle,
  User,
  Bell,
  Copy,
  ExternalLink
} from 'lucide-react';
import { selectCurrentUser, selectUserOrders } from '../../store/userSlice';
import { selectCartItemCount } from '../../store/cartSlice';
import { selectWishlistCount } from '../../store/wishlistSlice';
import { signOut } from '../../store/userSlice';
import { formatPrice } from '../../lib/format';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { useStore } from '../../contexts/StoreContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import ChatModal from '../../components/chat/ChatModal';
import ChatConnectionStatus from '../../components/chat/ChatConnectionStatus';
import useChatConnection from '../../hooks/useChatConnection';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { storeSettings } = useStore();
  const { settings } = useStoreSettings();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const orders = useSelector(selectUserOrders);
  const cartCount = useSelector(selectCartItemCount(currentUser?.id || 'guest'));
  const wishlistCount = useSelector(selectWishlistCount(currentUser?.id || 'guest'));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Chat connection hook
  const {
    activeConnection,
    isConnecting,
    isConnected,
    hasError,
    createConnection,
    closeConnection,
    connectionUrl,
    chatLink
  } = useChatConnection();

  const handleLogout = () => {
    dispatch(signOut());
    navigate('/');
  };

  // Chat connection handlers
  const handleStartChat = async () => {
    try {
      if (!isConnected) {
        await createConnection();
      }
      setIsChatOpen(true);
    } catch (error) {
      console.error('Failed to create chat connection:', error);
    }
  };

  const handleCopyChatLink = async () => {
    if (chatLink) {
      try {
        await navigator.clipboard.writeText(chatLink);
        // You could add a toast notification here
        console.log('Chat link copied to clipboard');
      } catch (error) {
        console.error('Failed to copy chat link:', error);
      }
    }
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'chat', label: 'Chat with Admin', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'Processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Shipped':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-blue-600 dark:to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome back, {currentUser?.name}!
            </h2>
            <p className="text-red-100 dark:text-blue-100">
              Here's what's happening with your account
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Cart Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cartCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wishlist Items</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{wishlistCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getOrderStatusIcon(order.status)}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.total, (settings?.currency as any) || 'USD')}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
            <Link
              to="/shop"
              className="text-red-600 dark:text-blue-400 hover:text-red-700 dark:hover:text-blue-500 font-medium"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order History</h3>
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getOrderStatusIcon(order.status)}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.total, (settings?.currency as any) || 'USD')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.status}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {order.items.length} item(s)
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No orders yet</p>
            <Link
              to="/shop"
              className="text-red-600 dark:text-blue-400 hover:text-red-700 dark:hover:text-blue-500 font-medium"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderCart = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shopping Cart</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">{cartCount} items</span>
        </div>
        {cartCount > 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">You have {cartCount} items in your cart</p>
            <Link
              to="/cart"
              className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              View Cart
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Wishlist</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">{wishlistCount} items</span>
        </div>
        {wishlistCount > 0 ? (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">You have {wishlistCount} items in your wishlist</p>
            <Link
              to="/wishlist"
              className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              View Wishlist
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <Heart className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your wishlist is empty</p>
            <Link
              to="/shop"
              className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="space-y-6">
      {/* Chat Connection Status */}
      {activeConnection && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chat Connection</h3>
          <ChatConnectionStatus
            connection={activeConnection}
            isConnecting={isConnecting}
            hasError={hasError}
            onCopyLink={handleCopyChatLink}
            onOpenChat={handleOpenChat}
          />
        </div>
      )}

      {/* Main Chat Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chat with Admin</h3>
        
        {isConnected ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Virtual Connection Established
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You're now connected to our admin team. Click below to start chatting!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleOpenChat}
                  className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Open Chat
                </button>
                <button 
                  onClick={handleCopyChatLink}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Chat Link
                </button>
              </div>
            </div>
            
            {/* Connection Details */}
            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Connection Details</h5>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Room ID:</span>
                  <span className="font-mono">{activeConnection?.roomId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connected:</span>
                  <span>{activeConnection?.createdAt.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Need help? Create a virtual connection with our admin team
            </p>
            <button 
              onClick={handleStartChat}
              disabled={isConnecting}
              className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Connection...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Chat
                </>
              )}
            </button>
            
            {hasError && (
              <div className="mt-4 text-sm text-red-600 dark:text-red-400">
                Failed to create connection. Please try again.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
        <div className="space-y-4">
          <Link
            to="/user/settings"
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">Profile Settings</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">→</span>
          </Link>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">Notifications</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500">→</span>
          </div>
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
        <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 dark:bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {storeSettings?.store_name || 'Store'}<span className="text-red-600 dark:text-blue-400">.</span>
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {currentUser?.name}
              </span>
              <ThemeToggle size="sm" />
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-100 dark:bg-blue-900 text-red-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Dashboard;
