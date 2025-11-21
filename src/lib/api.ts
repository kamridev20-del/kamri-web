const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: {
    name: string;
  };
  supplier?: {
    name: string;
  };
  status: string;
  badge?: string;
  stock: number;
  sales: number;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // ✅ Méthode pour mettre à jour le token
  setToken(token: string | null) {
    this.token = token;
  }

  // ✅ Méthode pour récupérer le token actuel
  getToken(): string | null {
    return this.token;
  }

  // Authentification
  async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.access_token);
        }
        return { data };
      } else {
        return { error: data.message || 'Erreur de connexion' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  async register(email: string, name: string, password: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, role: 'user' }),
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.access_token;
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', data.access_token);
        }
        return { data };
      } else {
        return { error: data.message || 'Erreur d\'inscription' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  logout() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  // Méthodes pour les utilisateurs
  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { data: data.data || data };
      } else {
        return { error: data.message || 'Erreur lors de la récupération du profil' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  async updateUserProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { data: data.data || data };
      } else {
        return { error: data.message || 'Erreur lors de la mise à jour' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }


  private async fetchPublic(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    console.log('🌐 [API] fetchPublic appelé', { endpoint });
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      console.log('📡 [API] Réponse publique reçue', { status: response.status, data });

      if (response.ok) {
        return { data };
      } else {
        console.log('❌ [API] Erreur API publique', { status: response.status, error: data.message });
        // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
        const errorMessage = typeof data.message === 'string' 
          ? data.message 
          : (data.message as any)?.message || data.error || 'Erreur API';
        return { error: errorMessage };
      }
    } catch (error) {
      console.log('❌ [API] Erreur réseau publique', error);
      return { error: 'Erreur réseau' };
    }
  }

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
    // ✅ Vérifier que l'endpoint n'utilise pas l'ancien format avec userId
    if (endpoint.includes('/cart/') && endpoint.match(/\/cart\/[a-z0-9]{20,}/)) {
      console.warn('⚠️ [API] Détection d\'un appel avec l\'ancien format userId dans l\'URL:', endpoint);
      console.warn('⚠️ [API] Stack trace:', new Error().stack);
    }
    
    console.log('🔑 [API] fetchWithAuth appelé', { endpoint, hasToken: !!this.token });
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();
      console.log('📡 [API] Réponse reçue', { status: response.status, data });

      if (response.ok) {
        return { data };
      } else {
        console.log('❌ [API] Erreur API', { status: response.status, error: data.message });
        // S'assurer que l'erreur est toujours une string (solution Stack Overflow)
        const errorMessage = typeof data.message === 'string' 
          ? data.message 
          : (data.message as any)?.message || data.error || 'Erreur API';
        return { error: errorMessage };
      }
    } catch (error) {
      console.log('❌ [API] Erreur réseau', error);
      return { error: 'Erreur réseau' };
    }
  }

  // Produits
  async getProducts(): Promise<ApiResponse<Product[]>> {
    return this.fetchPublic('/products');
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.fetchPublic(`/products/${id}`);
  }

  // Catégories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.fetchPublic('/categories');
  }

  async createCategory(categoryData: { name: string; description?: string; icon?: string; color?: string }): Promise<ApiResponse<Category>> {
    return this.fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id: string, categoryData: { name?: string; description?: string; icon?: string; color?: string }): Promise<ApiResponse<Category>> {
    return this.fetchWithAuth(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Cart methods
  async getCart(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/cart');
  }

  async addToCart(productId: string, quantity: number = 1, variantId?: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, variantId }),
    });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return this.fetchWithAuth('/cart', {
      method: 'DELETE',
    });
  }

  // Geo location methods
  async detectCountry(ip?: string): Promise<ApiResponse<{ countryCode: string; countryName: string; source: string; ip?: string }>> {
    const url = ip ? `/geo/detect-country?ip=${ip}` : '/geo/detect-country';
    return this.fetchPublic(url);
  }

  async setCountry(countryCode: string): Promise<ApiResponse<{ success: boolean; countryCode: string; countryName: string }>> {
    return this.fetchPublic('/geo/set-country', {
      method: 'POST',
      body: JSON.stringify({ countryCode }),
    });
  }

  async getCountryName(code: string): Promise<ApiResponse<{ countryCode: string; countryName: string }>> {
    return this.fetchPublic(`/geo/country-name?code=${code}`);
  }

  // Shipping validation methods
  async checkProductShipping(
    productId: string,
    countryCode: string,
    variantId?: string
  ): Promise<ApiResponse<{
    shippable: boolean;
    availableMethods?: Array<{
      logisticName: string;
      shippingTime: string;
      freight: number;
      currency: string;
    }>;
    error?: string;
    originCountryCode?: string;
  }>> {
    const url = variantId
      ? `/products/${productId}/check-shipping?countryCode=${countryCode}&variantId=${variantId}`
      : `/products/${productId}/check-shipping?countryCode=${countryCode}`;
    return this.fetchPublic(url);
  }

  // CJ Dropshipping reviews
  async getCJProductReviews(cjProductId: string): Promise<ApiResponse<{
    reviews: Array<{
      commentId: number | string;
      pid: string;
      comment: string;
      score: string;
      commentUser: string;
      commentUrls?: string[];
      countryCode?: string;
      flagIconUrl?: string;
      commentDate: string;
      id?: string;
      rating?: number;
      userName?: string;
      images?: string[];
      createdAt?: string;
      verified?: boolean;
    }>;
    total: number;
  }>> {
    return this.fetchPublic(`/cj-dropshipping/products/${cjProductId}/reviews`);
  }

  // Cart grouping methods
  async getGroupedCart(countryCode: string): Promise<ApiResponse<Array<{
    originCountryCode: string;
    originCountryName: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      variantId?: string;
      cjVariantId?: string;
      image?: string;
    }>;
    shippingOptions?: Array<{
      logisticName: string;
      shippingTime: string;
      freight: number;
      currency: string;
    }>;
    selectedShippingOption?: {
      logisticName: string;
      shippingTime: string;
      freight: number;
      currency: string;
    };
    subtotal: number;
    shippingCost: number;
    total: number;
  }>>> {
    return this.fetchWithAuth(`/cart/grouped?countryCode=${countryCode}`);
  }

  // Wishlist methods
  async getWishlist(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist(): Promise<ApiResponse<void>> {
    return this.fetchWithAuth('/wishlist', {
      method: 'DELETE',
    });
  }

  // Address methods
  async getAddresses(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/addresses');
  }

  async createAddress(addressData: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<any>> {
    // L'ID de l'utilisateur sera récupéré automatiquement par le backend via le token JWT
    return this.fetchWithAuth('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateAddress(id: string, addressData: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return this.fetchWithAuth(`/addresses/${id}`, {
      method: 'DELETE',
    });
  }

  async setDefaultAddress(id: string): Promise<ApiResponse<any>> {
    return this.fetchWithAuth(`/addresses/${id}/default`, {
      method: 'POST',
    });
  }

  // User Settings methods
  async getUserSettings(): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/user-settings');
  }

  async updateUserSettings(settingsData: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
    privacy?: {
      profileVisible?: boolean;
      orderHistory?: boolean;
      dataSharing?: boolean;
    };
    preferences?: {
      theme?: string;
      language?: string;
      currency?: string;
    };
  }): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/user-settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  async deleteUserAccount(): Promise<ApiResponse<void>> {
    return this.fetchWithAuth('/user-settings/account', {
      method: 'DELETE',
    });
  }


  // Commandes
  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.fetchWithAuth('/orders');
  }

  async createOrder(orderData: any): Promise<ApiResponse> {
    return this.fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Settings methods
  async getSettings(): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/settings');
  }

  async updateSettings(settingsData: any): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Company info (public)
  async getCompanyInfo(): Promise<ApiResponse<any>> {
    return this.fetchPublic('/settings/company-info');
  }

  // Contact form
  async sendContactMessage(formData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    orderNumber?: string;
    attachments?: File[];
  }): Promise<ApiResponse<{ ticketNumber?: string; message: string }>> {
    // Créer FormData pour supporter les fichiers
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    if (formData.phone) formDataToSend.append('phone', formData.phone);
    formDataToSend.append('subject', formData.subject);
    formDataToSend.append('message', formData.message);
    if (formData.orderNumber) formDataToSend.append('orderNumber', formData.orderNumber);
    
    if (formData.attachments && formData.attachments.length > 0) {
      formData.attachments.forEach((file, index) => {
        formDataToSend.append(`attachments`, file);
      });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        body: formDataToSend,
        // Ne pas mettre Content-Type, le navigateur le fera automatiquement avec FormData
      });

      const data = await response.json();

      if (response.ok) {
        return { data };
      } else {
        return { error: data.message || 'Erreur lors de l\'envoi du message' };
      }
    } catch (error) {
      return { error: 'Erreur réseau' };
    }
  }

  // ✅ Calculer les frais de livraison CJ
  async calculateCJFreight(params: {
    startCountryCode: string;
    endCountryCode: string;
    zip?: string;
    taxId?: string;
    houseNumber?: string;
    iossNumber?: string;
    products: Array<{
      quantity: number;
      vid: string;
    }>;
  }): Promise<ApiResponse<any>> {
    return this.fetchWithAuth('/cj-dropshipping/logistics/calculate-freight', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // ✅ Créer un PaymentIntent Stripe
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<ApiResponse<{ clientSecret: string; paymentIntentId: string }>> {
    return this.fetchWithAuth('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  // ✅ Créer un remboursement
  async createRefund(paymentIntentId: string, amount?: number, reason?: string): Promise<ApiResponse<{ refundId: string; amount: number; status: string }>> {
    return this.fetchWithAuth('/payments/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, amount, reason }),
    });
  }

  // ✅ Récupérer les remboursements d'un PaymentIntent
  async getRefunds(paymentIntentId: string): Promise<ApiResponse<Array<{ id: string; amount: number; status: string; reason: string | null; createdAt: string }>>> {
    return this.fetchWithAuth(`/payments/refunds/${paymentIntentId}`);
  }

  // ✅ Annuler un remboursement
  async cancelRefund(refundId: string): Promise<ApiResponse<{ refundId: string; status: string; message: string }>> {
    return this.fetchWithAuth(`/payments/refund/${refundId}/cancel`, {
      method: 'POST',
    });
  }
}

// Instance globale
export const apiClient = new ApiClient();
