import React, { useState, useEffect } from 'react';
import { X, Store, Check, Smartphone, Layers, ShieldCheck } from 'lucide-react';
import { StoreItem, StoreTier } from '../types';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (store: StoreItem, oldName?: string) => void;
  initialStore: StoreItem | null;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStore,
}) => {
  const [shop, setShop] = useState('');
  const [sellOut, setSellOut] = useState<number>(15);
  const [sellIn, setSellIn] = useState<number>(18);
  const [reno, setReno] = useState<number>(8);
  const [a7pro, setA7pro] = useState<number>(7);
  const [cuongLuc, setCuongLuc] = useState<number>(12);
  const [tier, setTier] = useState<StoreTier>('A');

  useEffect(() => {
    if (initialStore) {
      setShop(initialStore.shop);
      setSellOut(initialStore.sellOut);
      setSellIn(initialStore.sellIn);
      setReno(initialStore.reno);
      setA7pro(initialStore.a7pro);
      setCuongLuc(initialStore.cuongLuc);
      setTier(initialStore.tier);
    } else {
      setShop('');
      setSellOut(15);
      setSellIn(18);
      setReno(8);
      setA7pro(7);
      setCuongLuc(12);
      setTier('A');
    }
  }, [initialStore, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop.trim()) return;

    onSave(
      {
        shop: shop.trim(),
        sellOut: Number(sellOut) || 0,
        sellIn: Number(sellIn) || 0,
        reno: Number(reno) || 0,
        a7pro: Number(a7pro) || 0,
        cuongLuc: Number(cuongLuc) || 0,
        tier,
      },
      initialStore?.shop
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden border border-slate-100 ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <Store className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {initialStore ? 'Chỉnh Sửa Thông Tin Đại Lý' : 'Thêm Đại Lý Mới'}
              </h3>
              <p className="text-xs text-emerald-100">
                Khu vực phân phối Cần Thơ - Hậu Giang
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tên Shop / Đại Lý / Khu Vực *
            </label>
            <input
              type="text"
              required
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="Ví dụ: Minh Phát (Cần Thơ) hoặc Duy Tường - Long Mỹ"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sell Out (Thực Bán) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={sellOut}
                onChange={(e) => setSellOut(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sell In (Nhập Hàng) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={sellIn}
                onChange={(e) => setSellIn(Number(e.target.value))}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-blue-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reno (SL)
              </label>
              <input
                type="number"
                min={0}
                value={reno}
                onChange={(e) => setReno(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                A7PRO (SL)
              </label>
              <input
                type="number"
                min={0}
                value={a7pro}
                onChange={(e) => setA7pro(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Kính Cường Lực
              </label>
              <input
                type="number"
                min={0}
                value={cuongLuc}
                onChange={(e) => setCuongLuc(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Phân Cấp Đại Lý (Tier)
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as StoreTier)}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white cursor-pointer"
            >
              <option value="S">Cấp S (Key Dealer - Doanh số &gt; 20m/tháng)</option>
              <option value="A">Cấp A (Standard Dealer - Doanh số 14-19m/tháng)</option>
              <option value="B">Cấp B (Sub Dealer - Doanh số &lt; 14m/tháng)</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{initialStore ? 'Cập Nhật' : 'Lưu Đại Lý'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
