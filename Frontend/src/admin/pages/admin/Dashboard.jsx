import { useEffect, useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../store/currencyStore';
import { ThemeLayout, ThemeCard, SectionHeader, ThemeAlert } from '@shared/theme';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { getDashboardStats } from '../../lib/api';

export default function Dashboard() {
  const { isAuthed, me, logout, init } = useAuth();
  const nav = useNavigate();
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const loadDashboardData = async (retryCount = 0) => {
    try {
      console.log('🔄 Loading dashboard data...');
      const { data } = await getDashboardStats();
      console.log('✅ Dashboard stats loaded successfully:', data);
      setStats(data);
      setLastRefresh(Date.now());
      setErr(null); // Clear any previous errors
    } catch (e) {
      console.error('Dashboard error:', e);
      
      // If it's a 401 error and we haven't retried yet, try to refresh token and retry
      if (e.response?.status === 401 && retryCount === 0) {
        console.log('🔄 401 error, attempting token refresh...');
        try {
          // The API interceptor should handle token refresh automatically
          // Let's retry the request once more
          setTimeout(() => loadDashboardData(1), 1000);
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          setErr('Authentication expired. Please login again.');
          logout();
          nav('/admin/sign-in');
          return;
        }
      }
      
      setErr(e.uiMessage || e.message || 'Failed to load dashboard stats');
      // Set empty stats as fallback
      setStats({
        totals: {
          revenue: 0,
          orders: 0,
          customers: 0,
          avg_order_value: 0
        },
        sales_by_day: [],
        top_products: [],
        inventory: {
          total_products: 0,
          low_stock_count: 0,
          by_category: []
        },
        recent_orders: []
      });
    }
  };

  useEffect(() => {
    // Initialize auth and load dashboard data
    (async () => {
      try {
        // First, ensure we have a valid token
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');
        if (!authData.access) {
          console.error('No access token found');
          setErr('No authentication token found. Please login again.');
          return;
        }

        // Wait for auth store to be initialized
        await init();

        // Try to get user info first to validate token
        const userData = await me();
        if (!userData) {
          console.error('Failed to get user data - token may be invalid');
          setErr('Authentication failed. Please login again.');
          logout();
          nav('/admin/sign-in');
          return;
        }

        // Load dashboard data
        await loadDashboardData();
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setErr('Failed to initialize dashboard. Please refresh the page.');
      }
    })();
  }, [me, init]);

  // Refresh dashboard when page becomes visible (user navigates back from orders page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('📊 Page became visible, refreshing dashboard data...');
        loadDashboardData();
      }
    };

    const handleFocus = () => {
      console.log('📊 Window focused, refreshing dashboard data...');
      loadDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Remove redundant auth checks - Private component handles this
  // useEffect(() => {
  //   authMe().catch(() => logout('session'));
  // }, []);

  // if (!isAuthed()) return null;

  return (
    <ThemeLayout>
        {err && <ThemeAlert message={err} type="error" />}
        {!stats ? (
          <ThemeCard>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</div>
            </div>
          </ThemeCard>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <SectionHeader 
                title="Dashboard Overview" 
                icon="📊" 
                color="primary"
                subtitle="Monitor your business performance and key metrics"
              />
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={loadDashboardData}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title="Refresh dashboard data"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm font-medium">Refresh</span>
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Last updated: {new Date(lastRefresh).toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <KPICard title="Total Revenue" value={formatAmount(stats.totals.revenue)} icon="💰" color="success" />
              <KPICard title="Orders" value={stats.totals.orders} icon="📦" color="primary" />
              <KPICard title="Customers" value={stats.totals.customers} icon="👥" color="info" />
              <KPICard title="Avg Order Value" value={formatAmount(stats.totals.avg_order_value)} icon="📈" color="warning" />
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📈</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales (Last 30 Days)</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.sales_by_day}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ThemeCard>
              
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Inventory by Category</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.inventory.by_category}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Total products:</span> {stats.inventory.total_products} · 
                    <span className="font-semibold ml-2">Low stock:</span> {stats.inventory.low_stock_count}
                  </div>
                </div>
              </ThemeCard>
            </div>

            {/* Top Products & Recent Orders */}
            <div className="grid gap-6 md:grid-cols-2">
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🏆</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Top Products (30d)</h3>
                </div>
                <div className="space-y-3">
                  {stats.top_products.map(tp => (
                    <div key={tp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{tp.name}</span>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-semibold">{tp.sold_qty}</span> sold · 
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 ml-1">{formatAmount(tp.revenue || 0)}</span>
                      </div>
                    </div>
                  ))}
                  {!stats.top_products.length && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <div className="text-4xl mb-2">📦</div>
                      <div>No sales data available</div>
                    </div>
                  )}
                </div>
              </ThemeCard>
              
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Recent Orders</h3>
                </div>
                <div className="overflow-auto">
                  <div className="space-y-3">
                    {stats.recent_orders.map(o => (
                      <div key={o.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Order #{o.id}</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold capitalize ${
                            o.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            o.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          <div>Customer: {o.customer_email || '—'}</div>
                          <div className="flex justify-between mt-1">
                            <span>Total: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatAmount(Number(o.total_price))}</span></span>
                            <span>{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!stats.recent_orders.length && (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <div className="text-4xl mb-2">📋</div>
                        <div>No recent orders</div>
                      </div>
                    )}
                  </div>
                </div>
              </ThemeCard>
            </div>
          </>
        )}
      </ThemeLayout>
  );
}

function KPICard({ title, value, icon, color = 'primary' }) {
  const colorConfig = {
    primary: 'from-blue-500 to-purple-600',
    success: 'from-emerald-500 to-teal-600',
    warning: 'from-orange-500 to-yellow-600',
    info: 'from-purple-500 to-pink-600'
  };
  
  return (
    <ThemeCard className="group hover:scale-105 transition-transform duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorConfig[color]} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">{title}</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
        </div>
      </div>
    </ThemeCard>
  );
}