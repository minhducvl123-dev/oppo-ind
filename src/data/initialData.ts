import { MasterDataMap, MonthData, StoreItem, WeekKey } from '../types';

export const baseStoresList: {
  shop: string;
  tier: 'S' | 'A' | 'B';
  baseSO: number;
  baseSI: number;
  baseReno: number;
  baseA7: number;
  baseCL: number;
}[] = [
  { shop: "Thanh Đời (Cần Thơ)", tier: "S", baseSO: 18, baseSI: 20, baseReno: 9, baseA7: 8, baseCL: 14 },
  { shop: "Triều Anh (Cần Thơ)", tier: "A", baseSO: 14, baseSI: 16, baseReno: 7, baseA7: 7, baseCL: 12 },
  { shop: "Ngọc Diệp Mobile (Cần Thơ)", tier: "S", baseSO: 24, baseSI: 25, baseReno: 14, baseA7: 10, baseCL: 21 },
  { shop: "Thanh Phong - Ô Môn (CTY)", tier: "B", baseSO: 12, baseSI: 15, baseReno: 5, baseA7: 7, baseCL: 10 },
  { shop: "Thiên Kim - Ô Môn - Thới Long", tier: "B", baseSO: 10, baseSI: 12, baseReno: 4, baseA7: 6, baseCL: 9 },
  { shop: "Đại Lý 102", tier: "S", baseSO: 28, baseSI: 28, baseReno: 17, baseA7: 11, baseCL: 25 },
  { shop: "Cửa hàng ĐTDĐ Dương Nguyễn Hiếu", tier: "A", baseSO: 16, baseSI: 18, baseReno: 8, baseA7: 8, baseCL: 13 },
  { shop: "Cao Duy - Cao Thắng", tier: "S", baseSO: 21, baseSI: 22, baseReno: 12, baseA7: 9, baseCL: 18 },
  { shop: "Diễm Phước - Thới Lai", tier: "B", baseSO: 11, baseSI: 13, baseReno: 5, baseA7: 6, baseCL: 10 },
  { shop: "Đức Nhân", tier: "A", baseSO: 19, baseSI: 20, baseReno: 10, baseA7: 9, baseCL: 15 },
  { shop: "Dũng", tier: "B", baseSO: 13, baseSI: 16, baseReno: 6, baseA7: 7, baseCL: 11 },
  { shop: "Hải Phượng", tier: "A", baseSO: 15, baseSI: 16, baseReno: 7, baseA7: 8, baseCL: 12 },
  { shop: "Lộc Nương", tier: "B", baseSO: 9, baseSI: 12, baseReno: 4, baseA7: 5, baseCL: 8 },
  { shop: "Lý Thị Ngọc Diệu", tier: "S", baseSO: 25, baseSI: 26, baseReno: 15, baseA7: 10, baseCL: 22 },
  { shop: "Minh Dương", tier: "A", baseSO: 17, baseSI: 18, baseReno: 9, baseA7: 8, baseCL: 14 },
  { shop: "Minh Trí", tier: "S", baseSO: 22, baseSI: 23, baseReno: 13, baseA7: 9, baseCL: 19 },
  { shop: "Ngọc Giúp", tier: "A", baseSO: 14, baseSI: 15, baseReno: 6, baseA7: 8, baseCL: 12 },
  { shop: "Phước Tài", tier: "B", baseSO: 12, baseSI: 14, baseReno: 5, baseA7: 7, baseCL: 10 },
  { shop: "Thành Lợi", tier: "S", baseSO: 24, baseSI: 25, baseReno: 14, baseA7: 10, baseCL: 21 },
  { shop: "Thanh Phương", tier: "A", baseSO: 16, baseSI: 17, baseReno: 8, baseA7: 8, baseCL: 13 },
  { shop: "Trịnh Thái Sơn - Thới Lai", tier: "B", baseSO: 10, baseSI: 13, baseReno: 4, baseA7: 6, baseCL: 9 },
  { shop: "Duy Tường - Long Mỹ", tier: "A", baseSO: 19, baseSI: 20, baseReno: 10, baseA7: 9, baseCL: 16 },
  { shop: "Lê Tín - Vị Thanh", tier: "S", baseSO: 27, baseSI: 28, baseReno: 16, baseA7: 11, baseCL: 24 },
  { shop: "Trường Giang - Châu Thành A", tier: "A", baseSO: 15, baseSI: 17, baseReno: 7, baseA7: 8, baseCL: 13 },
  { shop: "Chí Vĩnh - Long Mỹ", tier: "B", baseSO: 11, baseSI: 14, baseReno: 5, baseA7: 6, baseCL: 10 }
];

export const monthMultipliers: Record<string, number> = {
  "2026-01": 0.75,
  "2026-02": 0.85,
  "2026-03": 1.00,
  "2026-04": 1.05,
  "2026-05": 1.08,
  "2026-06": 1.12,
  "2026-07": 1.15,
  "2026-08": 1.10,
  "2026-09": 1.18,
  "2026-10": 1.25,
  "2026-11": 1.32,
  "2026-12": 1.40
};

export const monthNames: Record<string, string> = {
  "2026-12": "Tháng 12 / 2026",
  "2026-11": "Tháng 11 / 2026",
  "2026-10": "Tháng 10 / 2026 (Hiện tại)",
  "2026-09": "Tháng 9 / 2026",
  "2026-08": "Tháng 8 / 2026",
  "2026-07": "Tháng 7 / 2026",
  "2026-06": "Tháng 6 / 2026",
  "2026-05": "Tháng 5 / 2026",
  "2026-04": "Tháng 4 / 2026",
  "2026-03": "Tháng 3 / 2026",
  "2026-02": "Tháng 2 / 2026",
  "2026-01": "Tháng 1 / 2026"
};

export const weekWeights: Record<'w1' | 'w2' | 'w3' | 'w4', number> = {
  w1: 0.22,
  w2: 0.25,
  w3: 0.26,
  w4: 0.27
};

export function generateInitialMasterData(): MasterDataMap {
  const data: MasterDataMap = {};

  Object.keys(monthMultipliers).forEach((mKey) => {
    const mult = monthMultipliers[mKey];
    const fullMonthStores: StoreItem[] = baseStoresList.map((s) => {
      const so = Math.round(s.baseSO * mult);
      const si = Math.max(so, Math.round(s.baseSI * mult));
      return {
        shop: s.shop,
        sellOut: so,
        sellIn: si,
        reno: Math.round(s.baseReno * mult),
        a7pro: Math.round(s.baseA7 * mult),
        cuongLuc: Math.round(s.baseCL * mult),
        tier: s.tier,
      };
    });

    const weeksData: MonthData['weeks'] = {
      w1: [],
      w2: [],
      w3: [],
      w4: [],
    };

    (['w1', 'w2', 'w3', 'w4'] as const).forEach((w) => {
      const wRatio = weekWeights[w];
      weeksData[w] = fullMonthStores.map((s) => ({
        shop: s.shop,
        sellOut: Math.round(s.sellOut * wRatio),
        sellIn: Math.round(s.sellIn * wRatio),
        reno: Math.round(s.reno * wRatio),
        a7pro: Math.round(s.a7pro * wRatio),
        cuongLuc: Math.round(s.cuongLuc * wRatio),
        tier: s.tier,
      }));
    });

    data[mKey] = {
      fullMonth: fullMonthStores,
      weeks: weeksData,
    };
  });

  return data;
}

const STORAGE_KEY = 'oppo_cantho_master_data_v2';

export function loadMasterDataFromStorage(): MasterDataMap {
  if (typeof window === 'undefined') return generateInitialMasterData();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed['2026-10']) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
  }
  return generateInitialMasterData();
}

export function saveMasterDataToStorage(data: MasterDataMap) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to localStorage', e);
  }
}

export function resetMasterDataToDefault(): MasterDataMap {
  const fresh = generateInitialMasterData();
  saveMasterDataToStorage(fresh);
  return fresh;
}
