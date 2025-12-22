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

const USE_MOCK = false;
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
  private baseUrl =
    (import.meta as any).env?.VITE_API_BASE_URL ||
    ((import.meta as any).env?.DEV
      ? "http://localhost:4000/upk"
      : "https://lkjnw31n3f.execute-api.ap-northeast-1.amazonaws.com/staging");

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
    if (USE_MOCK) {
      await this.simulateDelay();
      const newItem: Item = {
        ...itemData,
        id: uuidv4(),
        lastUpdated: new Date().toISOString(),
      };
      const nextKey = (
        Math.max(...Object.keys(mockItems).map(Number), -1) + 1
      ).toString();
      mockItems[nextKey] = newItem;
      return newItem;
    }

    const response = await fetch(`${this.baseUrl}/createItem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemData),
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
    if (USE_MOCK) {
      await this.simulateDelay();
      const newCustomer: Customer = {
        ...customerData,
        id: uuidv4(),
        totalPurchases: 0,
        visits: 0,
        createdAt: new Date().toISOString(),
      };
      mockCustomers.push(newCustomer);
      return newCustomer;
    }

    const response = await fetch(`${this.baseUrl}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData),
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
    if (USE_MOCK) {
      await this.simulateDelay();
      const newSale: Sale = {
        ...saleData,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        staffName,
        paymentStatus: "completed",
      };
      mockSales.push(newSale);
      return newSale;
    }

    const response = await fetch(`${this.baseUrl}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...saleData,
        staffName,
        paymentStatus: "completed",
      }),
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

    const queryParams = new URLSearchParams();
    if (params?.query) queryParams.append("query", params.query);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await fetch(`${this.baseUrl}/sales/search?${queryParams}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  }

  async updateCustomer(
    id: string,
    updates: Partial<Customer>
  ): Promise<Customer> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const index = mockCustomers.findIndex((customer) => customer.id === id);
      if (index === -1) throw new Error("Customer not found");
      mockCustomers[index] = {
        ...mockCustomers[index],
        ...updates,
      };
      return mockCustomers[index];
    }

    const response = await fetch(`${this.baseUrl}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return await response.json();
  }

  // --- Players ---
  async getPlayers(): Promise<Player[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return [
        {
          id: "player-001",
          name: "John Player",
          email: "john.player@email.com",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop",
          beybladeStats: {
            spinFinishes: 5,
            overFinishes: 3,
            burstFinishes: 2,
            extremeFinishes: 1,
          },
        },
        {
          id: "player-002",
          name: "Jane Player",
          email: "jane.player@email.com",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&auto=format&fit=crop",
          beybladeStats: {
            spinFinishes: 8,
            overFinishes: 4,
            burstFinishes: 3,
            extremeFinishes: 2,
          },
        },
      ];
    }

    const response = await fetch(`${this.baseUrl}/getPlayers`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return this.normalizeResponse<Player>(data);
  }

  // --- Tournaments ---
  async getTournaments(): Promise<Tournament[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return [
        {
          _id: "tournament-001",
          name: "Beyblade X Championship",
          date: new Date("2024-01-15T10:00:00Z"),
          game: "Beyblade X",
          season: 1,
          status: "Completed",
          participants: ["player-001", "player-002"],
          maxPlayers: 20,
          standings: [
            {
              userId: "player-001",
              rank: 1,
              score: "95",
              notes: "Champion",
            },
            {
              userId: "player-002",
              rank: 2,
              score: "87",
              notes: "Runner-up",
            },
          ],
        },
      ];
    }

    const response = await fetch(`${this.baseUrl}/getGasgasan`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return this.normalizeResponse<Tournament>(data);
  }

  async createTournament(
    tournamentData: TournamentFormData
  ): Promise<Tournament> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const newTournament: Tournament = {
        ...tournamentData,
        _id: uuidv4(),
      };
      return newTournament;
    }

    const response = await fetch(`${this.baseUrl}/gasgasanCreate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tournamentData),
    });
    return await response.json();
  }

  async updateTournament(
    id: string,
    updates: Partial<Tournament>
  ): Promise<Tournament> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const updatedTournament: Tournament = {
        _id: id,
        name: updates.name || "Updated Tournament",
        date: updates.date || new Date(),
        game: updates.game || "Beyblade X",
        season: updates.season || 1,
        status: updates.status || "Scheduled",
        participants: updates.participants || [],
        maxPlayers: updates.maxPlayers || 20,
        standings: updates.standings || [],
      };
      return updatedTournament;
    }

    const response = await fetch(`${this.baseUrl}/tournaments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return await response.json();
  }

  async createPlayer(playerData: Partial<Player>): Promise<Player> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const newPlayer: Player = {
        id: uuidv4(),
        name: playerData.name || "New Player",
        email: playerData.email || "player@email.com",
        avatar:
          playerData.avatar ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop",
        beybladeStats: playerData.beybladeStats || {
          spinFinishes: 0,
          overFinishes: 0,
          burstFinishes: 0,
          extremeFinishes: 0,
        },
      };
      return newPlayer;
    }

    const response = await fetch(`${this.baseUrl}/createPlayer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const updatedPlayer: Player = {
        id: id,
        name: updates.name || "Updated Player",
        email: updates.email || "updated@email.com",
        avatar:
          updates.avatar ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop",
        beybladeStats: updates.beybladeStats || {
          spinFinishes: 0,
          overFinishes: 0,
          burstFinishes: 0,
          extremeFinishes: 0,
        },
      };
      return updatedPlayer;
    }

    const response = await fetch(`${this.baseUrl}/updatePlayer/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });
    return await response.json();
  }

  async deleteTournament(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return true;
    }

    const response = await fetch(`${this.baseUrl}/tournaments/${id}`, {
      method: "DELETE",
    });
    return response.ok;
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
        accessToken: `mock_token_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(googleUser),
    });
    const data = await response.json();

    // Transform API response to match frontend AuthUser interface
    if (data.user) {
      // Handle case where API returns isAdmin boolean instead of role string
      if (data.user.isAdmin !== undefined) {
        data.user.role = data.user.isAdmin ? "admin" : "editor";
        delete data.user.isAdmin;
      }
    }

    return data;
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
        accessToken: `mock_token_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();

    // Transform API response to match frontend AuthUser interface
    if (data.user) {
      // Handle case where API returns isAdmin boolean instead of role string
      if (data.user.isAdmin !== undefined) {
        data.user.role = data.user.isAdmin ? "admin" : "editor";
        delete data.user.isAdmin;
      }
    }

    return data;
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
        accessToken: `mock_token_${Date.now()}`,
      };
    }

    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const responseData = await response.json();

    // Transform API response to match frontend AuthUser interface
    if (responseData.user) {
      // Handle case where API returns isAdmin boolean instead of role string
      if (responseData.user.isAdmin !== undefined) {
        responseData.user.role = responseData.user.isAdmin ? "admin" : "editor";
        delete responseData.user.isAdmin;
      }
    }

    return responseData;
  }

  // --- Token Validation ---
  async validateToken(token: string): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      // Mock validation - in real implementation, this would verify with your backend
      try {
        const response = await fetch(`${this.baseUrl}/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        return response.ok;
      } catch (error) {
        console.error("Token validation error:", error);
        return false;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  // --- Newsletter ---
  async sendNewsletter(
    subject: string,
    message: string,
    featuredItems: string[]
  ): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK) {
      await this.simulateDelay();
      console.log("Sending newsletter:", { subject, message, featuredItems });
      return {
        success: true,
        message: "Newsletter sent successfully to all subscribers",
      };
    }

    const response = await fetch(`${this.baseUrl}/newsletter/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        featuredItems,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send newsletter");
    }

    return await response.json();
  }

  // --- POS Reports ---
  async getPosReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<PosReport> {
    if (USE_MOCK) {
      await this.simulateDelay();
      // Mock POS report data
      const mockReport: PosReport = {
        totalSales: 15678.5,
        totalTransactions: 124,
        averageSale: 126.44,
        salesByCategory: [
          { category: "RC Vehicles", amount: 8934.25, percentage: 57 },
          { category: "Drones", amount: 3921.75, percentage: 25 },
          { category: "Kits", amount: 2356.5, percentage: 15 },
          { category: "Supplies", amount: 466.0, percentage: 3 },
        ],
        paymentMethods: [
          { method: "cash", amount: 8234.25, percentage: 52.5 },
          { method: "card", amount: 5447.75, percentage: 34.7 },
          { method: "digital", amount: 1996.5, percentage: 12.8 },
        ],
        topSellingItems: [
          {
            itemId: "101",
            itemName: "Thunderbolt RC Car 4WD",
            quantity: 15,
            revenue: 4499.85,
          },
          {
            itemId: "102",
            itemName: "Drone Pro X",
            quantity: 8,
            revenue: 2399.92,
          },
          {
            itemId: "103",
            itemName: "RC Car Kit",
            quantity: 12,
            revenue: 1199.88,
          },
        ],
        paymentBreakdown: {
          cash: 8234.25,
          card: 5447.75,
          digital: 1996.5,
        },
        salesByHour: [
          { hour: 9, sales: 5, revenue: 1245.5 },
          { hour: 10, sales: 8, revenue: 2134.25 },
          { hour: 11, sales: 7, revenue: 1876.75 },
          { hour: 12, sales: 9, revenue: 2342.0 },
          { hour: 13, sales: 8, revenue: 1989.25 },
          { hour: 14, sales: 6, revenue: 1654.5 },
          { hour: 15, sales: 5, revenue: 1436.25 },
        ],
        hourlySales: [
          { hour: 9, revenue: 1245.5 },
          { hour: 10, revenue: 2134.25 },
          { hour: 11, revenue: 1876.75 },
          { hour: 12, revenue: 2342.0 },
          { hour: 13, revenue: 1989.25 },
          { hour: 14, revenue: 1654.5 },
          { hour: 15, revenue: 1436.25 },
        ],
        period: {
          start: params?.startDate || new Date().toISOString(),
          end: params?.endDate || new Date().toISOString(),
        },
      };
      return mockReport;
    }

    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(`${this.baseUrl}/pos/report?${queryParams}`);
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  }
}

export const apiService = new ApiService();
