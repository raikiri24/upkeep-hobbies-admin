import React, { useState, useEffect } from 'react';
import { Receipt, Clock, Eye, Package } from 'lucide-react';
import { Sale } from '../types';
import { apiService } from '../services/apiService';
import { formatCurrency, getPaymentMethodIcon } from '../utils/currency';

interface RecentSalesProps {
  className?: string;
}

const RecentSales: React.FC<RecentSalesProps> = ({ className = "" }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentSales();
  }, []);

  const loadRecentSales = async () => {
    try {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const allSales = await apiService.getSales();
      const todaySales = allSales.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        return saleDate >= startOfToday && saleDate <= today;
      });
      
      const response = {
        sales: todaySales
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 5)
      };
      
      setSales(response.sales);
    } catch (error) {
      console.error('Failed to load recent sales:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'refunded': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-700 text-slate-400 border-slate-600';
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4 font-display flex items-center gap-2">
        <Receipt className="h-5 w-5" />
        Recent Sales
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">No sales today</p>
          <p className="text-xs mt-1">Sales from today will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => {
            const paymentMethod = getPaymentMethodIcon(sale.paymentMethod);
            return (
              <div 
                key={sale.id} 
                className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors cursor-pointer"
                title="Click to view details"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg ${paymentMethod.color}`}>
                        {paymentMethod.icon}
                      </span>
                      <span className="font-medium text-white">
                        {sale.customerName || 'Guest'}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sale.paymentStatus)}`}>
                        {sale.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(sale.timestamp)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-indigo-400">
                      {formatCurrency(sale.total)}
                    </div>
                    <div className="text-xs text-slate-500">
                      ID: {sale.id.slice(-8)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {sales.length > 0 && (
            <div className="pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">
                  {sales.length} recent sale{sales.length !== 1 ? 's' : ''}
                </span>
                <button className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  View All Sales
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecentSales;