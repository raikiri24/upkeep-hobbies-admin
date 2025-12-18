import React, { useState, useEffect } from 'react';
import { DollarSign, Search, ArrowUpDown, ArrowUp, ArrowDown, Eye, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';
import { Sale } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import SaleFilters from './SaleFilters';
import { DialogService } from '../services/dialogService';
import { formatCurrency, formatCurrencySimple, formatCurrencyForExport, getPaymentMethodIcon } from '../utils/currency';


interface SalesManagementProps {}

const SalesManagement: React.FC<SalesManagementProps> = () => {
  const { hasPermission } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const pageSize = 20;
  
  // Filters
  const [filters, setFilters] = useState({
    query: '',
    startDate: '',
    endDate: '',
    customerId: '',
    paymentMethod: '',
    paymentStatus: '',
    staffId: '',
  });
  
  // Sorting
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadSales();
  }, [currentPage, filters, sortBy, sortOrder]);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSales();
      
      // Simple filtering and pagination on client side for now
      let filteredSales = [...response];
      
      // Apply filters
      if (filters.query) {
        const query = filters.query.toLowerCase();
        filteredSales = filteredSales.filter(sale => 
          sale.customerName?.toLowerCase().includes(query) ||
          sale.items.some(item => item.itemName.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query)) ||
          sale.id.toLowerCase().includes(query)
        );
      }
      
      if (filters.startDate) {
        filteredSales = filteredSales.filter(sale => sale.timestamp >= filters.startDate);
      }
      
      if (filters.endDate) {
        filteredSales = filteredSales.filter(sale => sale.timestamp <= filters.endDate);
      }
      
      if (filters.customerId) {
        filteredSales = filteredSales.filter(sale => sale.customerId === filters.customerId);
      }
      
      if (filters.paymentMethod) {
        filteredSales = filteredSales.filter(sale => sale.paymentMethod === filters.paymentMethod);
      }
      
      if (filters.paymentStatus) {
        filteredSales = filteredSales.filter(sale => sale.paymentStatus === filters.paymentStatus);
      }
      
      if (filters.staffId) {
        filteredSales = filteredSales.filter(sale => sale.staffId === filters.staffId);
      }
      
      // Apply sorting
      if (sortBy) {
        filteredSales.sort((a, b) => {
          let aVal: any, bVal: any;
          
          switch (sortBy) {
            case 'timestamp':
              aVal = new Date(a.timestamp);
              bVal = new Date(b.timestamp);
              break;
            case 'total':
              aVal = a.total;
              bVal = b.total;
              break;
            case 'customerName':
              aVal = a.customerName || '';
              bVal = b.customerName || '';
              break;
            default:
              aVal = a.timestamp;
              bVal = b.timestamp;
          }
          
          if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      // Apply pagination
      const total = filteredSales.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (currentPage - 1) * pageSize;
      const paginatedSales = filteredSales.slice(startIndex, startIndex + pageSize);
      
      setSales(paginatedSales);
      setTotalResults(total);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Failed to load sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      query: '',
      startDate: '',
      endDate: '',
      customerId: '',
      paymentMethod: '',
      paymentStatus: '',
      staffId: '',
    });
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change field and default to desc
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4 text-indigo-400" /> : <ArrowDown className="h-4 w-4 text-indigo-400" />;
  };

  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportToCSV = async () => {
    try {
      const response = await apiService.searchSales({
        ...filters,
        limit: 1000, // Get all matching sales
        page: 1,
        sortBy,
        sortOrder
      });
      
      // Generate CSV content
      const headers = [
        'Sale ID',
        'Date/Time',
        'Customer',
        'Staff Member',
        'Items Count',
        'Subtotal',
        'Tax',
        'Total',
        'Payment Method',
        'Payment Status'
      ];

      const rows = response.sales.map(sale => [
        sale.id,
        new Date(sale.timestamp).toLocaleString(),
        sale.customerName || 'Guest',
        sale.staffName,
        sale.items.length.toString(),
        formatCurrencyForExport(sale.subtotal),
        formatCurrencyForExport(sale.tax),
        formatCurrencyForExport(sale.total),
        sale.paymentMethod,
        sale.paymentStatus
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      DialogService.success('Sales exported to CSV successfully!');
    } catch (error) {
      console.error('Failed to export:', error);
      DialogService.error('Failed to export sales. Please try again.');
    }
  };







  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  

  if (!hasPermission('sales.view')) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-400">You don't have permission to view sales management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Sales Management</h1>
          <p className="text-slate-400">View and manage all sales transactions</p>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4 flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white hover:bg-slate-800 transition-colors"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          
          {showFilters && (
            <SaleFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-indigo-600/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-indigo-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-white mt-1">{totalResults}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Average Sale</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Page</p>
                <p className="text-2xl font-bold text-white mt-1">{currentPage}/{totalPages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Date/Time
                      {getSortIcon('timestamp')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('customerName')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Customer
                      {getSortIcon('customerName')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('total')}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      Total
                      {getSortIcon('total')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                      <p className="text-slate-500 mt-2">Loading sales...</p>
                    </td>
                  </tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-slate-400">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No sales found</p>
                        <p className="text-sm">Try adjusting your filters or search terms</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">
                        <div>
                          <div className="text-sm">{formatDate(sale.timestamp)}</div>
                          <div className="text-xs text-slate-500">ID: {sale.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div>
                          <div className="font-medium">{sale.customerName || 'Guest'}</div>
                          <div className="text-xs text-slate-500">Staff: {sale.staffName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="text-sm">
                          {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-slate-500">
                          {sale.items.slice(0, 2).map(item => item.itemName).join(', ')}
                          {sale.items.length > 2 && '...'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {formatCurrency(sale.total)}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPaymentMethodIcon(sale.paymentMethod).icon}</span>
                          <span className="capitalize">{sale.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sale.paymentStatus)}`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                  onClick={() => handleViewSale(sale)}
                  className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                {hasPermission('sales.export') && (
                  <button
                    onClick={handleExportToCSV}
                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                    title="Export to CSV"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalResults)} of {totalResults} sales
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    if (totalPages <= 5) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal Placeholder */}
      {showDetailModal && selectedSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Sale Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Sale Header */}
              <div className="grid grid-cols-2 gap-4 bg-slate-800 rounded-lg p-4">
                <div>
                  <p className="text-sm text-slate-400">Sale ID</p>
                  <p className="font-mono text-white">{selectedSale.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Date & Time</p>
                  <p className="text-white">{formatDate(selectedSale.timestamp)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Customer</p>
                  <p className="text-white">{selectedSale.customerName || 'Guest'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Staff</p>
                  <p className="text-white">{selectedSale.staffName}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedSale.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-white">{item.itemName}</p>
                        <p className="text-sm text-slate-400">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white">{item.quantity} × {formatCurrencySimple(item.price)}</p>
                        <p className="font-medium text-indigo-400">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="space-y-2">
<div className="flex justify-between">
                     <span className="text-slate-400">Subtotal</span>
                     <span className="text-white">{formatCurrency(selectedSale.subtotal)}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-slate-400">Tax</span>
                     <span className="text-white">{formatCurrency(selectedSale.tax)}</span>
                   </div>
                   <div className="flex justify-between text-lg font-bold border-t border-slate-700 pt-2">
                     <span className="text-white">Total</span>
                     <span className="text-indigo-400">{formatCurrency(selectedSale.total)}</span>
                   </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-800 rounded-lg p-4">
                <div>
                  <p className="text-sm text-slate-400">Payment Method</p>
                  <p className="capitalize text-white">{selectedSale.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Payment Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(selectedSale.paymentStatus)}`}>
                    {selectedSale.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagement;