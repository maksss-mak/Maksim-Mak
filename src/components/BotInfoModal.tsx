import React from 'react';
import { X, ExternalLink, Copy, Check, ShieldCheck, ShoppingCart, Star, Users, RefreshCw, Zap } from 'lucide-react';
import { BOT_INFO } from '../data/botData';

interface BotInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onResetChat: () => void;
}

export const BotInfoModal: React.FC<BotInfoModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onResetChat,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://t.me/${BOT_INFO.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDarkTheme
            ? 'bg-[#17212b] border-[#242f3d] text-white'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header Banner */}
        <div className="relative h-28 bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 flex items-end p-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Avatar & Info */}
        <div className="px-5 pb-5 -mt-10 relative">
          <div className="flex justify-between items-end mb-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-cyan-500 p-1 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full rounded-[14px] bg-[#0d141e] flex items-center justify-center text-xl font-black text-amber-300">
                NXS
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                  isDarkTheme
                    ? 'bg-[#242f3d] hover:bg-[#2d3a4b] border-[#2f3d4f] text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Скопировано!' : 'Ссылка'}</span>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{BOT_INFO.name}</h2>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> verified store
              </span>
            </div>
            <p className="text-xs text-sky-400 font-mono mt-0.5">@{BOT_INFO.username}</p>
          </div>

          {/* Description */}
          <div
            className={`mt-4 p-3 rounded-2xl text-xs leading-relaxed ${
              isDarkTheme ? 'bg-[#242f3d]/60 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            <p className="font-semibold text-slate-100 mb-1">Официальный магазин NEXUS SHOP CRMP</p>
            <p>{BOT_INFO.tagline}</p>
            <p className="mt-2 text-[11px] opacity-75">
              Поддержка: <span className="text-sky-400 font-semibold">{BOT_INFO.supportUser}</span> • Канал: <span className="text-sky-400 font-semibold">{BOT_INFO.channel}</span>
            </p>
          </div>

          {/* Store Stats */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] opacity-70">Всего заказов</p>
                <p className="text-xs font-bold font-mono">{BOT_INFO.stats.totalOrders}</p>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Star className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] opacity-70">Отзывов</p>
                <p className="text-xs font-bold font-mono">{BOT_INFO.stats.totalReviews}</p>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <p className="text-[10px] opacity-70">Клиентов</p>
                <p className="text-xs font-bold font-mono">{BOT_INFO.stats.totalUsers}</p>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-teal-400 shrink-0" />
              <div>
                <p className="text-[10px] opacity-70">Выдача товаров</p>
                <p className="text-xs font-bold text-teal-400">{BOT_INFO.stats.avgDeliveryTime}</p>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="mt-4 space-y-2">
            <a
              href="https://t.me/nexus_crmp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20"
            >
              <span>Перейти в Telegram-канал @nexus_crmp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onResetChat();
                  onClose();
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border ${
                  isDarkTheme
                    ? 'bg-[#242f3d] hover:bg-[#2d3a4b] border-[#2f3d4f] text-slate-300'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Перезапустить диалог (/start)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
