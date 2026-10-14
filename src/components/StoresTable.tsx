import React, { useState, useMemo } from 'react';
import { 
  StoreItem, 
  StoreTier 
} from '../types';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit3, 
  Trash2, 
  Copy, 
  Search, 
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StoresTableProps {
  data: StoreItem[];
  previousData: StoreItem[] | null;
  searchQuery: string;
  selectedTier: string;
  onEditStore: (store: StoreItem) => void;
  onDeleteStore: (storeName: string) => void;
  periodTitle: string;
}

type SortField = 'shop' | 'sellOut' | 'sellIn' | 'reno' | 'a7pro' | 'cuongLuc' | 'ratio' | 'growth';
type SortDirection = 'asc' | 'desc';

export const StoresTable: React.FC<StoresTableProps> = ({
  data,
  previousData,
  searchQuery,
  selectedTier,
  onEditStore,
  onDeleteStore,
  periodTitle,
}) => {
  const [sortField, setSortField] = useState<SortField>('sellOut');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Build map of previous period data for quick growth calculation
  const prevMap = useMemo(() => {
    const map = new Map<string, StoreItem>();
    if (previousData) {
      previousData.forEach((s) => map.set(s.shop, s));
    }
    return map;
  }, [previousData]);

  // Filter and Sort rows
  const filteredAndSortedRows = useMemo(() => {
    return data
      .filter((item) => {
        const matchesQuery = item.shop.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTier = selectedTier === '' || item.tier === selectedTier;
        return matchesQuery && matchesTier;
      })
      .map((item) => {
        const ratio = item.sellIn > 0 ? (item.sellOut / item.sellIn) * 100 : 0;
        let growth: number | null = null;
        const prev = prevMap.get(item.shop);
        if (prev && prev.sellOut > 0) {
          growth = ((item.sellOut - prev.sellOut) / prev.sellOut) * 100;
        }
        return {
          ...item,
          ratioVal: ratio,
          growthVal: growth,
        };
      })
      .sort((a, b) => {
        let valA: any = a[sortField as keyof typeof a];
        let valB: any = b[sortField as keyof typeof b];

        if (sortField === 'ratio') {
          valA = a.ratioVal;
          valB = b.ratioVal;
        } else if (sortField === 'growth') {
          valA = a.growthVal !== null ? a.growthVal : -9999;
          valB = b.growthVal !== null ? b.growthVal : -9999;
        }

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [data, searchQuery, selectedTier, sortField, sortDirection, prevMap]);

  // Calculate totals for footer
  const totals = useMemo(() => {
    let so = 0, si = 0, reno = 0, a7 = 0, cl = 0;
    filteredAndSortedRows.forEach((r) => {
      so += r.sellOut;
      si += r.sellIn;
      reno += r.reno;
      a7 += r.a7pro;
      cl += r.cuongLuc;
    });
    const avgRatio = si > 0 ? (so / si) * 100 : 0;
    return { so, si, reno, a7, cl, avgRatio };
  }, [filteredAndSortedRows]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1 inline opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-emerald-600 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-emerald-600 ml-1 inline" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            {periodTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hiển thị {filteredAndSortedRows.length} / {data.length} đại lý được ghi nhận
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Cấp S: Doanh số &gt; 20m
          </span>
          <span className="hidden md:inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Cấp A: 14-19m
          </span>
          <span className="hidden md:inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Cấp B: &lt; 14m
          </span>
        </div>
      </div>

      {/* Responsive Table Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200 select-none">
              <th className="py-3.5 px-3 text-center w-12">STT</th>
              
              <th 
                onClick={() => handleSort('shop')} 
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Khu Vực / Tên Đại Lý {renderSortIndicator('shop')}
              </th>

              <th 
                onClick={() => handleSort('sellOut')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Sell Out {renderSortIndicator('sellOut')}
              </th>

              <th 
                onClick={() => handleSort('sellIn')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Sell In {renderSortIndicator('sellIn')}
              </th>

              <th 
                onClick={() => handleSort('reno')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Reno (SL) {renderSortIndicator('reno')}
              </th>

              <th 
                onClick={() => handleSort('a7pro')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                A7PRO (SL) {renderSortIndicator('a7pro')}
              </th>

              <th 
                onClick={() => handleSort('cuongLuc')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Cường Lực {renderSortIndicator('cuongLuc')}
              </th>

              <th className="py-3.5 px-3 text-center">Phân Cấp</th>

              <th 
                onClick={() => handleSort('ratio')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Tỷ Lệ S.Out/S.In {renderSortIndicator('ratio')}
              </th>

              <th 
                onClick={() => handleSort('growth')} 
                className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-900 group whitespace-nowrap"
              >
                Tăng Trưởng {renderSortIndicator('growth')}
              </th>

              <th className="py-3.5 px-4 text-center w-24">Thao Tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">Không tìm thấy đại lý nào phù hợp</p>
                  <p className="text-xs text-slate-400 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc bỏ lọc phân cấp</p>
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((item, index) => {
                const ratio = item.ratioVal;
                const growth = item.growthVal;

                let tierBadge = (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                    Cấp B
                  </span>
                );
                if (item.tier === 'S') {
                  tierBadge = (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-emerald-300 shadow-xs">
                      ⭐ Cấp S
                    </span>
                  );
                } else if (item.tier === 'A') {
                  tierBadge = (
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold border border-blue-200">
                      Cấp A
                    </span>
                  );
                }

                // Growth badge
                let growthBadge = <span className="text-slate-400 text-xs font-mono">-</span>;
                if (growth !== null) {
                  if (growth > 0) {
                    growthBadge = (
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-0.5 border border-emerald-200/60">
                        <ArrowUp className="w-3 h-3 text-emerald-600" />
                        +{growth.toFixed(1)}%
                      </span>
                    );
                  } else if (growth < 0) {
                    growthBadge = (
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-0.5 border border-rose-200/60">
                        <ArrowDown className="w-3 h-3 text-rose-600" />
                        {growth.toFixed(1)}%
                      </span>
                    );
                  } else {
                    growthBadge = (
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                        0.0%
                      </span>
                    );
                  }
                }

                return (
                  <tr 
                    key={item.shop + index} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-3 text-center font-mono text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span>{item.shop}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-emerald-600">
                      {item.sellOut}
                    </td>

                    <td className="py-3 px-3 text-center font-medium text-slate-700">
                      {item.sellIn}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600">
                      {item.reno}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600">
                      {item.a7pro}
                    </td>

                    <td className="py-3 px-3 text-center text-slate-600">
                      {item.cuongLuc}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {tierBadge}
                    </td>

                    <td className="py-3 px-3 text-center font-semibold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                          ratio >= 90
                            ? 'text-emerald-700 bg-emerald-50'
                            : ratio >= 75
                            ? 'text-blue-700 bg-blue-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        {ratio.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {growthBadge}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditStore(item)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Chỉnh sửa đại lý"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStore(item.shop)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa khỏi kỳ báo cáo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Summary Table Foot */}
          {filteredAndSortedRows.length > 0 && (
            <tfoot className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300 text-xs sm:text-sm">
              <tr>
                <td className="py-4 px-3 text-center font-bold text-slate-500">TỔNG</td>
                <td className="py-4 px-4 font-bold text-slate-900">
                  TỔNG CỘNG KHU VỰC ({filteredAndSortedRows.length} đại lý)
                </td>
                <td className="py-4 px-3 text-center text-emerald-700 font-extrabold text-sm sm:text-base">
                  {totals.so}
                </td>
                <td className="py-4 px-3 text-center text-blue-700 font-extrabold text-sm sm:text-base">
                  {totals.si}
                </td>
                <td className="py-4 px-3 text-center text-slate-800 font-bold">
                  {totals.reno}
                </td>
                <td className="py-4 px-3 text-center text-slate-800 font-bold">
                  {totals.a7}
                </td>
                <td className="py-4 px-3 text-center text-slate-800 font-bold">
                  {totals.cl}
                </td>
                <td className="py-4 px-3 text-center text-slate-500">-</td>
                <td className="py-4 px-3 text-center text-emerald-700 font-bold text-sm">
                  {totals.avgRatio.toFixed(1)}%
                </td>
                <td className="py-4 px-3 text-center text-slate-500">-</td>
                <td className="py-4 px-4 text-center"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
