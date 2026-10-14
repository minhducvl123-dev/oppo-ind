import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check, 
  RotateCcw,
  Zap,
  TrendingUp,
  PackageCheck,
  Target
} from 'lucide-react';
import { StoreItem, ChatMessage } from '../types';

interface GeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: StoreItem[];
  currentMonth: string;
  currentWeek: string;
  periodLabel: string;
}

export const GeminiModal: React.FC<GeminiModalProps> = ({
  isOpen,
  onClose,
  currentData,
  currentMonth,
  currentWeek,
  periodLabel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Xin chào anh/chị Quản lý! 👋
Tôi là Trợ lý Chuyên gia Gemini AI phụ trách Giám sát Chuỗi Cung Ứng & Phân Tích Bán Hàng OPPO khu vực Cần Thơ - Hậu Giang.

Tôi đã đồng bộ toàn bộ số liệu của kỳ **${periodLabel}** (${currentData.length} đại lý). Anh/chị cần tôi phân tích điểm sáng, rà soát tỷ lệ tồn kho hay lập kế hoạch thúc đẩy số bán cho dòng máy nào?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  // Compute context for server
  const getContextPayload = () => {
    const totalSO = currentData.reduce((acc, c) => acc + Number(c.sellOut || 0), 0);
    const totalSI = currentData.reduce((acc, c) => acc + Number(c.sellIn || 0), 0);
    const totalReno = currentData.reduce((acc, c) => acc + Number(c.reno || 0), 0);
    const totalA7 = currentData.reduce((acc, c) => acc + Number(c.a7pro || 0), 0);
    const totalCL = currentData.reduce((acc, c) => acc + Number(c.cuongLuc || 0), 0);
    const ratio = totalSI > 0 ? ((totalSO / totalSI) * 100).toFixed(1) : '0';

    const topDealers = [...currentData]
      .sort((a, b) => b.sellOut - a.sellOut)
      .slice(0, 5)
      .map((d) => ({
        shop: d.shop,
        sellOut: d.sellOut,
        sellIn: d.sellIn,
        tier: d.tier,
      }));

    const lowDealers = [...currentData]
      .filter((d) => d.sellIn > 0)
      .sort((a, b) => (a.sellOut / a.sellIn) - (b.sellOut / b.sellIn))
      .slice(0, 5)
      .map((d) => ({
        shop: d.shop,
        sellOut: d.sellOut,
        sellIn: d.sellIn,
        ratio: ((d.sellOut / d.sellIn) * 100).toFixed(1) + '%',
      }));

    return {
      period: periodLabel,
      weekLabel: currentWeek === 'all' ? 'Cả tháng' : `Tuần ${currentWeek.replace('w', '')}`,
      totalSO,
      totalSI,
      totalReno,
      totalA7,
      totalCL,
      ratio,
      storeCount: currentData.length,
      topDealers,
      lowDealers,
    };
  };

  const handleSend = async (customPrompt?: string) => {
    const promptToSend = (customPrompt || input).trim();
    if (!promptToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          context: getContextPayload(),
          history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.error || 'Không nhận được câu trả lời từ máy chủ.';

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: '⚠️ Không thể kết nối với máy chủ AI. Vui lòng kiểm tra lại đường truyền mạng hoặc thử lại.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        text: `Đã làm mới cuộc hội thoại! Tôi sẵn sàng phân tích dữ liệu kỳ **${periodLabel}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const quickPrompts = [
    {
      label: '🏆 Phân tích Top Đại Lý',
      text: 'Hãy phân tích chi tiết các đại lý top đầu có Sell Out tốt nhất trong kỳ này, chỉ rõ thế mạnh và điểm có thể tối ưu hơn.',
    },
    {
      label: '📦 Cảnh Báo Tồn Kho',
      text: 'Đánh giá tỷ lệ Sell Out / Sell In toàn khu vực, chỉ ra các shop có nguy cơ ứ đọng hàng hoặc cháy hàng cần điều chuyển gấp.',
    },
    {
      label: '🚀 Chiến Lược Reno & A7PRO',
      text: 'Đề xuất chiến lược bán lẻ và kích cầu tuần tới cho 2 dòng máy chủ lực Reno và A7PRO tại thị trường Cần Thơ & Hậu Giang.',
    },
    {
      label: '🎯 Kế Hoạch Đạt Chỉ Tiêu',
      text: 'Tư vấn kế hoạch phân bổ nguồn lực và nhân sự PG/PB cho các đại lý Cấp S và Cấp A để bứt phá doanh số cuối tháng.',
    },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col h-[650px] max-h-[92vh] overflow-hidden border border-purple-100 ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 text-white flex justify-between items-center shadow-md relative">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 text-purple-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg tracking-tight">
                  Trợ Lý Chuyên Gia Gemini AI
                </h3>
                <span className="bg-purple-400/30 text-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-purple-300/30">
                  3.8 Flash
                </span>
              </div>
              <p className="text-xs text-purple-100/90">
                Phân tích chuỗi cung ứng & chiến lược bán hàng OPPO Cần Thơ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleResetChat}
              title="Làm mới hội thoại"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Đóng"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/70">
          {messages.map((m) => {
            const isBot = m.role === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                <div
                  className={`p-2.5 rounded-2xl flex-shrink-0 shadow-xs ${
                    isBot
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`group relative rounded-2xl px-4 py-3 shadow-xs text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                    isBot
                      ? 'bg-white border border-purple-100 text-slate-800'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <div className="whitespace-pre-line break-words">{m.text}</div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/60 text-[10px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {isBot && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="text-slate-400 hover:text-purple-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Sao chép nội dung"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white p-2.5 rounded-2xl shadow-xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-purple-100 rounded-2xl px-4 py-3 shadow-xs text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span>Gemini AI đang tổng hợp số liệu Cần Thơ & Hậu Giang...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-purple-50/60 border-t border-purple-100 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
          <span className="text-purple-700 font-bold whitespace-nowrap flex items-center gap-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-purple-600" /> Gợi ý câu hỏi:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              disabled={isLoading}
              className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all duration-150 font-medium shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
            placeholder="Hỏi chuyên gia Gemini AI về doanh số, tồn kho, chiến lược..."
            className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition disabled:opacity-60"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
