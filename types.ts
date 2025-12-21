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
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  avatar?: string;
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

export interface BeybladeStats {
  spinFinishes: number;
  overFinishes: number;
  burstFinishes: number;
  extremeFinishes: number;
}

export interface Player {
  id: string;
  name: string;
  email: string;
  avatar: string;
  beybladeStats: BeybladeStats;
}

export interface TournamentStanding {
  userId: string;
  rank: number;
  score: string;
  notes: string;
}

export interface Tournament {
  _id?: string;
  name: string;
  date: Date;
  game: string;
  season: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  participants: string[];
  maxPlayers: number;
  standings?: TournamentStanding[];
}

export type TournamentFormData = Omit<Tournament, '_id'>;

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  totalPurchases: number;
  visits: number;
  createdAt: string;
  lastVisit?: string;
}

export type CustomerFormData = Omit<Customer, 'id' | 'totalPurchases' | 'visits' | 'createdAt' | 'lastVisit'>;

export interface SaleItem {
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  price: number;
  discount?: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  paymentStatus: 'pending' | 'completed' | 'refunded' | 'failed';
  customerId?: string;
  customerName?: string;
  staffId: string;
  staffName: string;
  timestamp: string;
  notes?: string;
  refundedItems?: SaleItem[];
  refundAmount?: number;
}

export type SaleFormData = Omit<Sale, 'id' | 'timestamp' | 'staffName' | 'paymentStatus'>;

export interface Transaction {
  id: string;
  saleId: string;
  type: 'sale' | 'refund' | 'void';
  amount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  staffId: string;
  notes?: string;
}

export interface PosReport {
  totalSales: number;
  totalTransactions: number;
  averageSale: number;
  topSellingItems: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }>;
  paymentBreakdown: {
    cash: number;
    card: number;
    digital: number;
  };
  salesByHour: Array<{
    hour: number;
    sales: number;
    revenue: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

export interface CartItem {
  item: Item;
  quantity: number;
  discount?: number;
}
