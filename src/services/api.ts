// API service for frontend to communicate with backend
interface RequestOptions extends Omit<RequestInit, 'body'> {
  headers?: Record<string, string>;
  body?: any;
}

class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  async request(endpoint: string, options: RequestOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async getProfile() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: Record<string, any>) {
    return this.request('/auth/me', {
      method: 'PUT',
      body: profileData,
    });
  }

  // Groups endpoints
  async getGroups() {
    return this.request('/groups');
  }

  async getGroup(groupId: string) {
    return this.request(`/groups/${groupId}`);
  }

  async createGroup(groupData: Record<string, any>) {
    return this.request('/groups', {
      method: 'POST',
      body: groupData,
    });
  }

  async updateGroup(groupId: string, groupData: Record<string, any>) {
    return this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: groupData,
    });
  }

  async deleteGroup(groupId: string) {
    return this.request(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  }

  async joinGroup(inviteCode: string) {
    return this.request(`/groups/join/${inviteCode}`, {
      method: 'POST',
    });
  }

  async leaveGroup(groupId: string) {
    return this.request(`/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  // Products endpoints
  async getGroupProducts(groupId: string) {
    return this.request(`/products/group/${groupId}`);
  }

  async getProduct(productId: string) {
    return this.request(`/products/${productId}`);
  }

  async createProduct(productData: Record<string, any>) {
    return this.request('/products', {
      method: 'POST',
      body: productData,
    });
  }

  async updateProduct(productId: string, productData: Record<string, any>) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      body: productData,
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async toggleProductPurchased(productId: string) {
    return this.request(`/products/${productId}/toggle-purchased`, {
      method: 'PATCH',
    });
  }

  async getProductCategories(groupId: string) {
    return this.request(`/products/group/${groupId}/categories`);
  }

  // Payments endpoints
  async getGroupPayments(groupId: string) {
    return this.request(`/payments/group/${groupId}`);
  }

  async createPayment(paymentData: Record<string, any>) {
    return this.request('/payments', {
      method: 'POST',
      body: paymentData,
    });
  }

  async updatePaymentStatus(paymentId: string, status: string) {
    return this.request(`/payments/${paymentId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async deletePayment(paymentId: string) {
    return this.request(`/payments/${paymentId}`, {
      method: 'DELETE',
    });
  }

  async getPaymentSummary(groupId: string) {
    return this.request(`/payments/group/${groupId}/summary`);
  }

  // Notifications endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/mark-all-read', {
      method: 'PATCH',
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
