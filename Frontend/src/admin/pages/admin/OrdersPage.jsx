import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Pager from '../../components/ui/Pager';
import { ThemeLayout, ThemeCard, ThemeSelect, ThemeButton } from '@shared/theme';
import { useCurrency } from '../../store/currencyStore';
import { listOrders, updateOrder, deleteOrder } from '../../lib/api';
import { useAuth } from '../../store/authStore';
import { Copy, Check, Trash2, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';

export default function OrdersPage() {
  const { isAuthed, init, logout } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { formatAmount } = useCurrency();

  // Authentication state management
  const [authState, setAuthState] = useState('checking'); // 'checking', 'authenticated', 'unauthenticated'
  const [fetchStatus, setFetchStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Comprehensive error diagnostic function
  const diagnose500Error = async (response, url) => {
    console.error('🚨 500 Internal Server Error Details:');
    console.error('URL:', url);
    console.error('Status:', response.status);
    console.error('Status Text:', response.statusText);
    
    try {
      // Try to get more details from the response
      const errorText = await response.text();
      console.error('Response Body:', errorText);
      
      // Try to parse as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed Error JSON:', errorJson);
        
        if (errorJson.detail) {
          console.error('Error Detail:', errorJson.detail);
        }
        if (errorJson.error) {
          console.error('Error Message:', errorJson.error);
        }
      } catch (e) {
        console.error('Raw Error Response:', errorText);
      }
    } catch (textError) {
      console.error('Could not read response body:', textError);
    }
    
    // Check common 500 error patterns
    const commonIssues = [
      'Database connection issues',
      'Missing database tables',
      'Serializer validation errors',
      'Permission class failures',
      'Middleware exceptions',
      'View function errors'
    ];
    
    console.error('🔍 Common causes of 500 errors:');
    commonIssues.forEach(issue => console.error('•', issue));
  };

  // Backend health checker
  const checkBackendHealth = async () => {
    try {
      console.log('🔍 Checking backend health...');
      
      // Test basic API connectivity
      const healthResponse = await fetch('http://127.0.0.1:8001/api/admin/health/ping/', {
        method: 'GET',
      });
      
      if (healthResponse.ok) {
        console.log('✅ Backend is reachable');
        return true;
      }
      
      // Test if Django admin is accessible
      const adminResponse = await fetch('http://127.0.0.1:8001/admin/', {
        method: 'GET',
      });
      
      console.log('Django admin status:', adminResponse.status);
      return adminResponse.status < 500;
      
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  };

  // Enhanced authentication check with backend health
  const checkAuth = async () => {
    try {
      console.log('[AUTH] Checking authentication state...');
      setAuthState('checking');
      
      // First check if backend is reachable
      const backendHealthy = await checkBackendHealth();
      if (!backendHealthy) {
        setError(`
          🚨 Cannot connect to the backend server.
          
          Please ensure:
          1. The Django server is running: python manage.py runserver 127.0.0.1:8001
          2. The server is accessible at http://127.0.0.1:8001
          3. There are no firewall or CORS issues
        `);
        setAuthState('unauthenticated');
        return;
      }
      
      // Initialize auth store first
      await init();
      
      // Check if we have a valid token
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = authData.access || localStorage.getItem('access_token');
      
      if (!token) {
        console.log('[AUTH] No token found');
        setAuthState('unauthenticated');
        return;
      }
      
      // Verify token is still valid by calling /api/auth/me/
      const response = await fetch('http://127.0.0.1:8001/api/auth/me/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('[AUTH] Token is valid');
        setAuthState('authenticated');
      } else if (response.status === 401) {
        console.log('[AUTH] Token expired, attempting refresh...');
        
        // Try to refresh the token
        const refreshSuccess = await attemptTokenRefresh();
        if (refreshSuccess) {
          setAuthState('authenticated');
        } else {
          console.log('[AUTH] Token refresh failed');
          localStorage.removeItem('auth');
          localStorage.removeItem('access_token');
          setAuthState('unauthenticated');
        }
      } else {
        console.log('[AUTH] Token verification failed:', response.status);
        setAuthState('unauthenticated');
      }
    } catch (error) {
      console.error('[AUTH] Auth check failed:', error);
      setAuthState('unauthenticated');
    }
  };

  // Attempt token refresh
  const attemptTokenRefresh = async () => {
    try {
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const refreshToken = authData.refresh;
      
      if (!refreshToken) {
        return false;
      }
      
      const response = await fetch('http://127.0.0.1:8001/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (response.ok) {
        const refreshData = await response.json();
        const newAuthData = { ...authData, access: refreshData.access };
        localStorage.setItem('auth', JSON.stringify(newAuthData));
        localStorage.setItem('access_token', refreshData.access);
        console.log('[AUTH] Token refreshed successfully');
        return true;
      }
    } catch (error) {
      console.error('[AUTH] Token refresh failed:', error);
    }
    return false;
  };

  const load = async () => {
    // Only proceed if authenticated
    if (authState !== 'authenticated') {
      console.log('[LOAD] Skipping load - not authenticated');
      return;
    }

    // Check network connectivity
    const isOnline = navigator.onLine;
    if (!isOnline) {
      setError('No internet connection. Please check your network.');
      setFetchStatus('error');
      return;
    }

    try {
      setFetchStatus('loading');
      setError(null);
      console.log('[LOAD] Loading orders with filters:', { page, status: status || 'all' });
      
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const token = authData.access || localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const apiUrl = `http://127.0.0.1:8001/api/admin/orders/?page=${page}${status ? `&status=${status}` : ''}`;
      console.log('📡 Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      });
      
      console.log('📥 Response received:', response.status, response.statusText);
      
      // Handle 500 Internal Server Error specifically
      if (response.status === 500) {
        await diagnose500Error(response, apiUrl);
        
        // Provide specific guidance based on common issues
        setError(`
          🚨 Server Error (500): The backend encountered an internal error.
          
          Common fixes:
          1. Check if the Django server is running on port 8001
          2. Verify the database migrations are applied: python manage.py migrate
          3. Check if the Order model and serializer are properly configured
          4. Look at the Django server logs for detailed error information
          
          Technical details have been logged to the console.
        `);
        setFetchStatus('error');
        return;
      }
      
      // Handle other error status codes
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to view orders.');
      }
      
      if (response.status === 404) {
        throw new Error('Orders endpoint not found. Check backend URL configuration.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Orders data received:', data);
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      // Handle different response structures
      const ordersData = data.results || data.orders || data.items || (Array.isArray(data) ? data : []);
      
      // Ensure we have valid data before setting
      if (Array.isArray(ordersData)) {
        setRows(ordersData);
        setHasNext(!!data.next); 
        setHasPrev(!!data.previous);
        setFetchStatus('success');
        console.log('[LOAD] Orders loaded successfully:', ordersData.length, 'orders');
      } else {
        console.warn('[LOAD] Invalid orders data format:', ordersData);
        setRows([]);
        setHasNext(false); 
        setHasPrev(false);
        setFetchStatus('success'); // Still success, just no data
      }
    } catch (error) {
      console.error('[LOAD] Failed to load orders:', error);
      
      let errorMessage = 'Unknown error';
      if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication failed. Please log in again.';
        // Redirect to login after short delay
        setTimeout(() => {
          window.location.href = '/admin/sign-in';
        }, 2000);
      } else if (error.message.includes('Access denied')) {
        errorMessage = 'Access denied. You may not have admin permissions.';
      } else if (error.message.includes('Server Error')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setFetchStatus('error');
      setRows([]);
      setHasNext(false); 
      setHasPrev(false);
    }
  };

  // Enhanced load function with retry mechanism
  const loadWithRetry = async () => {
    if (retryCount >= MAX_RETRIES) {
      setError('Maximum retry attempts reached. Please check the backend server.');
      setFetchStatus('error');
      return;
    }
    
    await load();
    
    // If we're still in error state after a brief delay, increment retry count
    setTimeout(() => {
      if (fetchStatus === 'error') {
        setRetryCount(prev => prev + 1);
      }
    }, 2000);
  };

  // Backend diagnostics component
  const BackendDiagnostics = () => {
    const [diagnostics, setDiagnostics] = useState({});
    
    const runDiagnostics = async () => {
      const diag = {
        backendReachable: await checkBackendHealth(),
        currentTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        authState: authState,
        fetchStatus: fetchStatus,
        retryCount: retryCount,
        apiEndpoint: 'http://127.0.0.1:8001/api/admin/orders/'
      };
      setDiagnostics(diag);
    };
    
    return (
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
        <button 
          onClick={runDiagnostics}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Run Backend Diagnostics
        </button>
        {diagnostics.backendReachable !== undefined && (
          <pre className="mt-2 text-xs bg-white dark:bg-slate-800 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  // Check authentication on component mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load orders when authentication state changes or filters change
  useEffect(() => {
    if (authState === 'authenticated') {
      loadWithRetry();
    }
  }, [authState, page, status, retryCount]);

  const update = async (id, s) => { 
    try {
      console.log('Updating order:', id, 'to status:', s);
      await updateOrder(id, { status: s }); 
      console.log('✅ Order updated successfully:', id, s); 
      await load(); 
      
      // Trigger dashboard refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('ordersUpdated', { 
        detail: { orderId: id, newStatus: s } 
      }));
      console.log('📊 Dashboard refresh triggered');
    } catch (error) {
      console.error('❌ Failed to update order:', error);
      // You could add a toast notification here for user feedback
      alert(`Failed to update order status: ${error.message || 'Unknown error'}`);
    }
  };

  const copyTrackingId = async (trackingId) => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopiedId(trackingId);
      setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy tracking ID:', error);
    }
  };

  const copyPaymentId = async (paymentId) => {
    try {
      await navigator.clipboard.writeText(paymentId);
      setCopiedPaymentId(paymentId);
      setTimeout(() => setCopiedPaymentId(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy payment ID:', error);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    
    try {
      console.log('🗑️ Deleting order:', orderToDelete.id);
      setIsLoading(true); // Show loading state
      
      await deleteOrder(orderToDelete.id);
      console.log('✅ Order deleted successfully from database:', orderToDelete.id);
      
      // Reload the orders list to remove from UI
      await load();
      console.log('✅ Orders list refreshed, order removed from UI');
      
      // Trigger dashboard refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('ordersUpdated', { 
        detail: { orderId: orderToDelete.id, action: 'deleted' } 
      }));
      console.log('📊 Dashboard refresh triggered after order deletion');
      
      // Show success message briefly
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteSuccess(false);
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Failed to delete order:', error);
      alert(`Failed to delete order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
  };

  return (
    <ThemeLayout>
        <ThemeCard>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Orders Management</h2>
          </div>
          
          {/* Status Filter - only show when authenticated */}
          {authState === 'authenticated' && (
            <div className="mb-6">
              <ThemeSelect
                label="Filter by Status"
                value={status} 
                onChange={e=>setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All order statuses' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'processing', label: 'Processing' },
                  { value: 'shipped', label: 'Shipped' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
          )}
          <div className="overflow-auto">
            {/* Authentication State Debug */}
            <div className="mb-4 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-xs">
              <strong>Auth State:</strong> {authState} | <strong>Fetch Status:</strong> {fetchStatus} | <strong>Orders:</strong> {rows.length}
            </div>
            
            {/* Authentication Checking */}
            {authState === 'checking' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-600 dark:to-blue-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Checking authentication...</div>
              </div>
            )}

            {/* Unauthenticated State */}
            {authState === 'unauthenticated' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200 font-medium">Authentication Required</p>
                </div>
                <p className="text-red-700 dark:text-red-300 mb-3">You must be logged in to view orders. Redirecting to login...</p>
                <button 
                  onClick={() => window.location.href = '/admin/sign-in'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}

            {/* Loading State */}
            {(authState === 'authenticated' && fetchStatus === 'loading') && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">Loading orders...</div>
              </div>
            )}

            {/* Error State */}
            {fetchStatus === 'error' && (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-4xl mx-auto mt-8">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
                  <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Unable to Load Orders</h2>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 rounded border">
                  <p className="text-red-700 dark:text-red-300 mb-4 whitespace-pre-line">{error}</p>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800 mb-4">
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Troubleshooting Steps:</h3>
                    <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>Check if the backend server is running on port 8001</li>
                      <li>Verify the database is properly migrated</li>
                      <li>Check browser console for detailed error information</li>
                      <li>Try refreshing the page or logging in again</li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={load}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retry Loading Orders
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      Refresh Page
                    </button>
                    <button
                      onClick={() => window.open('http://127.0.0.1:8001/admin/', '_blank')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Check Backend Admin
                    </button>
                    <button
                      onClick={() => setRetryCount(0)}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      Reset Retry Count
                    </button>
                  </div>
                </div>
                
                {/* Debug information for developers */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">Developer Debug Info</summary>
                  <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                    <p>Auth State: {authState}</p>
                    <p>Fetch Status: {fetchStatus}</p>
                    <p>Retry Count: {retryCount}/{MAX_RETRIES}</p>
                    <p>API Endpoint: http://127.0.0.1:8001/api/admin/orders/</p>
                    <p>Check browser console for detailed error logs</p>
                  </div>
                  <BackendDiagnostics />
                </details>
              </div>
            )}

            {/* Success State with Orders */}
            {(authState === 'authenticated' && fetchStatus === 'success' && rows.length > 0) && (
              <div className="space-y-4">
                {rows.map(o=>(
                <div key={o.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Order #{o.id}</span>
                        <div className="flex flex-col gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tracking:</span>
                            <span className="text-sm font-mono bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-200 px-2 py-1 rounded border">
                              {o.tracking_id}
                            </span>
                            <button
                              onClick={() => copyTrackingId(o.tracking_id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                              title="Copy tracking ID"
                            >
                              {copiedId === o.tracking_id ? (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                              )}
                            </button>
                          </div>
                          {o.payment_id && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment:</span>
                              <span className="text-sm font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded border border-blue-200 dark:border-blue-700">
                                {o.payment_id}
                              </span>
                              <button
                                onClick={() => copyPaymentId(o.payment_id)}
                                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                                title="Copy payment ID"
                              >
                                {copiedPaymentId === o.payment_id ? (
                                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-slate-600 dark:text-slate-400">{o.shipping_name || '—'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatAmount(Number(o.total_price))}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-500">Order:</span>
                        <ThemeSelect
                          value={o.status} 
                          onChange={e=>update(o.id, e.target.value)}
                          options={[
                            { value: 'pending', label: 'Pending' },
                            { value: 'processing', label: 'Processing' },
                            { value: 'shipped', label: 'Shipped' },
                            { value: 'delivered', label: 'Delivered' },
                            { value: 'cancelled', label: 'Cancelled' }
                          ]}
                          className="w-32 text-xs"
                        />
                        <button
                          onClick={() => handleDeleteClick(o)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors text-red-600 dark:text-red-400"
                          title="Delete order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 dark:text-slate-500">Payment:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          o.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : o.payment_status === 'unpaid'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : o.payment_status === 'failed'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {o.payment_status === 'paid' ? 'Paid' : 
                           o.payment_status === 'unpaid' ? 'Unpaid' :
                           o.payment_status === 'failed' ? 'Failed' :
                           o.payment_status === 'refunded' ? 'Refunded' : o.payment_status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <div className="font-semibold mb-2">Items:</div>
                      <ul className="space-y-1">
                        {o.items?.map(it=>(
                          <li key={it.id} className="flex justify-between">
                            <span>{it.product_name} × {it.quantity}</span>
                            <span>@ {formatAmount(Number(it.unit_price))}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">Order Details:</div>
                      <div className="space-y-1">
                        <div><span className="font-medium">Customer:</span> {o.customer_email || 'Guest'}</div>
                        <div><span className="font-medium">Phone:</span> {o.customer_phone || 'Not provided'}</div>
                        <div><span className="font-medium">Created:</span> {new Date(o.created_at).toLocaleDateString()}</div>
                        <div><span className="font-medium">Payment:</span> {o.payment_method || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  {o.shipping_address && Object.keys(o.shipping_address).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                      <div className="font-semibold mb-2 text-slate-700 dark:text-slate-300">Shipping Info:</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <div className="mb-2">
                          <span className="font-medium">Name:</span> {o.shipping_address.firstName} {o.shipping_address.lastName}
                        </div>
                        <div className="mb-2">
                          <span className="font-medium">Phone:</span> {o.customer_phone || 'Not provided'}
                        </div>
                        <div className="font-medium mb-1">Address:</div>
                        <div>{o.shipping_address.address1}</div>
                        {o.shipping_address.address2 && <div>{o.shipping_address.address2}</div>}
                        <div>{o.shipping_address.city}, {o.shipping_address.state} {o.shipping_address.postcode}</div>
                        {o.shipping_address.country && <div>{o.shipping_address.country}</div>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}

            {/* Success State with No Orders */}
            {(authState === 'authenticated' && fetchStatus === 'success' && rows.length === 0) && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No orders found</p>
                  <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                    {status ? `No orders with status "${status}"` : 'No orders in the system'}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Pagination - only show when authenticated and have orders */}
          {authState === 'authenticated' && fetchStatus === 'success' && rows.length > 0 && (
            <div className="mt-6">
              <Pager page={page} setPage={setPage} hasNext={hasNext} hasPrev={hasPrev}/>
            </div>
          )}
        </ThemeCard>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && orderToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
              {deleteSuccess ? (
                // Success State
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Order Deleted Successfully!</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Order #{orderToDelete.id} has been removed from the database and order list.
                  </p>
                </div>
              ) : (
                // Confirmation State
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Delete Order</h3>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      Are you sure you want to delete this order? This action cannot be undone.
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <div className="font-semibold mb-2">Order Details:</div>
                        <div>Order #{orderToDelete.id}</div>
                        <div>Customer: {orderToDelete.customer_email || 'Guest'}</div>
                        <div>Total: {formatAmount(Number(orderToDelete.total_price))}</div>
                        <div>Status: {orderToDelete.status}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleDeleteCancel}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Deleting...' : 'Delete Order'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </ThemeLayout>
  );
}
