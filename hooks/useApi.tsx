import React from 'react';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Item, Sale, Customer, Tournament, Player } from '../types';

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Generic pagination interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
}

// Enhanced query hooks
export const useItems = (page = 1, pageSize = 20, filters?: { search?: string; category?: string }) => {
  return useQuery({
    queryKey: ['items', page, pageSize, filters],
    queryFn: async (): Promise<PaginatedResponse<Item>> => {
      // If backend supports pagination, use:
      // return apiService.getItemsPaginated(page, pageSize, filters);
      
      // For now, enhance existing service with client-side pagination
      const allItems = await apiService.getItems();
      let filteredItems = allItems;

      if (filters?.search) {
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          item.sku.toLowerCase().includes(filters.search!.toLowerCase()) ||
          item.category.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }

      if (filters?.category) {
        filteredItems = filteredItems.filter(item => item.category === filters.category);
      }

      const total = filteredItems.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const data = filteredItems.slice(startIndex, startIndex + pageSize);

      return {
        data,
        total,
        page,
        totalPages,
        pageSize,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for inventory
  });
};

export const useSales = (page = 1, pageSize = 20, filters?: {
  query?: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  staffId?: string;
}) => {
  return useQuery({
    queryKey: ['sales', page, pageSize, filters],
    queryFn: async (): Promise<PaginatedResponse<Sale>> => {
      // Use the existing searchSales method if available, otherwise enhance getSales
      if (apiService.searchSales) {
        const response = await apiService.searchSales({
          query: filters?.query,
          page,
          limit: pageSize,
        });
        return {
          data: response.sales,
          total: response.total,
          page,
          totalPages: response.totalPages,
          pageSize,
        };
      }

      // Fallback to client-side filtering
      const allSales = await apiService.getSales();
      let filteredSales = allSales;

      // Apply filters (similar to existing logic)
      if (filters?.query) {
        const query = filters.query.toLowerCase();
        filteredSales = filteredSales.filter(sale => 
          sale.customerName?.toLowerCase().includes(query) ||
          sale.items.some(item => 
            item.itemName.toLowerCase().includes(query) || 
            item.sku.toLowerCase().includes(query)
          ) ||
          sale.id.toLowerCase().includes(query)
        );
      }

      // Apply other filters...
      if (filters?.startDate) {
        filteredSales = filteredSales.filter(sale => sale.timestamp >= filters.startDate!);
      }
      if (filters?.endDate) {
        filteredSales = filteredSales.filter(sale => sale.timestamp <= filters.endDate!);
      }
      if (filters?.customerId) {
        filteredSales = filteredSales.filter(sale => sale.customerId === filters.customerId);
      }
      if (filters?.paymentMethod) {
        filteredSales = filteredSales.filter(sale => sale.paymentMethod === filters.paymentMethod);
      }
      if (filters?.paymentStatus) {
        filteredSales = filteredSales.filter(sale => sale.paymentStatus === filters.paymentStatus);
      }
      if (filters?.staffId) {
        filteredSales = filteredSales.filter(sale => sale.staffId === filters.staffId);
      }

      // Sort by timestamp (newest first)
      filteredSales.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const total = filteredSales.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const data = filteredSales.slice(startIndex, startIndex + pageSize);

      return {
        data,
        total,
        page,
        totalPages,
        pageSize,
      };
    },
    staleTime: 30 * 1000, // 30 seconds for sales (more dynamic)
  });
};

export const useCustomers = (page = 1, pageSize = 20, search?: string) => {
  return useQuery({
    queryKey: ['customers', page, pageSize, search],
    queryFn: async (): Promise<PaginatedResponse<Customer>> => {
      const allCustomers = await apiService.getCustomers();
      let filteredCustomers = allCustomers;

      if (search) {
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.name.toLowerCase().includes(search.toLowerCase()) ||
          customer.email.toLowerCase().includes(search.toLowerCase())
        );
      }

      const total = filteredCustomers.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const data = filteredCustomers.slice(startIndex, startIndex + pageSize);

      return {
        data,
        total,
        page,
        totalPages,
        pageSize,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for customers
  });
};

export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: () => apiService.getTournaments(),
    staleTime: 10 * 60 * 1000, // 10 minutes for tournaments
  });
};

export const usePlayers = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: () => apiService.getPlayers(),
    staleTime: 10 * 60 * 1000, // 10 minutes for players
  });
};

// Mutation hooks
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (itemData: Parameters<typeof apiService.createItem>[0]) => 
      apiService.createItem(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Item> }) => 
      apiService.updateItem(id, updates),
    onSuccess: () => {
      // Invalidate all items queries to ensure refetch with current filters
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteItem(id),
    onSuccess: () => {
      // Invalidate all items queries to ensure refetch with current filters
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Also refetch immediately to ensure UI updates
      queryClient.refetchQueries({ queryKey: ['items'] });
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTournament(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ saleData, staffName }: { 
      saleData: Parameters<typeof apiService.createSale>[0]; 
      staffName: string;
    }) => apiService.createSale(saleData, staffName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['pos-report'] });
    },
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customerData: Parameters<typeof apiService.createCustomer>[0]) => 
      apiService.createCustomer(customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) => 
      apiService.updateCustomer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Player> }) => 
      apiService.updatePlayer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Tournament> }) => 
      apiService.updateTournament(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
};

// Provider wrapper
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};