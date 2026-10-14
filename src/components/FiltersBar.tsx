import React from 'react';
import { Calendar, Filter, Search, Sparkles, Layers, CheckCircle2 } from 'lucide-react';
import { WeekKey } from '../types';
import { monthNames } from '../data/initialData';

interface FiltersBarProps {
  currentMonth: string;
  onMonthChange: (m: string) => void;
  currentWeek: WeekKey;
  onWeekChange: (w: WeekKey) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTier: string;
  onTierChange: (t: string) => void;
  storeCount: number;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  currentMonth,
  onMonthChange,
  currentWeek,
  onWeekChange,
  searchQuery,
  onSearchChange,
  selectedTier,
  onTierChange,
  storeCount,
}) => {
  const weekTabs: { key: WeekKey; label: string }[] = [
    { key: 'all', label: 'Cả Tháng' },
    { key: 'w1', label: 'Tuần 1' },
    { key: 'w2', label: 'Tuần 2' },
    { key: 'w3', label: 'Tuần 3' },
    { key: 'w4', label: 'Tuần 4' },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/70 space-y-4">
      {/* Top Filter Row: Month selection & Region Sync status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-4 h-4 text-emerald-600" /> Chọn Kỳ Báo Cáo:
            </span>
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:bg-slate-100/70 transition cursor-pointer"
            >
              {Object.entries(monthNames).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-xs text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Khu vực: Cần Thơ, Hậu Giang</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-200/50 self-start sm:self-auto">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-emerald-900">
            {storeCount} Đại lý sẵn sàng
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">Chuỗi cung ứng trực tuyến</span>
        </div>
      </div>

      {/* Bottom Filter Row: Weekly tabs + Search & Tier selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-3 border-t border-slate-100">
        {/* Weekly Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 whitespace-nowrap">
            Tiến độ tuần:
          </span>
          {weekTabs.map((tab) => {
            const isActive = currentWeek === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onWeekChange(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 ring-2 ring-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Quick Search & Tier Filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm kiếm shop, quận huyện..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center space-x-1">
            <select
              value={selectedTier}
              onChange={(e) => onTierChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="">Tất cả phân cấp</option>
              <option value="S">Cấp S (Key Dealer)</option>
              <option value="A">Cấp A (Standard)</option>
              <option value="B">Cấp B (Sub Dealer)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
