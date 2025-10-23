import { useEffect, useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../store/currencyStore';
import { ThemeLayout, ThemeCard, SectionHeader, ThemeAlert } from '@theme';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { getDashboardStats } from '../../lib/api';

export default function Dashboard() {
  const { isAuthed, me, logout, init } = useAuth();
  const nav = useNavigate();
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [showAllCategories, setShowAllCategories] = useState(false);

  const loadDashboardData = async (retryCount = 0) => {
    try {
      // The API interceptor returns the data directly, not wrapped in { data }
      const data = await getDashboardStats();
      
      setStats(data);
      setLastRefresh(Date.now());
      setErr(null); // Clear any previous errors
    } catch (e) {
      console.error('Dashboard error:', e);
      
      // If it's a 401 error and we haven't retried yet, try to refresh token and retry
      if (e.response?.status === 401 && retryCount === 0) {
        try {
          // The API interceptor should handle token refresh automatically
          // Let's retry the request once more
          setTimeout(() => loadDashboardData(1), 1000);
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          setErr('Authentication expired. Please login again.');
          logout();
          nav('/sign-in');
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
        weekly_sales: [],
        user_registrations: [],
        weekly_user_registrations: [],
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
          setErr('No authentication token found. Please login again.');
          return;
        }

        // Wait for auth store to be initialized
        await init();

        // Try to get user info first to validate token
        const userData = await me();
        
        if (!userData) {
          setErr('Authentication failed. Please login again.');
          logout();
          nav('/sign-in');
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
        loadDashboardData();
      }
    };

    const handleFocus = () => {
      loadDashboardData();
    };

    const handleOrdersUpdated = (event) => {
      loadDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('ordersUpdated', handleOrdersUpdated);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('ordersUpdated', handleOrdersUpdated);
    };
  }, []);

  // Remove redundant auth checks - Private component handles this
  // useEffect(() => {
  //   authMe().catch(() => logout('session'));
  // }, []);

  return (
    <ThemeLayout>
        {/* Popup Alert Dialog */}
        {err && (
          <ThemeAlert 
            message={err} 
            type="error" 
            onClose={() => setErr(null)}
            autoClose={true}
            duration={1000}
          />
        )}
        {!stats ? (
          <ThemeCard>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</div>
              {err && (
                <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
                  <div className="text-red-700 dark:text-red-300 text-sm">
                    Error: {err}
                  </div>
                </div>
              )}
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
                  Last updated: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'Never'}
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
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sales Analytics</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last 30 days performance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatAmount(stats.sales_by_day.reduce((sum, day) => sum + day.revenue, 0))}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Revenue</div>
                  </div>
                </div>
                
                {/* Sales Chart */}
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.sales_by_day}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {new Date(label).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                      {formatAmount(data.revenue)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Orders:</span>
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                      {data.orders}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Sales Metrics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {stats.sales_by_day.length}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Active Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {stats.sales_by_day.length > 0 ? Math.round(stats.sales_by_day.reduce((sum, day) => sum + day.orders, 0) / stats.sales_by_day.length) : 0}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Avg Orders/Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                      {stats.sales_by_day.length > 0 ? formatAmount(stats.sales_by_day.reduce((sum, day) => sum + day.revenue, 0) / stats.sales_by_day.length) : formatAmount(0)}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Avg Revenue/Day</div>
                  </div>
                </div>
              </ThemeCard>
              
              {/* Weekly Sales Pie Chart */}
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🥧</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Weekly Sales Distribution</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Sales by day of the week</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {formatAmount(stats.weekly_sales.reduce((sum, day) => sum + day.revenue, 0))}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Weekly</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.weekly_sales.filter(day => day.revenue > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ day, revenue, percent }) => `${day} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                        >
                          {stats.weekly_sales.filter(day => day.revenue > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={
                              ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'][index % 7]
                            } />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [formatAmount(value), 'Revenue']}
                          labelFormatter={(label) => `${label}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Weekly Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Daily Breakdown</h4>
                    {stats.weekly_sales.map((day, index) => (
                      <div key={day.day} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: day.revenue > 0 ? 
                                ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'][index] : 
                                '#e2e8f0'
                            }}
                          ></div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                            {day.day}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {formatAmount(day.revenue)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {day.orders} orders
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Weekly Insights */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {stats.weekly_sales.filter(day => day.revenue > 0).length}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Active Days</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {stats.weekly_sales.length > 0 ? 
                          Math.round(stats.weekly_sales.reduce((sum, day) => sum + day.orders, 0) / stats.weekly_sales.length) : 0
                        }
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Avg Orders/Day</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {stats.weekly_sales.length > 0 ? 
                          formatAmount(stats.weekly_sales.reduce((sum, day) => sum + day.revenue, 0) / stats.weekly_sales.length) : 
                          formatAmount(0)
                        }
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">Avg Revenue/Day</div>
                    </div>
                  </div>
                </div>
              </ThemeCard>
              
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📦</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Inventory</h3>
                  <div className="ml-auto">
                    <select 
                      className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                      value={showAllCategories ? 'all' : 'top-stock'}
                      onChange={(e) => setShowAllCategories(e.target.value === 'all')}
                    >
                      <option value="top-stock">Top Stock Products</option>
                      <option value="all">All Products</option>
                    </select>
                  </div>
                </div>
                
                {/* Product Inventory Grid */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(showAllCategories ? stats.inventory.by_category : stats.inventory.by_category.slice(0, 10)).map((product, index) => (
                    <div key={product.id} className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                            {product.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {product.category} • {formatAmount(product.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                            {product.stock}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            in stock
                          </div>
                        </div>
                      </div>
                      
                      {/* Stock Level Bar */}
                      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            product.stock > 20 ? 'bg-green-500' :
                            product.stock > 10 ? 'bg-yellow-500' :
                            product.stock > 5 ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min((product.stock / 50) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      
                      {/* Stock Status */}
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          product.stock > 20 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                          product.stock > 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                          product.stock > 5 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {product.stock > 20 ? 'High Stock' :
                           product.stock > 10 ? 'Good Stock' :
                           product.stock > 5 ? 'Low Stock' :
                           'Critical Stock'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          #{product.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Total products:</span> {stats.inventory.total_products} · 
                    <span className="font-semibold ml-2">Low stock:</span> {stats.inventory.low_stock_count} ·
                    <span className="font-semibold ml-2">Showing:</span> {showAllCategories ? stats.inventory.by_category.length : Math.min(stats.inventory.by_category.length, 10)} products
                  </div>
                </div>
              </ThemeCard>
              
              {/* User Registration Analytics */}
              <ThemeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">User Registrations</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Last 30 days activity</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {stats.user_registrations.reduce((sum, day) => sum + day.users, 0)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Total Users</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Registration Chart - Beautiful Bar Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.user_registrations.slice(-14)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="userBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#64748b' }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickCount={6}
                          domain={[0, 'dataMax + 1']}
                        />
                        <Tooltip 
                          formatter={(value) => [value, 'New Users']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            padding: '12px'
                          }}
                          cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                        />
                        <Bar 
                          dataKey="users" 
                          fill="url(#userBarGradient)"
                          radius={[4, 4, 0, 0]}
                          stroke="#6366f1"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Weekly Breakdown - Enhanced Design */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Weekly Pattern</h4>
                    {stats.weekly_user_registrations.map((day, index) => (
                      <div key={day.day} className="group relative">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-xl hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div 
                                className="w-5 h-5 rounded-full shadow-sm"
                                style={{ 
                                  backgroundColor: day.users > 0 ? 
                                    ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'][index] : 
                                    '#e2e8f0'
                                }}
                              ></div>
                              {day.users > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-slate-800 rounded-full border-2 border-current"></div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                                {day.day}
                              </span>
                              {day.users > 0 && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {day.users === 1 ? '1 user' : `${day.users} users`}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
                              {day.users}
                            </div>
                            {day.users > 0 && (
                              <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Weekly Summary Card */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">This Week</div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-400">Registration Activity</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                            {stats.weekly_user_registrations.reduce((sum, day) => sum + day.users, 0)}
                          </div>
                          <div className="text-xs text-indigo-500 dark:text-indigo-500">Total Users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* User Insights - Enhanced Design */}
                <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="group">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-white text-lg">📅</span>
                      </div>
                      <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        {stats.user_registrations.filter(day => day.users > 0).length}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Active Days</div>
                    </div>
                    <div className="group">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                        {stats.user_registrations.length > 0 ? 
                          Math.round(stats.user_registrations.reduce((sum, day) => sum + day.users, 0) / stats.user_registrations.length * 10) / 10 : 0
                        }
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Avg Users/Day</div>
                    </div>
                    <div className="group">
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <span className="text-white text-lg">🚀</span>
                      </div>
                      <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">
                        {Math.max(...stats.user_registrations.map(day => day.users))}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Peak Day</div>
                    </div>
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
                            o.payment_status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            o.payment_status === 'unpaid' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            o.payment_status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {o.payment_status === 'paid' ? 'Paid' : 
                             o.payment_status === 'unpaid' ? 'Unpaid' :
                             o.payment_status === 'failed' ? 'Failed' :
                             o.payment_status === 'refunded' ? 'Refunded' : o.payment_status}
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