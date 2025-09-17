import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserOrders } from '../store/userSlice';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';

const Orders: React.FC = () => {
  const orders = useSelector(selectUserOrders);
  const { settings } = useStoreSettings();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Placeholder size="lg" className="mx-auto mb-6">
              <div className="text-gray-400">No Orders</div>
            </Placeholder>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order {order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(order.total, settings?.currency as Currency || 'USD')}
                    </div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Delivered' 
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {order.items.length} item(s)
                  </span>
                  <button className="text-primary hover:text-primary-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;