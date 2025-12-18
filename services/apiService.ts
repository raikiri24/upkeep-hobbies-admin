import {
  Item,
  ItemFormData,
  Player,
  Tournament,
  TournamentFormData,
  GoogleUser,
  AuthUser,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Customer,
  CustomerFormData,
  Sale,
  SaleFormData,
  Transaction,
  PosReport,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { API_CONFIG } from "./googleOAuth";

const USE_MOCK = true;
const MOCK_DELAY = 600;

// --- Mock Data ---
let mockItems: Record<string, Item> = {
  "0": {
    id: "101",
    name: "Thunderbolt RC Car 4WD",
    sku: "RC-4WD-001",
    category: "RC Vehicles",
    price: 299.99,
    stock: 12,
    description: "High speed electric RC car with brushless motor.",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-159478731/sub?w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-25T10:00:00Z",
  },
};

let mockCustomers: Customer[] = [
  {
    id: "cust-001",
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1234567890",
    totalPurchases: 1250.75,
    visits: 15,
    createdAt: "2024-01-15T10:30:00Z",
    lastVisit: "2024-12-18T14:20:00Z",
  },
];

let mockSales: Sale[] = [
  {
    id: "sale-001",
    items: [
      {
        itemId: "101",
        itemName: "Thunderbolt RC Car 4WD",
        sku: "RC-4WD-001",
        quantity: 1,
        price: 299.99,
        subtotal: 299.99,
      },
    ],
    subtotal: 299.99,
    tax: 24.0,
    total: 323.99,
    paymentMethod: "card",
    paymentStatus: "completed",
    customerId: "cust-001",
    customerName: "John Doe",
    staffId: "admin-1",
    staffName: "Admin User",
    timestamp: "2024-12-18T14:20:00Z",
  },
];

// --- ApiService ---
class ApiService {
  private baseUrl = API_CONFIG.baseUrl;

  private async simulateDelay() {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
  }

  private normalizeResponse<T>(data: any): T[] {
    if (Array.isArray(data)) return data;
    if (
      data &&
      typeof data === "object" &&
      Object.keys(data).every((k) => !isNaN(Number(k)))
    ) {
      return Object.values(data);
    }
    return [];
  }

  // --- Items ---
  async getItems(): Promise<Item[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return this.normalizeResponse<Item>(mockItems);
    }

    const response = await fetch(`${this.baseUrl}/getItems`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return this.normalizeResponse<Item>(data);
  }

  async getOneItem(id: string): Promise<Item | null> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return Object.values(mockItems).find((i) => i.id === id) || null;
    }

    const response = await fetch(`${this.baseUrl}/getOneItem?id=${id}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  }

  async createItem(itemData: ItemFormData): Promise<Item> {
    const newItem: Item = {
      ...itemData,
      id: uuidv4(),
      lastUpdated: new Date().toISOString(),
    };

    if (USE_MOCK) {
      await this.simulateDelay();
      const nextKey = (
        Math.max(...Object.keys(mockItems).map(Number), -1) + 1
      ).toString();
      mockItems[nextKey] = newItem;
      return newItem;
    }

    const response = await fetch(`${this.baseUrl}/createItems`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    return await response.json();
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const key = Object.keys(mockItems).find((k) => mockItems[k].id === id);
      if (!key) throw new Error("Item not found");
      mockItems[key] = {
        ...mockItems[key],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      return mockItems[key];
    }

    const response = await fetch(`${this.baseUrl}/updateItem`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return await response.json();
  }

  async deleteItem(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const key = Object.keys(mockItems).find((k) => mockItems[k].id === id);
      if (!key) return false;
      delete mockItems[key];
      return true;
    }

    const response = await fetch(`${this.baseUrl}/deleteItems`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return response.ok;
  }

  // --- POS: Customers ---
  async getCustomers(): Promise<Customer[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return mockCustomers;
    }

    const response = await fetch(`${this.baseUrl}/customers`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return this.normalizeResponse<Customer>(data);
  }

  async createCustomer(customerData: CustomerFormData): Promise<Customer> {
    const newCustomer: Customer = {
      ...customerData,
      id: uuidv4(),
      totalPurchases: 0,
      visits: 0,
      createdAt: new Date().toISOString(),
    };

    if (USE_MOCK) {
      await this.simulateDelay();
      mockCustomers.push(newCustomer);
      return newCustomer;
    }

    const response = await fetch(`${this.baseUrl}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });
    return await response.json();
  }

  // --- POS: Sales ---
  async getSales(): Promise<Sale[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return mockSales;
    }

    const response = await fetch(`${this.baseUrl}/sales`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return this.normalizeResponse<Sale>(data);
  }

  async createSale(saleData: SaleFormData, staffName: string): Promise<Sale> {
    const newSale: Sale = {
      ...saleData,
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      staffName,
      paymentStatus: "completed",
    };

    if (USE_MOCK) {
      await this.simulateDelay();
      mockSales.push(newSale);
      return newSale;
    }

    const response = await fetch(`${this.baseUrl}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSale),
    });
    return await response.json();
  }

  async searchSales(params?: {
    query?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    sales: Sale[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (USE_MOCK) {
      await this.simulateDelay();

      let filteredSales = [...mockSales];

      // Apply simple query filter
      if (params?.query) {
        const query = params.query.toLowerCase();
        filteredSales = filteredSales.filter(
          (sale) =>
            sale.customerName?.toLowerCase().includes(query) ||
            sale.items.some(
              (item) =>
                item.itemName.toLowerCase().includes(query) ||
                item.sku.toLowerCase().includes(query)
            ) ||
            sale.id.toLowerCase().includes(query)
        );
      }

      // Sort by timestamp (newest first)
      filteredSales.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply pagination
      const total = filteredSales.length;
      const limit = params?.limit || 20;
      const page = params?.page || 1;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const paginatedSales = filteredSales.slice(
        startIndex,
        startIndex + limit
      );

      return {
        sales: paginatedSales,
        total,
        page,
        totalPages,
      };
    }

    return {
      sales: mockSales,
      total: mockSales.length,
      page: 1,
      totalPages: 1,
    };
  }

  // --- Authentication ---
  async loginWithGoogle(googleUser: GoogleUser): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return {
        success: true,
        user: {
          id: uuidv4(),
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          role: "editor",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        token: `mock_token_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleUser),
    });
    return await response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return {
        success: true,
        user: {
          id: uuidv4(),
          email: credentials.email,
          name: "Admin User",
          role: "admin",
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        },
        token: `mock_token_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return await response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return {
        success: true,
        user: {
          id: uuidv4(),
          email: data.email,
          name: data.name,
          role: "editor",
          createdAt: new Date().toISOString(),
        },
        token: `mock_token_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await response.json();
  }
}

export const apiService = new ApiService();
