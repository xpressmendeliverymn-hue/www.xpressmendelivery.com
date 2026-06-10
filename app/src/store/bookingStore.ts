import { create } from 'zustand';

export interface PhotoItem {
  id: string;
  file: File;
  url: string;
  serverUrl?: string;
  aiDescription: string;
  status: 'uploading' | 'analyzing' | 'complete' | 'error';
}

export interface RoomSelection {
  roomType: string;
  placements: string[];
  considerations: string[];
  description?: string;
}

export interface OrderItem {
  id: string;
  catalogId: string;
  category: string;
  name: string;
  quantity: number;
  price: number;
  basePrice: number;
  image?: string;
  action: 'deliver' | 'remove';
}

export interface BookingStore {
  currentStep: number;
  serviceType: ('delivery' | 'removal')[];
  items: OrderItem[];
  orderDetails: { storeName: string; orderNumber?: string; itemDescription: string } | null;
  photos: PhotoItem[];
  roomSelection: RoomSelection | null;
  additionalDetails: { homeType: string; parking?: string; accessNotes?: string; specialRequests?: string } | null;
  schedule: { date: Date; timeSlot: string } | null;
  contactInfo: { firstName: string; lastName: string; phone: string; email: string; address: string; communicationPrefs: string[] } | null;
  discountCode: string;
  discountApplied: number;
  affiliateCode: string;
  isComplete: boolean;
  bookingReference: string;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setServiceType: (types: ('delivery' | 'removal')[]) => void;
  setItems: (items: OrderItem[]) => void;
  setOrderDetails: (details: { storeName: string; orderNumber?: string; itemDescription: string } | null) => void;
  addPhoto: (photo: PhotoItem) => void;
  removePhoto: (id: string) => void;
  updatePhotoStatus: (id: string, status: PhotoItem['status'], description?: string) => void;
  updatePhotoUrl: (id: string, serverUrl: string) => void;
  setRoomSelection: (selection: RoomSelection | null) => void;
  setAdditionalDetails: (details: { homeType: string; parking?: string; accessNotes?: string; specialRequests?: string } | null) => void;
  setSchedule: (schedule: { date: Date; timeSlot: string } | null) => void;
  setContactInfo: (info: { firstName: string; lastName: string; phone: string; email: string; address: string; communicationPrefs: string[] } | null) => void;
  setDiscountCode: (code: string) => void;
  setDiscountApplied: (amount: number) => void;
  setAffiliateCode: (code: string) => void;
  completeBooking: (reference: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  currentStep: 1,
  serviceType: [],
  items: [],
  orderDetails: null,
  photos: [],
  roomSelection: null,
  additionalDetails: null,
  schedule: null,
  contactInfo: null,
  discountCode: '',
  discountApplied: 0,
  affiliateCode: '',
  isComplete: false,
  bookingReference: '',

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const state = get();
    const next = state.currentStep + 1;
    // Skip order details (step 3) if removal-only
    if (next === 3 && state.serviceType.includes('delivery') === false && state.serviceType.length > 0) {
      set({ currentStep: 4 });
      return;
    }
    if (next <= 9) set({ currentStep: next });
  },

  prevStep: () => {
    const state = get();
    let prev = state.currentStep - 1;
    // Skip back over order details (step 3) if removal-only
    if (prev === 3 && state.serviceType.includes('delivery') === false && state.serviceType.length > 0) {
      prev = 2;
    }
    if (prev >= 1) set({ currentStep: prev });
  },

  setServiceType: (types) => set({ serviceType: types }),
  setItems: (items) => set({ items }),
  setOrderDetails: (details) => set({ orderDetails: details }),

  addPhoto: (photo) => set((s) => ({ photos: [...s.photos, photo] })),

  removePhoto: (id) => set((s) => {
    const photo = s.photos.find(p => p.id === id);
    if (photo) URL.revokeObjectURL(photo.url);
    return { photos: s.photos.filter(p => p.id !== id) };
  }),

  updatePhotoStatus: (id, status, description) => set((s) => ({
    photos: s.photos.map(p =>
      p.id === id ? { ...p, status, aiDescription: description || p.aiDescription } : p
    ),
  })),

  updatePhotoUrl: (id, serverUrl) => set((s) => ({
    photos: s.photos.map(p =>
      p.id === id ? { ...p, serverUrl } : p
    ),
  })),

  setRoomSelection: (selection) => set({ roomSelection: selection }),
  setAdditionalDetails: (details) => set({ additionalDetails: details }),
  setSchedule: (schedule) => set({ schedule }),
  setContactInfo: (info) => set({ contactInfo: info }),
  setDiscountCode: (code) => set({ discountCode: code }),
  setDiscountApplied: (amount) => set({ discountApplied: amount }),
  setAffiliateCode: (code) => set({ affiliateCode: code }),

  completeBooking: (reference) => set({
    isComplete: true,
    bookingReference: reference,
    currentStep: 10,
  }),

  reset: () => {
    const state = get();
    state.photos.forEach(p => URL.revokeObjectURL(p.url));
    set({
      currentStep: 1,
      serviceType: [],
      items: [],
      orderDetails: null,
      photos: [],
      roomSelection: null,
      additionalDetails: null,
      schedule: null,
      contactInfo: null,
      discountCode: '',
      discountApplied: 0,
      affiliateCode: '',
      isComplete: false,
      bookingReference: '',
    });
  },
}));
