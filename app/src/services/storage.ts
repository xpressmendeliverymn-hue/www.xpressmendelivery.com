const STORAGE_KEY = 'xpressmen_data_v1';

export interface AppData {
  orders: import('@/types').Order[];
  salespeople: import('@/types').Salesperson[];
  crewSlots: import('@/types').CrewSlot[];
  notifications: import('@/types').NotificationItem[];
  users: import('@/types').User[];
  currentUser: import('@/types').User | null;
}

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppData;
  } catch {
    return null;
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearData() {
  localStorage.removeItem(STORAGE_KEY);
}
