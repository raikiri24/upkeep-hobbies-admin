import { Sale } from '../types';
import { apiService } from '../services/apiService';

// Export utilities for sales management
export const exportSalesToCSV = async (filters: {
  query?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
}, filename: string = 'sales_export') => {
  try {
    // Get all sales matching current filters
    const response = await apiService.searchSales({
      ...filters,
      limit: 1000, // Get all matching sales
      page: 1,
      sortBy: 'timestamp',
      sortOrder: 'desc'
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

    const rows = response.sales.map((sale: Sale) => [
      sale.id,
      new Date(sale.timestamp).toLocaleString(),
      sale.customerName || 'Guest',
      sale.staffName,
      sale.items.length.toString(),
      sale.subtotal.toFixed(2),
      sale.tax.toFixed(2),
      sale.total.toFixed(2),
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
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to export:', error);
    return false;
  }
};