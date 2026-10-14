import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { StoreItem, StoreTier, WeekKey } from '../types';
import { monthNames } from '../data/initialData';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string;
  currentWeek: WeekKey;
  onImportSuccess: (targetMonth: string, targetWeek: 'w1' | 'w2' | 'w3' | 'w4', stores: StoreItem[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  currentWeek,
  onImportSuccess,
}) => {
  const [targetMonth, setTargetMonth] = useState<string>(currentMonth);
  const [targetWeek, setTargetWeek] = useState<'w1' | 'w2' | 'w3' | 'w4'>(
    currentWeek === 'all' ? 'w1' : currentWeek
  );
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<StoreItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Parse CSV string into StoreItem[]
  const parseCSVToStores = (csvString: string): StoreItem[] => {
    const lines = csvString.split('\n');
    const items: StoreItem[] = [];

    let startIdx = 0;
    if (lines.length > 0) {
      const firstLine = lines[0].toLowerCase();
      if (firstLine.includes('shop') || firstLine.includes('stt') || firstLine.includes('tên') || firstLine.includes('khu vực')) {
        startIdx = 1;
      }
    }

    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle simple CSV / TSV
      const separator = line.includes('\t') ? '\t' : ',';
      const parts = line.split(separator).map((p) => p.trim().replace(/^"|"$/g, ''));

      if (parts.length >= 6) {
        const hasStt = !isNaN(Number(parts[0])) && parts.length >= 7;
        const offset = hasStt ? 1 : 0;

        const shopName = parts[offset];
        const so = Number(parts[offset + 1]) || 0;
        const si = Number(parts[offset + 2]) || so;
        const reno = Number(parts[offset + 3]) || 0;
        const a7 = Number(parts[offset + 4]) || 0;
        const cl = Number(parts[offset + 5]) || 0;
        const rawTier = (parts[offset + 6] || 'A').toUpperCase();

        const tier: StoreTier = ['S', 'A', 'B'].includes(rawTier)
          ? (rawTier as StoreTier)
          : 'A';

        if (shopName) {
          items.push({
            shop: shopName,
            sellOut: so,
            sellIn: si,
            reno,
            a7pro: a7,
            cuongLuc: cl,
            tier,
          });
        }
      }
    }

    return items;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setFileName(file.name);
    const lower = file.name.toLowerCase();

    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const workbook = XLSX.read(buffer, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvData = XLSX.utils.sheet_to_csv(firstSheet);
          setRawText(csvData);
          const stores = parseCSVToStores(csvData);
          setParsedPreview(stores);
          if (stores.length === 0) {
            setErrorMsg('Đọc được file nhưng không khớp các cột dữ liệu. Vui lòng xem file mẫu.');
          }
        } catch (err: any) {
          console.error(err);
          setErrorMsg('Lỗi đọc file Excel: ' + (err?.message || 'Không thể đọc nội dung'));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setRawText(text);
        const stores = parseCSVToStores(text);
        setParsedPreview(stores);
        if (stores.length === 0) {
          setErrorMsg('Đọc được file nhưng không khớp các cột dữ liệu. Vui lòng kiểm tra lại.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    setErrorMsg('');
    const stores = parseCSVToStores(val);
    setParsedPreview(stores);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) {
      setErrorMsg('Vui lòng tải lên file hoặc dán dữ liệu CSV hợp lệ trước khi xác nhận.');
      return;
    }
    onImportSuccess(targetMonth, targetWeek, parsedPreview);
    onClose();
  };

  const downloadSampleTemplate = () => {
    const header = 'STT,Khu Vực / Tên Shop,SellOut,SellIn,Reno,A7Pro,CuongLuc,Phân Cấp\r\n';
    const sampleRows = [
      '1,Minh Phát (Cần Thơ),22,25,12,10,18,S',
      '2,Hải Đăng Mobile (Ninh Kiều),18,20,9,9,15,A',
      '3,Quốc Hưng - Ô Môn,15,16,7,8,12,A',
      '4,Vĩnh Thuận - Long Mỹ,11,14,5,6,9,B',
      '5,Gia Huy - Vị Thanh,26,27,15,11,23,S',
    ].join('\r\n');

    const csvContent = '\uFEFF' + header + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mau_import_oppo_tuan.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <UploadCloud className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                Import Dữ Liệu Bán Hàng Tuần
              </h3>
              <p className="text-xs text-amber-100">
                Hỗ trợ file Excel (.xlsx, .xls), CSV hoặc dán trực tiếp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-grow">
          {/* Destination Period Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Kỳ Tháng Ghi Nhận
              </label>
              <select
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white cursor-pointer"
              >
                {Object.entries(monthNames).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                Kỳ Tuần Áp Dụng
              </label>
              <select
                value={targetWeek}
                onChange={(e) => setTargetWeek(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="w1">Tuần 1 (Từ ngày 01 đến 07)</option>
                <option value="w2">Tuần 2 (Từ ngày 08 đến 14)</option>
                <option value="w3">Tuần 3 (Từ ngày 15 đến 21)</option>
                <option value="w4">Tuần 4 (Từ ngày 22 đến hết tháng)</option>
              </select>
            </div>
          </div>

          {/* Upload and Sample Buttons */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                1. Chọn File Hoặc Dán Dữ Liệu
              </label>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-lg flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải File CSV Mẫu Chuẩn</span>
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/20 rounded-2xl p-4 text-center transition group cursor-pointer">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileSpreadsheet className="w-8 h-8 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xs sm:text-sm font-bold text-slate-700">
                {fileName ? fileName : 'Nhấn để chọn file Excel (.xlsx, .xls) hoặc CSV'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hoặc kéo thả file vào khung này
              </p>
            </div>
          </div>

          {/* Raw Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              2. Nội Dung Dữ Liệu CSV
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={handleTextChange}
              placeholder="Tên Shop, SellOut, SellIn, Reno, A7Pro, CuongLuc, Cấp (S/A/B)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white transition"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preview summary */}
          {parsedPreview.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Đã nhận diện thành công: {parsedPreview.length} đại lý
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Ghi vào {targetMonth} ({targetWeek.toUpperCase()})
                </span>
              </div>

              <div className="max-h-28 overflow-y-auto border border-emerald-200/50 rounded-lg bg-white divide-y divide-slate-100 text-xs">
                {parsedPreview.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between text-slate-700">
                    <span className="font-semibold truncate max-w-[200px]">{item.shop}</span>
                    <span className="font-mono text-slate-500">
                      SO: <b className="text-emerald-600">{item.sellOut}</b> | SI: {item.sellIn} | Reno: {item.reno} | Cấp {item.tier}
                    </span>
                  </div>
                ))}
                {parsedPreview.length > 5 && (
                  <div className="p-1.5 text-center text-[11px] text-slate-400 bg-slate-50">
                    ... và {parsedPreview.length - 5} đại lý khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-100 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedPreview.length === 0}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác Nhận Import ({parsedPreview.length} đại lý)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
