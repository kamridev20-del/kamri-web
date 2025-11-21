import { CartItem, Order, Product } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>('/api/products')
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`)
  }

  // Cart
  async getCart(userId: string): Promise<CartItem[]> {
    return this.request<CartItem[]>(`/api/cart/${userId}`)
  }

  async addToCart(userId: string, productId: string, quantity: number = 1): Promise<CartItem> {
    return this.request<CartItem>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity }),
    })
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    return this.request<void>(`/api/cart/${userId}/${itemId}`, {
      method: 'DELETE',
    })
  }

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    return this.request<Order[]>(`/api/orders/${userId}`)
  }

  async createOrder(userId: string, items: CartItem[]): Promise<Order> {
    return this.request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ userId, items }),
    })
  }

  // Checkout
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{ clientSecret: string }> {
    return this.request<{ clientSecret: string }>('/api/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    })
  }
}

