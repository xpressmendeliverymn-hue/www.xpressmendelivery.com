export interface PhotoItem {
  id: string;
  file?: File;
  url: string;
  aiDescription: string;
  status: 'uploading' | 'analyzing' | 'complete';
}

export interface DeliveryPhoto {
  id: string;
  url: string;
  uploadedAt: string;
  note?: string;
}

export interface RoomSelection {
  roomType: string;
  placements: string[];
  considerations: string[];
  description?: string;
}

export interface OrderItem {
  id: string;
  category: 'sofa' | 'bed' | 'dresser' | 'table' | 'chair' | 'mattress' | 'entertainment_center' | 'other';
  name: string;
  quantity: number;
  price: number;
  image?: string;
  action: 'deliver' | 'remove';
}

export interface PricingBreakdown {
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  communicationPrefs: string[];
}

export interface AdditionalDetails {
  homeType: string;
  parking?: string;
  accessNotes?: string;
  specialRequests?: string;
}

export interface OrderDetails {
  storeName: string;
  orderNumber?: string;
  itemDescription: string;
}

export interface StatusEvent {
  status: OrderStatus;
  label: string;
  timestamp: string;
  note?: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'scheduled'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: string;
  reference: string;
  status: OrderStatus;
  statusTimeline: StatusEvent[];
  serviceType: ('delivery' | 'removal')[];
  items: OrderItem[];
  pricing: PricingBreakdown;
  affiliateCode?: string;
  photos: PhotoItem[];
  deliveryPhotos: DeliveryPhoto[];
  roomSelection: RoomSelection | null;
  schedule: { date: string; timeSlot: string } | null;
  contactInfo: ContactInfo | null;
  additionalDetails: AdditionalDetails | null;
  orderDetails: OrderDetails | null;
  createdAt: string;
  assignedCrew?: string;
  notes: string[];
}

export interface User {
  id: string;
  role: 'customer' | 'salesperson' | 'admin';
  name: string;
  email: string;
  phone: string;
  code?: string;
}

export interface Salesperson {
  id: string;
  name: string;
  code: string;
  discountPercent: number;
  totalReferrals: number;
  totalRevenue: number;
  active: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'order_status' | 'system' | 'promo';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  orderId?: string;
}

export interface CrewSlot {
  id: string;
  crewName: string;
  date: string;
  timeSlot: string;
  orderId?: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface FurnitureCatalogItem {
  id: string;
  category: OrderItem['category'];
  name: string;
  basePrice: number;
  image: string;
  description: string;
}
