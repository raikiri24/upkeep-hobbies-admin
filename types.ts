export interface Item {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated?: string;
}

export type ItemFormData = Omit<Item, 'id' | 'lastUpdated'>;

export interface User {
  username: string;
  role: 'admin' | 'editor';
}

export interface ApiResponse<T> {
  [key: string]: T;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  activeItems: number;
  lowStockItems: number;
}
