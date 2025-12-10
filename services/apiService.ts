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
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { API_CONFIG } from "./googleOAuth";

const USE_MOCK = API_CONFIG.baseUrl.includes('localhost') || API_CONFIG.baseUrl.includes('staging');
const MOCK_DELAY = 600; // ms

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
      "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-25T10:00:00Z",
  },
  "1": {
    id: "102",
    name: "Eagle Eye Drone Pro",
    sku: "DR-PRO-002",
    category: "Drones",
    price: 899.5,
    stock: 5,
    description: "4K camera drone with GPS stabilization.",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-26T14:30:00Z",
  },
  "2": {
    id: "103",
    name: "MTG: Commander Legends Box",
    sku: "MTG-CML-001",
    category: "Magic the Gathering",
    price: 124.99,
    stock: 45,
    description: "Factory sealed Commander Legends draft booster box.",
    status: "active",
    imageUrl:
      "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-27T09:15:00Z",
  },
};

let mockPlayers: Player[] = [
  {
    id: "692a062ccd45f83fab8055a5",
    name: "Ninong",
    email: "ninong@upkeep.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ninong",
    beybladeStats: {
      spinFinishes: 7,
      overFinishes: 4,
      burstFinishes: 0,
      extremeFinishes: 1,
    },
  },
  {
    id: "702b173dde56g94gac9166b67fab2b6cdef193137baaebca43e3082c075f7914",
    name: "Alice",
    email: "alice@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    beybladeStats: {
      spinFinishes: 10,
      overFinishes: 5,
      burstFinishes: 2,
      extremeFinishes: 3,
    },
  },
  {
    id: "712c284eff67h05hbd0277c78gb3c7ddef2042248cbbeddb54f4193d186g8025",
    name: "Bob",
    email: "bob@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    beybladeStats: {
      spinFinishes: 3,
      overFinishes: 8,
      burstFinishes: 1,
      extremeFinishes: 0,
    },
  },
];

let mockUsers: User[] = [
  {
    id: "admin-1",
    email: "admin@upkeep.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "editor-1",
    email: "editor@upkeep.com",
    name: "Editor User",
    role: "editor",
  },
];

let mockTournaments: Tournament[] = [
  {
    _id: "692a0693cd45f83fab8055ba",
    name: "Ranked Game November 29, 2025",
    date: new Date("2025-11-28T13:48:00.000Z"),
    game: "Beyblade X",
    season: 1,
    status: "Completed",
    participants: [
      "692a062ccd45f83fab8055af",
      "692a062ccd45f83fab8055b0",
      "692a062ccd45f83fab8055b1",
      "692a062ccd45f83fab8055b2",
      "692a062ccd45f83fab8055b3",
      "692a062ccd45f83fab8055b4",
      "692a062ccd45f83fab8055b5",
      "692a062ccd45f83fab8055b6",
      "692a062ccd45f83fab8055b7",
      "692a062ccd45f83fab8055b8",
      "692a062ccd45f83fab8055a5",
      "692a062ccd45f83fab8055a6",
      "692a062ccd45f83fab8055a7",
      "692a062ccd45f83fab8055a8",
      "692a062ccd45f83fab8055a9",
      "692a062ccd45f83fab8055aa",
      "692a062ccd45f83fab8055ab",
      "692a062ccd45f83fab8055ac",
      "692a062ccd45f83fab8055ad",
      "692a062ccd45f83fab8055ae",
    ],
    maxPlayers: 20,
    standings: [
      {
        userId: "692a062ccd45f83fab8055a5",
        rank: 1,
        score: "4-0-0",
        notes: "Undefeated",
      },
      {
        userId: "692a062ccd45f83fab8055a6",
        rank: 2,
        score: "3-1-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055a7",
        rank: 3,
        score: "3-1-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055a8",
        rank: 4,
        score: "3-1-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055a9",
        rank: 5,
        score: "3-1-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055aa",
        rank: 6,
        score: "3-1-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055ab",
        rank: 7,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055ac",
        rank: 8,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055ad",
        rank: 9,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055ae",
        rank: 10,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055af",
        rank: 11,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b0",
        rank: 12,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b1",
        rank: 13,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b2",
        rank: 14,
        score: "2-2-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b3",
        rank: 15,
        score: "1-3-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b4",
        rank: 16,
        score: "1-3-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b5",
        rank: 17,
        score: "1-3-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b6",
        rank: 18,
        score: "1-3-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b7",
        rank: 19,
        score: "1-3-0",
        notes: "",
      },
      {
        userId: "692a062ccd45f83fab8055b8",
        rank: 20,
        score: "0-4-0",
        notes: "",
      },
    ],
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

    try {
      const response = await fetch(`${this.baseUrl}/getItems`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      return this.normalizeResponse<Item>(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      throw error;
    }
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

  async sendNewsletter(
    subject: string,
    content: string,
    itemIds: string[]
  ): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      console.log(`Newsletter sent: ${subject}, items: ${itemIds.join(", ")}`);
      return true;
    }
    // Real API implementation here
    return true;
  }

  // --- Players ---
  async getPlayers(): Promise<Player[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return mockPlayers;
    }

    const response = await fetch(`${this.baseUrl}/getPlayers`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    return this.normalizeResponse<Player>(data);
  }

  async createPlayer(playerData: Partial<Player>): Promise<Player> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const newPlayer: Player = {
        id: uuidv4(),
        name: playerData.name || "",
        email: playerData.email || "",
        avatar: playerData.avatar || "",
        beybladeStats: playerData.beybladeStats || {
          spinFinishes: 0,
          overFinishes: 0,
          burstFinishes: 0,
          extremeFinishes: 0,
        },
      };
      mockPlayers.push(newPlayer);
      return newPlayer;
    }

    const response = await fetch(`${this.baseUrl}/createPlayer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Network response was not ok: ${response.status} ${errorText}`
      );
    }

    const result = await response.json();
    console.log("Create player API response:", result);
    return result;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const index = mockPlayers.findIndex((p) => p.id === id);
      if (index === -1) throw new Error("Player not found");
      const updatedPlayer = {
        ...mockPlayers[index],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      mockPlayers[index] = updatedPlayer;
      return updatedPlayer;
    }

    const url = `${this.baseUrl}/updatePlayer/${id}`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      console.log("API response:", result);

      // Ensure the response always has an ID
      return {
        ...result,
        id: result.id || id,
      };
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  // --- Tournaments ---
  async getTournaments(): Promise<Tournament[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      return mockTournaments;
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
      mockTournaments.push(newTournament);
      return newTournament;
    }

    const response = await fetch(`${this.baseUrl}/gasgasanCreate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tournamentData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Network response was not ok: ${response.status} ${errorText}`
      );
    }

    return await response.json();
  }

  async updateTournament(
    id: string,
    updates: Partial<Tournament>
  ): Promise<Tournament> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const index = mockTournaments.findIndex((t) => t._id === id);
      if (index === -1) throw new Error("Tournament not found");
      const updatedTournament = {
        ...mockTournaments[index],
        ...updates,
      };
      mockTournaments[index] = updatedTournament;
      return updatedTournament;
    }

    const response = await fetch(`${this.baseUrl}/updateTournament/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Network response was not ok: ${response.status} ${errorText}`
      );
    }

    return await response.json();
  }

  async deleteTournament(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const index = mockTournaments.findIndex((t) => t._id === id);
      if (index === -1) return false;
      mockTournaments.splice(index, 1);
      return true;
    }

    const response = await fetch(`${this.baseUrl}/deleteTournament/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  }

  // --- Authentication ---
  async loginWithGoogle(googleUser: GoogleUser): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.simulateDelay();

      // Check if user exists in our mock database
      let existingUser = mockUsers.find((u) => u.email === googleUser.email);

      if (existingUser) {
        // User exists, return login success
        return {
          success: true,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
            avatar: existingUser.avatar,
            role: existingUser.role,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          token: `mock_token_${Date.now()}`,
        };
      } else {
        // User doesn't exist, auto-register
        const newUser: AuthUser = {
          id: uuidv4(),
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          role: "editor", // Default role for new users
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };

        mockUsers.push({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        });

        return {
          success: true,
          user: newUser,
          token: `mock_token_${Date.now()}`,
        };
      }
    }

    // Real API implementation
    try {
      const response = await fetch(`${this.baseUrl}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleUser),
      });

      if (!response.ok) {
        throw new Error("Google authentication failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Google login error:", error);
      return {
        success: false,
        message: "Authentication failed",
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.simulateDelay();

      const user = mockUsers.find(
        (u) =>
          u.email === credentials.email &&
          // In a real app, we'd check hashed password
          credentials.password === "password123"
      );

      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          },
          token: `mock_token_${Date.now()}`,
        };
      } else {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }
    }

    // Real API implementation
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Login failed",
        };
      }

      return result;
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.simulateDelay();

      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === data.email);
      if (existingUser) {
        return {
          success: false,
          message: "User with this email already exists",
        };
      }

      // Create new user
      const newUser: AuthUser = {
        id: uuidv4(),
        email: data.email,
        name: data.name,
        role: "editor",
        createdAt: new Date().toISOString(),
      };

      mockUsers.push({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });

      return {
        success: true,
        user: newUser,
        token: `mock_token_${Date.now()}`,
      };
    }

    // Real API implementation
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Registration failed",
        };
      }

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}

export const apiService = new ApiService();
