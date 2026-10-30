import React from 'react';
import { Volume2, VolumeX, Smartphone, Monitor, Info, Moon, Sun, ShieldCheck, ShoppingBag, Plus } from 'lucide-react';
import { BOT_INFO } from '../data/botData';

interface TelegramHeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenInfo: () => void;
  userBalance?: number;
  onOpenCatalog?: () => void;
  onOpenDeposit?: () => void;
}

export const TelegramHeader: React.FC<TelegramHeaderProps> = ({
  soundEnabled,
  onToggleSound,
  isMobileFrame,
  onToggleFrame,
  isDarkTheme,
  onToggleTheme,
  onOpenInfo,
  userBalance = 150,
  onOpenCatalog,
  onOpenDeposit,
}) => {
  return (
    <header
      className={`px-3 sm:px-4 py-2.5 flex items-center justify-between border-b select-none transition-colors ${
        isDarkTheme
          ? 'bg-[#17212b] border-[#0e1621] text-white'
          : 'bg-[#ffffff] border-slate-200 text-slate-800 shadow-sm'
      }`}
    >
      {/* Bot Identity */}
      <div
        onClick={onOpenInfo}
        className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group hover:opacity-95 transition-opacity min-w-0"
        title="Информация о боте"
      >
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-orange-600 to-cyan-400 p-[2px] shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-[#0d141e] flex items-center justify-center text-xs font-black tracking-wider text-amber-300">
              NXS
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#17212b] rounded-full animate-pulse" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-xs sm:text-sm tracking-wide truncate flex items-center gap-1">
              {BOT_INFO.name}
            </h1>
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5 shrink-0 ${
                isDarkTheme
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              <ShieldCheck className="w-2.5 h-2.5" /> store
            </span>
          </div>
          <p
            className={`text-[11px] truncate ${
              isDarkTheme ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            @{BOT_INFO.username} • магазин 24/7
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* User Balance Chip */}
        {onOpenDeposit && (
          <button
            onClick={onOpenDeposit}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-95 border ${
              isDarkTheme
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
            title="Пополнить баланс"
          >
            <span>{userBalance.toFixed(0)} ₽</span>
            <Plus className="w-3 h-3 text-sky-400" />
          </button>
        )}

        {/* Catalog Button */}
        {onOpenCatalog && (
          <button
            onClick={onOpenCatalog}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold hidden md:flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isDarkTheme
                ? 'bg-[#242f3d] hover:bg-[#2c394a] text-sky-300 border border-[#2b3a4d]'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
            title="Открыть каталог товаров"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Каталог</span>
          </button>
        )}

        {/* Toggle Sound */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Выключить звук' : 'Включить звук Telegram'}
          className={`p-2 rounded-lg transition-colors ${
            isDarkTheme
              ? 'hover:bg-[#242f3d] text-slate-300'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Toggle Dark / Light */}
        <button
          onClick={onToggleTheme}
          title={isDarkTheme ? 'Светлая тема' : 'Темная тема'}
          className={`p-2 rounded-lg transition-colors hidden sm:block ${
            isDarkTheme
              ? 'hover:bg-[#242f3d] text-amber-300'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Toggle Mobile / Desktop Frame */}
        <button
          onClick={onToggleFrame}
          title={isMobileFrame ? 'Развернуть на весь экран' : 'Включить рамку смартфона'}
          className={`p-2 rounded-lg transition-colors hidden lg:block ${
            isDarkTheme
              ? 'hover:bg-[#242f3d] text-slate-300'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          {isMobileFrame ? (
            <Monitor className="w-4 h-4 text-cyan-400" />
          ) : (
            <Smartphone className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Info button */}
        <button
          onClick={onOpenInfo}
          title="Профиль и канал магазина"
          className={`p-2 rounded-lg transition-colors ${
            isDarkTheme
              ? 'hover:bg-[#242f3d] text-slate-300'
              : 'hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
