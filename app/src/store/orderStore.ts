import { create } from 'zustand';
import { ordersApi } from '@/services/api';

interface OrderState {
  orders: any[];
  currentOrder: any | null;
  isLoading: boolean;
  fetchOrders: (params?: Record<string, string>) => Promise<void>;
  fetchOrder: (id: string) => Promise<void>;
  trackOrder: (reference: string) => Promise<any>;
  updateStatus: (id: string, status: string, note?: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,

  fetchOrders: async (params) => {
    set({ isLoading: true });
    try {
      const orders = await ordersApi.list(params);
      set({ orders, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchOrder: async (id) => {
    set({ isLoading: true });
    try {
      const order = await ordersApi.get(id);
      set({ currentOrder: order, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  trackOrder: async (reference) => {
    const order = await ordersApi.track(reference);
    return order;
  },

  updateStatus: async (id, status, note) => {
    await ordersApi.updateStatus(id, status, note);
    const order = await ordersApi.get(id);
    set({ currentOrder: order });
  },
}));
