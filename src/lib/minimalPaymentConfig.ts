// Minimal storage version of payment config for low disk space systems
export const MINIMAL_PAYMENT_CONFIG = {
  // Use minimal storage
  USE_MOCK_PAYMENTS: true,
  STORAGE_MODE: 'memory', // Don't persist to localStorage
  
  RAZORPAY: {
    KEY_ID: 'minimal_mode',
    CURRENCY: 'INR',
    COMPANY_NAME: 'Grocery App',
  },
  
  UI: {
    THEME_COLOR: '#3b82f6',
    SHOW_DEMO_BADGES: true,
    // Minimal UI to save memory
    ENABLE_ANIMATIONS: false,
    CACHE_IMAGES: false,
  },
} as const;

// In-memory storage instead of localStorage for low disk space
class MemoryStorage {
  private data: Record<string, any> = {};

  setItem(key: string, value: string) {
    this.data[key] = value;
  }

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  removeItem(key: string) {
    delete this.data[key];
  }

  clear() {
    this.data = {};
  }
}

// Use memory storage when disk space is low
export const storage = typeof window !== 'undefined' && window.localStorage ? 
  window.localStorage : new MemoryStorage();
