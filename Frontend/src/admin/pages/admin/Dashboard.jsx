import { useEffect, useState } from 'react';
import { useAuth } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../store/currencyStore';
import { ThemeLayout, ThemeCard, SectionHeader, ThemeAlert } from '@shared/theme';
// import { getDashboardStats } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function Dashboard() {
  const { isAuthed, me } = useAuth();
  const nav = useNavigate();
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    // Remove redundant auth check - Private component handles this
    (async () => {
      await me();
      try {
        // const { data } = await getDashboardStats();
        // setStats(data);
        setStats({
          totals: {
            revenue: 0,
            orders: 0,
            customers: 0,
            avg_order_value: 0
          },
          chart_data: [],
          top_products: [],
          inventory: {
            total_products: 0,
            low_stock_count: 0
          },
          recent_orders: []
        }); // Mock data for now
      } catch (e) {
        setErr('Failed to load stats');
      }
    })();
  }, [me]);

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
            <SectionHeader 
              title="Dashboard Overview" 
              icon="📊" 
              color="primary"
              subtitle="Monitor your business performance and key metrics"
            />
            
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
                          <div>Customer: {o.shipping_name || '—'}</div>
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