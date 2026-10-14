import React, { useState, useMemo, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  FiltersBar 
} from './components/FiltersBar';
import { 
  KpiCards 
} from './components/KpiCards';
import { 
  ChartsSection 
} from './components/ChartsSection';
import { 
  StoresTable 
} from './components/StoresTable';
import { 
  GeminiModal 
} from './components/GeminiModal';
import { 
  ImportModal 
} from './components/ImportModal';
import { 
  StoreModal 
} from './components/StoreModal';
import { 
  Toast 
} from './components/Toast';
import { 
  MasterDataMap, 
  StoreItem, 
  WeekKey, 
  ToastInfo 
} from './types';
import { 
  loadMasterDataFromStorage, 
  saveMasterDataToStorage, 
  resetMasterDataToDefault, 
  monthNames 
} from './data/initialData';
import { ShieldCheck, Layers, Building2, MapPin } from 'lucide-react';

export default function App() {
  const [masterData, setMasterData] = useState<MasterDataMap>(() => loadMasterDataFromStorage());
  const [currentMonth, setCurrentMonth] = useState<string>('2026-10');
  const [currentWeek, setCurrentWeek] = useState<WeekKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');

  // Modals state
  const [isGeminiOpen, setIsGeminiOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const addToast = (message: string, type: ToastInfo['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Get active stores for current selection
  const currentData = useMemo(() => {
    const m = masterData[currentMonth];
    if (!m) return [];
    if (currentWeek === 'all') return m.fullMonth || [];
    return m.weeks[currentWeek] || [];
  }, [masterData, currentMonth, currentWeek]);

  // Get previous period data for comparison
  const previousData = useMemo(() => {
    if (currentWeek !== 'all') {
      const weekOrder: ('w1' | 'w2' | 'w3' | 'w4')[] = ['w1', 'w2', 'w3', 'w4'];
      const idx = weekOrder.indexOf(currentWeek);
      if (idx > 0) {
        const prevW = weekOrder[idx - 1];
        return masterData[currentMonth]?.weeks[prevW] || null;
      } else {
        // Week 1 -> compare with Week 4 of previous month
        const [year, month] = currentMonth.split('-').map(Number);
        let prevYear = year;
        let prevMonth = month - 1;
        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear -= 1;
        }
        const prevKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
        return masterData[prevKey]?.weeks['w4'] || null;
      }
    } else {
      // Full month comparison with previous month
      const [year, month] = currentMonth.split('-').map(Number);
      let prevYear = year;
      let prevMonth = month - 1;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
      }
      const prevKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
      return masterData[prevKey]?.fullMonth || null;
    }
  }, [masterData, currentMonth, currentWeek]);

  // Period label text
  const periodLabel = useMemo(() => {
    const mText = monthNames[currentMonth] || currentMonth;
    const wMap: Record<WeekKey, string> = {
      all: 'Cả Tháng',
      w1: 'Tuần 1',
      w2: 'Tuần 2',
      w3: 'Tuần 3',
      w4: 'Tuần 4',
    };
    return `${mText} - ${wMap[currentWeek]}`;
  }, [currentMonth, currentWeek]);

  // Handle Month change
  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth);
    addToast(`Đã chuyển sang kỳ xem: ${monthNames[newMonth] || newMonth}`, 'info');
  };

  // Handle Week change
  const handleWeekChange = (newWeek: WeekKey) => {
    setCurrentWeek(newWeek);
    const wLabels: Record<WeekKey, string> = {
      all: 'Toàn bộ tháng',
      w1: 'Tuần 1',
      w2: 'Tuần 2',
      w3: 'Tuần 3',
      w4: 'Tuần 4',
    };
    addToast(`Đang lọc: ${wLabels[newWeek]}`, 'info');
  };

  // Handle Import Success
  const handleImportSuccess = (
    targetMonth: string,
    targetWeek: 'w1' | 'w2' | 'w3' | 'w4',
    importedStores: StoreItem[]
  ) => {
    setMasterData((prev) => {
      const copy: MasterDataMap = JSON.parse(JSON.stringify(prev));
      if (!copy[targetMonth]) {
        copy[targetMonth] = {
          fullMonth: [],
          weeks: { w1: [], w2: [], w3: [], w4: [] },
        };
      }

      // Update the week
      copy[targetMonth].weeks[targetWeek] = importedStores;

      // Recalculate full month
      const fullMap = new Map<string, StoreItem>();
      (['w1', 'w2', 'w3', 'w4'] as const).forEach((wk) => {
        (copy[targetMonth].weeks[wk] || []).forEach((st) => {
          if (!fullMap.has(st.shop)) {
            fullMap.set(st.shop, {
              shop: st.shop,
              sellOut: 0,
              sellIn: 0,
              reno: 0,
              a7pro: 0,
              cuongLuc: 0,
              tier: st.tier,
            });
          }
          const item = fullMap.get(st.shop)!;
          item.sellOut += st.sellOut;
          item.sellIn += st.sellIn;
          item.reno += st.reno;
          item.a7pro += st.a7pro;
          item.cuongLuc += st.cuongLuc;
        });
      });

      copy[targetMonth].fullMonth = Array.from(fullMap.values());
      saveMasterDataToStorage(copy);
      return copy;
    });

    setCurrentMonth(targetMonth);
    setCurrentWeek(targetWeek);
    addToast(`Import thành công ${importedStores.length} đại lý vào ${targetMonth} (${targetWeek.toUpperCase()})!`);
  };

  // Handle Add/Edit Store Save
  const handleSaveStore = (newStore: StoreItem, oldName?: string) => {
    setMasterData((prev) => {
      const copy: MasterDataMap = JSON.parse(JSON.stringify(prev));
      const mObj = copy[currentMonth];
      if (!mObj) return prev;

      if (currentWeek === 'all') {
        if (oldName) {
          const idx = mObj.fullMonth.findIndex((s) => s.shop === oldName);
          if (idx !== -1) mObj.fullMonth[idx] = newStore;
          else mObj.fullMonth.push(newStore);
        } else {
          mObj.fullMonth.push(newStore);
        }
      } else {
        const weekArr = mObj.weeks[currentWeek] || [];
        if (oldName) {
          const idx = weekArr.findIndex((s) => s.shop === oldName);
          if (idx !== -1) weekArr[idx] = newStore;
          else weekArr.push(newStore);
        } else {
          weekArr.push(newStore);
        }
        mObj.weeks[currentWeek] = weekArr;

        // Also sync full month
        const fIdx = mObj.fullMonth.findIndex((s) => s.shop === (oldName || newStore.shop));
        if (fIdx !== -1) {
          mObj.fullMonth[fIdx] = newStore;
        } else {
          mObj.fullMonth.push(newStore);
        }
      }

      saveMasterDataToStorage(copy);
      return copy;
    });

    addToast(oldName ? `Đã cập nhật đại lý "${newStore.shop}"` : `Đã thêm đại lý "${newStore.shop}" thành công!`);
  };

  // Handle Delete Store
  const handleDeleteStore = (shopName: string) => {
    if (!window.confirm(`Bạn có chắc muốn xoá đại lý "${shopName}" khỏi kỳ báo cáo này không?`)) {
      return;
    }

    setMasterData((prev) => {
      const copy: MasterDataMap = JSON.parse(JSON.stringify(prev));
      const mObj = copy[currentMonth];
      if (!mObj) return prev;

      if (currentWeek === 'all') {
        mObj.fullMonth = mObj.fullMonth.filter((s) => s.shop !== shopName);
      } else {
        mObj.weeks[currentWeek] = (mObj.weeks[currentWeek] || []).filter((s) => s.shop !== shopName);
        mObj.fullMonth = mObj.fullMonth.filter((s) => s.shop !== shopName);
      }

      saveMasterDataToStorage(copy);
      return copy;
    });

    addToast(`Đã xoá đại lý "${shopName}" khỏi danh sách`, 'warning');
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    let csv = 'STT,Khu Vực / Tên Đại Lý,Sell Out (Máy),Sell In (Máy),Reno (SL),A7PRO (SL),Kính Cường Lực (SL),Phân Cấp,Tỷ Lệ S.Out/S.In (%)\r\n';
    currentData.forEach((row, i) => {
      const ratio = row.sellIn > 0 ? ((row.sellOut / row.sellIn) * 100).toFixed(1) : '0';
      csv += `${i + 1},"${row.shop}",${row.sellOut},${row.sellIn},${row.reno},${row.a7pro},${row.cuongLuc},${row.tier},${ratio}\r\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OPPO_CanTho_Report_${currentMonth}_${currentWeek}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Đã xuất file báo cáo CSV thành công!');
  };

  // Reset to default
  const handleResetData = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của năm 2026? Các thay đổi đã nhập sẽ được đặt lại.')) {
      const fresh = resetMasterDataToDefault();
      setMasterData(fresh);
      addToast('Đã khôi phục dữ liệu mẫu gốc 2026!', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenGemini={() => setIsGeminiOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAddModal={() => {
          setEditingStore(null);
          setIsStoreModalOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onResetData={handleResetData}
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Filter & Period Selector Bar */}
        <FiltersBar
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTier={selectedTier}
          onTierChange={setSelectedTier}
          storeCount={currentData.length}
        />

        {/* KPI Stat Cards */}
        <KpiCards
          currentData={currentData}
          previousData={previousData}
          periodLabel={periodLabel}
          isWeekly={currentWeek !== 'all'}
        />

        {/* Charts Section */}
        <ChartsSection
          currentData={currentData}
          masterData={masterData}
          currentMonth={currentMonth}
          currentWeek={currentWeek}
          periodLabel={periodLabel}
        />

        {/* Detailed Data Table */}
        <StoresTable
          data={currentData}
          previousData={previousData}
          searchQuery={searchQuery}
          selectedTier={selectedTier}
          onEditStore={(store) => {
            setEditingStore(store);
            setIsStoreModalOpen(true);
          }}
          onDeleteStore={handleDeleteStore}
          periodTitle={`Bảng Kê Chi Tiết Doanh Số - ${periodLabel}`}
        />
      </main>

      {/* Modals */}
      <GeminiModal
        isOpen={isGeminiOpen}
        onClose={() => setIsGeminiOpen(false)}
        currentData={currentData}
        currentMonth={currentMonth}
        currentWeek={currentWeek}
        periodLabel={periodLabel}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        currentMonth={currentMonth}
        currentWeek={currentWeek}
        onImportSuccess={handleImportSuccess}
      />

      <StoreModal
        isOpen={isStoreModalOpen}
        onClose={() => {
          setIsStoreModalOpen(false);
          setEditingStore(null);
        }}
        onSave={handleSaveStore}
        initialStore={editingStore}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">OPPO Cần Thơ</span>
            <span>•</span>
            <span>Hệ Thống Báo Cáo Kinh Doanh & Chuỗi Cung Ứng Tây Nam Bộ</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Phiên bản 2026.10</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Dữ liệu trực tuyến
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
