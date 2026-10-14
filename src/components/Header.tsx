import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  UploadCloud, 
  PlusCircle, 
  Download, 
  RotateCcw,
  Smartphone,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onOpenGemini: () => void;
  onOpenImport: () => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGemini,
  onOpenImport,
  onOpenAddModal,
  onExportCSV,
  onResetData,
}) => {
  return (
    <header className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg sticky top-0 z-40 border-b border-emerald-600/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5 w-full md:w-auto">
          <div className="bg-white/15 p-2.5 rounded-2xl backdrop-blur-md shadow-inner border border-white/20 flex items-center justify-center text-emerald-200">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                OPPO VIETNAM
              </span>
              <span className="text-xs text-emerald-200/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Cần Thơ & Hậu Giang
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Sales & Supply Chain Intelligence
            </h1>
            <p className="text-xs text-emerald-100/90 hidden sm:block">
              Theo dõi biến động Sell-In / Sell-Out theo Tháng, Tuần & Trợ lý Chuyên gia Gemini AI
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Gemini AI button */}
          <button
            onClick={onOpenGemini}
            className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-purple-900/30 transition-all duration-200 flex items-center space-x-2 border border-purple-400/40 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-purple-200 animate-pulse group-hover:rotate-12 transition-transform" />
            <span>Trợ Lý Gemini AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1.5 right-1.5" />
          </button>

          {/* Import Data button */}
          <button
            onClick={onOpenImport}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 flex items-center space-x-2 active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import Dữ Liệu</span>
          </button>

          {/* Add Dealer button */}
          <button
            onClick={onOpenAddModal}
            className="bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 flex items-center space-x-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>Thêm Đại Lý</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={onExportCSV}
            title="Xuất file CSV báo cáo"
            className="bg-emerald-900/60 hover:bg-emerald-900 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center space-x-1.5 border border-emerald-500/30 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onResetData}
            title="Khôi phục dữ liệu mẫu gốc"
            className="bg-emerald-900/40 hover:bg-emerald-900/80 text-emerald-200 hover:text-white p-2 rounded-xl text-xs transition border border-emerald-500/20 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
