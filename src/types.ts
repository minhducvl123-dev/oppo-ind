export type StoreTier = 'S' | 'A' | 'B';

export interface StoreItem {
  id?: string;
  shop: string;
  sellOut: number;
  sellIn: number;
  reno: number;
  a7pro: number;
  cuongLuc: number;
  tier: StoreTier;
}

export type WeekKey = 'all' | 'w1' | 'w2' | 'w3' | 'w4';

export interface MonthData {
  fullMonth: StoreItem[];
  weeks: {
    w1: StoreItem[];
    w2: StoreItem[];
    w3: StoreItem[];
    w4: StoreItem[];
  };
}

export type MasterDataMap = Record<string, MonthData>;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface ToastInfo {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
