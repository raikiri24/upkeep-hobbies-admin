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
