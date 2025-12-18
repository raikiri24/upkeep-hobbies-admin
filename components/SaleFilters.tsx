import React, { useState, useEffect } from 'react';
import { Calendar, Filter, X, Search, DollarSign } from 'lucide-react';
import { Customer } from '../types';
import { apiService } from '../services/apiService';

interface SaleFiltersProps {
  filters: {
    query: string;
    startDate: string;
    endDate: string;
    customerId: string;
    paymentMethod: string;
    paymentStatus: string;
    staffId: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  className?: string;
}

const SaleFilters: React.FC<SaleFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ""
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (filters.query) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.customerId) count++;
    if (filters.paymentMethod) count++;
    if (filters.paymentStatus) count++;
    if (filters.staffId) count++;
    setActiveFilterCount(count);
  }, [filters]);

  const loadCustomers = async () => {
    try {
      const data = await apiService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = activeFilterCount > 0;

  const paymentMethods = [
    { value: '', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'digital', label: 'Digital' },
  ];

  const paymentStatuses = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/10 rounded-lg">
            <Filter className="h-5 w-5 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Filters</h2>
          {hasActiveFilters && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-slate-400 hover:text-white transition-colors text-sm"
          >
            {showAdvanced ? 'Less' : 'Advanced'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 text-sm"
            >
              <X className="h-3 w-3" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Basic Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by customer, product, or sale ID..."
          value={filters.query}
          onChange={(e) => handleFilterChange('query', e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      {/* Advanced Filters */}
      <div className={`space-y-4 transition-all ${showAdvanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Customer
            </label>
            <select
              value={filters.customerId}
              onChange={(e) => handleFilterChange('customerId', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Payment Method
            </label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              {paymentStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Staff ID (placeholder) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Staff Member
            </label>
            <select
              value={filters.staffId}
              onChange={(e) => handleFilterChange('staffId', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="">All Staff</option>
              <option value="admin-1">Admin User</option>
              <option value="editor-1">Editor User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Date Range Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
        <button
          onClick={() => {
            const today = new Date();
            const startOfDay = new Date(today.setHours(0, 0, 0, 0));
            onFiltersChange({
              ...filters,
              startDate: startOfDay.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            });
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            onFiltersChange({
              ...filters,
              startDate: weekAgo.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            });
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            onFiltersChange({
              ...filters,
              startDate: monthAgo.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            });
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          Last 30 Days
        </button>
        <button
          onClick={() => {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            onFiltersChange({
              ...filters,
              startDate: monthStart.toISOString().split('T')[0],
              endDate: today.toISOString().split('T')[0]
            });
          }}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
        >
          This Month
        </button>
      </div>
    </div>
  );
};

export default SaleFilters;