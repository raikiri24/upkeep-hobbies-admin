import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, ShoppingCart, Package, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { PosReport, Sale } from '../types';
import { apiService } from '../services/apiService';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';

interface SalesReportsProps {}

const SalesReports: React.FC<SalesReportsProps> = () => {
  const [report, setReport] = useState<PosReport | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');

  useEffect(() => {
    loadReport();
  }, [period]);

  const getPeriodDates = () => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    return {
      start: start.toISOString(),
      end: now.toISOString()
    };
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      const { start, end } = getPeriodDates();
      const [reportData, salesData] = await Promise.all([
        apiService.getPosReport(start, end),
        apiService.getSales()
      ]);
      
      setReport(reportData);
      setSales(salesData.filter(sale => sale.timestamp >= start && sale.timestamp <= end));
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Failed to load sales report</p>
      </div>
    );
  }

  const paymentMethods = [
    { name: 'Cash', key: 'cash' as const, icon: DollarSign, color: 'text-green-400' },
    { name: 'Card', key: 'card' as const, icon: Package, color: 'text-blue-400' },
    { name: 'Digital', key: 'digital' as const, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Sales Reports</h1>
          <p className="text-slate-400">Analyze your sales performance and trends</p>
        </div>

        {/* Period Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Calendar className="h-5 w-5 text-slate-400" />
            <h2 className="text-xl font-semibold">Report Period</h2>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-600/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-indigo-400" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(report.totalSales)}</h3>
            <p className="text-slate-400 text-sm">Total Sales</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-600/10 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{report.totalTransactions}</h3>
            <p className="text-slate-400 text-sm">Transactions</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-600/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{formatCurrency(report.averageSale)}</h3>
            <p className="text-slate-400 text-sm">Average Sale</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-600/10 rounded-lg">
                <Package className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{report.topSellingItems.length}</h3>
            <p className="text-slate-400 text-sm">Products Sold</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Selling Items */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Selling Items
            </h2>
            {report.topSellingItems.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No sales data available</p>
            ) : (
              <div className="space-y-3">
                {report.topSellingItems.map((item, index) => (
                  <div key={item.itemId} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{item.itemName}</h4>
                        <p className="text-slate-400 text-sm">{item.quantity} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-400">{formatCurrency(item.revenue)}</p>
                      <p className="text-slate-400 text-sm">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Methods
            </h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const amount = report.paymentBreakdown[method.key];
                const percentage = report.totalSales > 0 ? (amount / report.totalSales) * 100 : 0;
                
                return (
                  <div key={method.key} className="p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${method.color}`} />
                        <span className="font-medium text-white">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(amount)}</p>
                        <p className="text-slate-400 text-sm">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          method.key === 'cash' ? 'bg-green-500' :
                          method.key === 'card' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sales by Hour */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales by Hour
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {report.salesByHour.map((hour) => (
              <div key={hour.hour} className="bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-slate-400 text-sm mb-1">{hour.hour}:00</p>
                <p className="text-white font-bold">{hour.sales}</p>
                <p className="text-indigo-400 text-sm">{formatCurrency(hour.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;