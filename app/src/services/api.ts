const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('xpress_token');
}

async function fetchApi(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return data;
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, phone: string, password: string) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, phone, password }) }),
  me: () => fetchApi('/auth/me'),
};

// Orders
export const ordersApi = {
  create: (order: any) => fetchApi('/orders', { method: 'POST', body: JSON.stringify(order) }),
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/orders${qs}`);
  },
  get: (id: string) => fetchApi(`/orders/${id}`),
  track: (reference: string) => fetchApi(`/orders/track/${reference}`),
  updateStatus: (id: string, status: string, note?: string) =>
    fetchApi(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  updateWarehouse: (id: string, warehouseStatus: string, note?: string) =>
    fetchApi(`/orders/${id}/warehouse`, { method: 'PATCH', body: JSON.stringify({ warehouseStatus, note }) }),
  addNote: (id: string, note: string) =>
    fetchApi(`/orders/${id}/notes`, { method: 'POST', body: JSON.stringify({ note }) }),
  assignCrew: (id: string, crewName: string) =>
    fetchApi(`/orders/${id}/crew`, { method: 'PATCH', body: JSON.stringify({ crewName }) }),
  uploadDeliveryPhoto: (id: string, url: string, note?: string) =>
    fetchApi(`/orders/${id}/delivery-photos`, { method: 'POST', body: JSON.stringify({ url, note }) }),
  saveFormImage: (id: string, url: string) =>
    fetchApi(`/orders/${id}/form-images`, { method: 'POST', body: JSON.stringify({ url }) }),
  generateInvoice: (id: string) =>
    fetchApi(`/orders/${id}/invoice`, { method: 'POST' }),
  sendProofPacket: (id: string) =>
    fetchApi(`/orders/${id}/proof-packet`, { method: 'POST' }),
};

// Salespeople
export const salespeopleApi = {
  list: () => fetchApi('/salespeople'),
  create: (data: any) => fetchApi('/salespeople', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/salespeople/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  myStats: () => fetchApi('/salespeople/me/stats'),
  validateCode: (code: string) => fetchApi(`/salespeople/validate/${code}`),
  validateInvite: (token: string) => fetchApi(`/salespeople/invite/${token}`),
  createInvite: (data: any) => fetchApi('/salespeople/invites', { method: 'POST', body: JSON.stringify(data) }),
  listInvites: () => fetchApi('/salespeople/invites'),
  revokeInvite: (id: string) => fetchApi(`/salespeople/invites/${id}/revoke`, { method: 'PATCH' }),
};

// Schedule
export const scheduleApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/schedule${qs}`);
  },
  available: (date: string) => fetchApi(`/schedule/available/${date}`),
  update: (id: string, data: any) => fetchApi(`/schedule/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// Notifications
export const notificationsApi = {
  list: () => fetchApi('/notifications'),
  count: () => fetchApi('/notifications/count'),
  markRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => fetchApi('/notifications/read-all', { method: 'POST' }),
};

// Upload
export const uploadApi = {
  image: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`/api/upload/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken() || ''}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
  images: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await fetch(`/api/upload/images`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken() || ''}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};

// Catalog
export const catalogApi = {
  list: () => fetchApi('/catalog'),
  byCategory: (category: string) => fetchApi(`/catalog/category/${category}`),
};

// Stores
export const storesApi = {
  list: () => fetchApi('/stores'),
  byBrand: (brand: string) => fetchApi(`/stores/brand/${brand}`),
};

// OCR / AI Form Extraction
export const ocrApi = {
  extract: async (file: File) => {
    const formData = new FormData();
    formData.append('form', file);
    const res = await fetch(`/api/ocr/extract`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken() || ''}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'OCR failed');
    return data;
  },
};

// Order Messages
export const messagesApi = {
  list: (orderId: string) => fetchApi(`/messages/order/${orderId}`),
  send: (orderId: string, message: string) =>
    fetchApi(`/messages/order/${orderId}`, { method: 'POST', body: JSON.stringify({ message }) }),
};
