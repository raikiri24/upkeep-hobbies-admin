import { Item, ItemFormData, ApiResponse } from '../types';

const USE_MOCK = true;
const MOCK_DELAY = 600; // ms

// Initial mock data
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
    imageUrl: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-25T10:00:00Z"
  },
  "1": {
    id: "102",
    name: "Eagle Eye Drone Pro",
    sku: "DR-PRO-002",
    category: "Drones",
    price: 899.50,
    stock: 5,
    description: "4K camera drone with GPS stabilization.",
    status: "active",
    imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-26T14:30:00Z"
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
    imageUrl: "https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-27T09:15:00Z"
  },
  "3": {
    id: "104",
    name: "Gundam RX-78-2 Ver. Ka",
    sku: "MD-GUN-004",
    category: "Model Kits",
    price: 65.00,
    stock: 0,
    description: "Master Grade 1/100 scale model kit.",
    status: "archived",
    imageUrl: "https://images.unsplash.com/photo-1614713568397-b30b779d041c?q=80&w=200&auto=format&fit=crop",
    lastUpdated: "2023-10-20T11:00:00Z"
  },
  "4": {
    id: "105",
    name: "Beyblade Burst Surge",
    sku: "BEY-SUR-001",
    category: "Beyblade",
    price: 15.99,
    stock: 30,
    description: "Speedstorm spinning top starter pack.",
    status: "active",
    lastUpdated: "2023-10-28T11:00:00Z"
  },
  "5": {
    id: "106",
    name: "Unmatched: Battle of Legends",
    sku: "UNM-VOL1-001",
    category: "Unmatched",
    price: 39.99,
    stock: 8,
    description: "Volume 1 featuring Medusa, Sinbad, Alice, and King Arthur.",
    status: "active",
    lastUpdated: "2023-10-28T12:00:00Z"
  }
};

class ApiService {
  private baseUrl = "https://api.upkeephobbies.com/v1"; // Fictional URL

  /**
   * Helper to normalize the weird numeric-key object response into a clean Array.
   * Input: { "0": { id: 1... }, "1": { id: 2... } }
   * Output: [ { id: 1... }, { id: 2... } ]
   */
  private normalizeResponse<T>(data: ApiResponse<T> | T[] | any): T[] {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      return Object.values(data);
    }
    return [];
  }

  private async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  }

  async getItems(): Promise<Item[]> {
    if (USE_MOCK) {
      await this.simulateDelay();
      // Return the raw object format to test normalization
      return this.normalizeResponse(mockItems);
    }

    try {
      const response = await fetch(`${this.baseUrl}/getItems`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      return this.normalizeResponse(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      throw error;
    }
  }

  async getOneItem(id: string): Promise<Item | null> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const items = Object.values(mockItems);
      return items.find(i => i.id === id) || null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/getOneItem?id=${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch item ${id}:`, error);
      throw error;
    }
  }

  async createItem(itemData: ItemFormData): Promise<Item> {
    const newItem: Item = {
      ...itemData,
      id: Math.random().toString(36).substr(2, 9),
      lastUpdated: new Date().toISOString()
    };

    if (USE_MOCK) {
      await this.simulateDelay();
      // Find next numeric key
      const keys = Object.keys(mockItems).map(Number);
      const nextKey = (Math.max(...keys, -1) + 1).toString();
      mockItems = { ...mockItems, [nextKey]: newItem };
      return newItem;
    }

    try {
      const response = await fetch(`${this.baseUrl}/createItems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      const data = await response.json();
      // Assuming create returns the created item or ID
      return data;
    } catch (error) {
      console.error("Failed to create item:", error);
      throw error;
    }
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const entry = Object.entries(mockItems).find(([_, val]) => val.id === id);
      if (!entry) throw new Error('Item not found');
      
      const [key, currentItem] = entry;
      const updatedItem = { ...currentItem, ...updates, lastUpdated: new Date().toISOString() };
      mockItems = { ...mockItems, [key]: updatedItem };
      return updatedItem;
    }

    try {
      const response = await fetch(`${this.baseUrl}/updateItem`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to update item:", error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      const entry = Object.entries(mockItems).find(([_, val]) => val.id === id);
      if (entry) {
        const [key] = entry;
        const { [key]: deleted, ...rest } = mockItems;
        mockItems = rest;
        return true;
      }
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/deleteItems`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return response.ok;
    } catch (error) {
      console.error("Failed to delete item:", error);
      throw error;
    }
  }

  async sendNewsletter(subject: string, content: string, itemIds: string[]): Promise<boolean> {
    if (USE_MOCK) {
      await this.simulateDelay();
      console.log(`Sending newsletter: ${subject} with ${itemIds.length} items.`);
      return true;
    }
    
    // Mock implementation for real API call
    return true;
  }
}

export const apiService = new ApiService();