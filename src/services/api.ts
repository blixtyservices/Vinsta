import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:3000/api'; // Android emulator → localhost
// For physical device: replace with your machine's local IP, e.g. 'http://192.168.1.100:3000/api'
// For production: 'https://api.vinsta.in/api'

const getToken = async () => AsyncStorage.getItem('token');

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data;
}

const get = (url: string) => request(url);
const post = (url: string, body: any) =>
  request(url, { method: 'POST', body: JSON.stringify(body) });
const patch = (url: string, body?: any) =>
  request(url, { method: 'PATCH', body: JSON.stringify(body) });

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  sendOtp: (phone: string) => post('/auth/send-otp', { phone, role: 'customer' }),
  verifyOtp: (phone: string, otp: string) => post('/auth/verify-otp', { phone, otp }),
  getMe: () => get('/auth/me'),
  updateProfile: (data: { name?: string; email?: string; profileImage?: string }) =>
    patch('/auth/update-profile', data),
  updateFcmToken: (fcmToken: string) => patch('/auth/fcm-token', { fcmToken }),
};

// ── Restaurants ───────────────────────────────────────────────────
export const restaurantAPI = {
  getAll: (params?: { lat?: number; lng?: number; category?: string; search?: string }) => {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return get(`/restaurants${q}`);
  },
  getFeatured: () => get('/restaurants/featured'),
  getById: (id: string) => get(`/restaurants/${id}`),
};

// ── Menu ──────────────────────────────────────────────────────────
export const menuAPI = {
  getMenu: (restaurantId: string) => get(`/menu/${restaurantId}`),
};

// ── Orders ────────────────────────────────────────────────────────
export const ordersAPI = {
  place: (body: {
    restaurantId: string;
    items: any[];
    deliveryAddress: any;
    paymentMethod: 'online' | 'wallet' | 'cod';
    promoCode?: string;
    specialInstructions?: string;
  }) => post('/orders', body),
  verifyPayment: (body: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => post('/orders/verify-payment', body),
  getAll: (params?: { status?: string; page?: number }) => {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return get(`/orders${q}`);
  },
  getById: (id: string) => get(`/orders/${id}`),
  cancel: (id: string, reason: string) => post(`/orders/${id}/cancel`, { reason }),
  rate: (id: string, body: { restaurantRating: number; deliveryRating?: number; comment?: string }) =>
    post(`/orders/${id}/rate`, body),
};

// ── Wallet ────────────────────────────────────────────────────────
export const walletAPI = {
  get: () => get('/wallet'),
  createTopup: (amount: number) => post('/wallet/topup-order', { amount }),
  verifyTopup: (body: {
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => post('/wallet/topup-verify', body),
  getTransactions: () => get('/wallet/transactions'),
};

// ── Subscriptions ─────────────────────────────────────────────────
export const subscriptionAPI = {
  getPlans: () => get('/subscriptions/plans'),
  create: (body: {
    restaurantId: string;
    planId: string;
    menuItems: string[];
    deliveryAddress: any;
    deliveryTime: string;
  }) => post('/subscriptions', body),
  getMine: () => get('/subscriptions'),
  cancel: (id: string) => patch(`/subscriptions/${id}/cancel`),
};
