import React from 'react';
import { 
  Smartphone, 
  Boxes, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ShieldCheck, 
  Sparkles,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { StoreItem } from '../types';

interface KpiCardsProps {
  currentData: StoreItem[];
  previousData: StoreItem[] | null;
  periodLabel: string;
  isWeekly: boolean;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  currentData,
  previousData,
  periodLabel,
  isWeekly,
}) => {
  const totalSO = currentData.reduce((acc, cur) => acc + Number(cur.sellOut || 0), 0);
  const totalSI = currentData.reduce((acc, cur) => acc + Number(cur.sellIn || 0), 0);
  const totalReno = currentData.reduce((acc, cur) => acc + Number(cur.reno || 0), 0);
  const totalA7 = currentData.reduce((acc, cur) => acc + Number(cur.a7pro || 0), 0);
  const totalCL = currentData.reduce((acc, cur) => acc + Number(cur.cuongLuc || 0), 0);

  const ratio = totalSI > 0 ? (totalSO / totalSI) * 100 : 0;
  const renoShare = totalSO > 0 ? (totalReno / totalSO) * 100 : 0;
  const a7Share = totalSO > 0 ? (totalA7 / totalSO) * 100 : 0;
  const clAttachRate = totalSO > 0 ? (totalCL / totalSO) * 100 : 0;

  // Comparison with previous period
  let prevTotalSO = 0;
  let growth = 0;
  let hasPrev = false;

  if (previousData && previousData.length > 0) {
    prevTotalSO = previousData.reduce((acc, cur) => acc + Number(cur.sellOut || 0), 0);
    if (prevTotalSO > 0) {
      growth = ((totalSO - prevTotalSO) / prevTotalSO) * 100;
      hasPrev = true;
    }
  }

  // Health status
  const getHealthBadge = () => {
    if (ratio >= 80 && ratio <= 95) {
      return {
        text: 'Lưu thông lý tưởng (80-95%)',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: ShieldCheck,
      };
    } else if (ratio > 95) {
      return {
        text: 'Cảnh báo nguy cơ cháy hàng (>95%)',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
      };
    } else {
      return {
        text: 'Cần kích cầu / xả kho (<80%)',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertTriangle,
      };
    }
  };

  const health = getHealthBadge();
  const HealthIcon = health.icon;

  return (
    <div className="space-y-4">
      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Sell Out */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md transition-all duration-200 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng Sell Out (Thực Bán)
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-emerald-700 transition-colors">
                {totalSO.toLocaleString()} <span className="text-sm font-semibold text-slate-500">máy</span>
              </h3>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100/80 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            {hasPrev ? (
              <span className={`font-semibold flex items-center gap-1 ${growth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs {isWeekly ? 'tuần trước' : 'tháng trước'}
              </span>
            ) : (
              <span className="text-slate-400">Kỳ cơ sở phân tích</span>
            )}
            <span className="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md font-mono">
              TB: {(currentData.length > 0 ? (totalSO / currentData.length).toFixed(1) : 0)} máy/shop
            </span>
          </div>
        </div>

        {/* Card 2: Sell In */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md transition-all duration-200 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng Sell In (Nhập Kho)
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-blue-700 transition-colors">
                {totalSI.toLocaleString()} <span className="text-sm font-semibold text-slate-500">máy</span>
              </h3>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl border border-blue-100/80 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Chênh lệch tồn: +{(totalSI - totalSO)} máy
            </span>
            <span className="text-[11px] text-slate-400">Phân phối đại lý</span>
          </div>
        </div>

        {/* Card 3: Sell Out / Sell In Ratio */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md transition-all duration-200 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tỷ Lệ Sell Out / Sell In
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tracking-tight group-hover:text-amber-600 transition-colors">
                {ratio.toFixed(1)}%
              </h3>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl border border-amber-100/80 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${health.color}`}>
              <HealthIcon className="w-3 h-3" />
              {health.text}
            </span>
          </div>
        </div>

        {/* Card 4: Growth Rate */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md transition-all duration-200 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isWeekly ? 'Tăng Trưởng WoW' : 'Tăng Trưởng MoM'}
              </p>
              <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1.5 tracking-tight ${
                hasPrev && growth < 0 ? 'text-rose-600' : 'text-purple-700'
              }`}>
                {hasPrev ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%` : 'Ổn định'}
              </h3>
            </div>
            <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl border border-purple-100/80 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
            <span>Kỳ đối chiếu: {periodLabel}</span>
            <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
              Khu Vực 12
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Product Mix Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Cơ Cấu Sản Phẩm Chiến Lược
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Key Models
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Tỷ trọng đóng góp vào tổng Sell Out toàn vùng
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center sm:text-left">
          {/* Reno */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="font-semibold text-emerald-400">Reno Series</span>
              <span className="font-mono">{renoShare.toFixed(1)}%</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {totalReno} <span className="text-xs font-normal text-slate-400">máy</span>
            </div>
          </div>

          {/* A7PRO */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="font-semibold text-blue-400">A7PRO Series</span>
              <span className="font-mono">{a7Share.toFixed(1)}%</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {totalA7} <span className="text-xs font-normal text-slate-400">máy</span>
            </div>
          </div>

          {/* Cuong Luc */}
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="font-semibold text-amber-400">Kính Cường Lực</span>
              <span className="font-mono">{clAttachRate.toFixed(1)}% gắn kèm</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-white">
              {totalCL} <span className="text-xs font-normal text-slate-400">cái</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
