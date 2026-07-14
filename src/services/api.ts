/**
 * Mock API layer for UI-only demo.
 * Same exports as the former network client — all methods resolve locally.
 */

import {
  MOCK_USER_PROFILE,
  MOCK_RESTAURANTS,
  MOCK_FOOD_ITEMS,
  MOCK_ORDERS,
  MOCK_WALLETS,
  MOCK_TRANSACTIONS,
  MOCK_SUBSCRIPTIONS,
  MOCK_PLANS,
} from '../utils/mockData';

const delay = <T,>(data: T, ms = 300): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), ms));

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  sendOtp: (_phone: string) => delay({ message: 'OTP sent', success: true }),

  verifyOtp: (phone: string, otp: string) => {
    // Demo: any 6-digit OTP works
    if (!otp || otp.length < 6) {
      return Promise.reject(new Error('Invalid OTP'));
    }
    const isNewUser = phone.endsWith('0000');
    return delay({
      token: 'demo-token',
      user: { ...MOCK_USER_PROFILE, phone },
      isNewUser,
    });
  },

  getMe: () => delay({ user: { ...MOCK_USER_PROFILE } }),

  updateProfile: (data: { name?: string; email?: string; profileImage?: string }) =>
    delay({
      user: { ...MOCK_USER_PROFILE, ...data },
      message: 'Profile updated',
    }),

  updateFcmToken: (_fcmToken: string) => delay({ message: 'ok' }),
};

// ── Restaurants ───────────────────────────────────────────────────
export const restaurantAPI = {
  getAll: (_params?: {
    lat?: number;
    lng?: number;
    category?: string;
    search?: string;
  }) => delay({ restaurants: MOCK_RESTAURANTS }),

  getFeatured: () =>
    delay({ restaurants: MOCK_RESTAURANTS.slice(0, 4) }),

  getById: (id: string) => {
    const restaurant =
      MOCK_RESTAURANTS.find(r => r._id === id) || MOCK_RESTAURANTS[0];
    return delay({ restaurant });
  },
};

// ── Menu ──────────────────────────────────────────────────────────
export const menuAPI = {
  getMenu: (restaurantId: string) => {
    const menu = MOCK_FOOD_ITEMS.filter(
      m => m.restaurantId === restaurantId,
    );
    // If no items for this id, return a representative mix
    return delay({
      menu: menu.length > 0 ? menu : MOCK_FOOD_ITEMS,
    });
  },
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
  }) => {
    const order = {
      _id: `order_${Date.now().toString(36)}`,
      restaurant: {
        name:
          MOCK_RESTAURANTS.find(r => r._id === body.restaurantId)?.name ||
          'Restaurant',
        imageUrl: null,
      },
      items: body.items,
      totalAmount: (body.items || []).reduce(
        (sum: number, i: any) => sum + (i.price || 0) * (i.quantity || 1),
        0,
      ),
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDeliveryTime: '25 min',
      deliveryAddress: body.deliveryAddress,
      paymentMethod: body.paymentMethod,
    };
    return delay({ order, message: 'Order placed' });
  },

  verifyPayment: (_body: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => delay({ success: true, message: 'Payment verified' }),

  getAll: (_params?: { status?: string; page?: number }) =>
    delay({ orders: MOCK_ORDERS }),

  getById: (id: string) => {
    const order = MOCK_ORDERS.find(o => o._id === id) || MOCK_ORDERS[0];
    return delay({ order });
  },

  cancel: (id: string, _reason: string) =>
    delay({ message: 'Order cancelled', orderId: id }),

  rate: (
    id: string,
    _body: {
      restaurantRating: number;
      deliveryRating?: number;
      comment?: string;
    },
  ) => delay({ message: 'Rated', orderId: id }),
};

// ── Wallet ────────────────────────────────────────────────────────
export const walletAPI = {
  get: () => delay({ ...MOCK_WALLETS }),

  createTopup: (amount: number) =>
    delay({
      orderId: `topup_${Date.now()}`,
      amount,
      currency: 'INR',
    }),

  verifyTopup: (_body: {
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => delay({ success: true, balance: MOCK_WALLETS.balance }),

  getTransactions: () => delay({ transactions: MOCK_TRANSACTIONS }),
};

// ── Subscriptions ─────────────────────────────────────────────────
export const subscriptionAPI = {
  getPlans: () => delay({ plans: MOCK_PLANS }),

  create: (_body: {
    restaurantId: string;
    planId: string;
    menuItems: string[];
    deliveryAddress: any;
    deliveryTime: string;
  }) =>
    delay({
      subscription: MOCK_SUBSCRIPTIONS[0],
      message: 'Subscription created',
    }),

  getMine: () => delay({ subscriptions: MOCK_SUBSCRIPTIONS }),

  cancel: (id: string) =>
    delay({ message: 'Subscription cancelled', subscriptionId: id }),
};
