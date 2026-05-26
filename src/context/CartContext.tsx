import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  description?: string;
  specialInstructions?: string;
}

interface CartContextValue {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: CartItem, restId: string, restName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextValue>({} as CartContextValue);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);

  const addItem = (item: CartItem, restId: string, restName: string) => {
    // If cart has items from a different restaurant, replace cart
    if (restaurantId && restaurantId !== restId) {
      setItems([{ ...item, quantity: 1 }]);
      setRestaurantId(restId);
      setRestaurantName(restName);
      return;
    }
    setRestaurantId(restId);
    setRestaurantName(restName);
    setItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map(i =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.menuItemId !== menuItemId);
      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
      }
      return next;
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setItems(prev => {
      return prev
        .map(i =>
          i.menuItemId === menuItemId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter(i => i.quantity > 0);
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
