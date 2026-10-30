import React, { useState } from 'react';
import { X, ShoppingBag, Sparkles, Tag, ArrowRight, ShieldCheck, Zap, Flame, Crown, Package } from 'lucide-react';
import { SHOP_CATEGORIES, SHOP_PRODUCTS, ShopProduct } from '../data/botData';

interface ShopCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  userBalance: number;
  onBuyProduct: (product: ShopProduct) => void;
  onOpenDeposit: () => void;
}

export const ShopCatalogModal: React.FC<ShopCatalogModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  userBalance,
  onBuyProduct,
  onOpenDeposit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('currency');

  if (!isOpen) return null;

  const currentProducts = SHOP_PRODUCTS.filter((p) => p.categoryId === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div
        className={`w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col rounded-[28px] shadow-2xl overflow-hidden border transition-all ${
          isDarkTheme
            ? 'bg-[#17212b] border-[#242f3d] text-white ring-1 ring-white/5'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        {/* Top App Bar */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1e2c3a]/80 backdrop-blur-md' : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base tracking-wide">NEXUS SHOP</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> OFFICIAL
                </span>
              </div>
              <p className="text-xs opacity-70 mt-0.5">
                Премиум маркет виртов, софта и аккаунтов CRMP 24/7
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Balance Pill */}
            <button
              onClick={onOpenDeposit}
              className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-sm ${
                isDarkTheme
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
              }`}
            >
              <span className="opacity-75">Баланс:</span>
              <span className="font-mono text-sm font-black text-amber-400">
                {userBalance.toFixed(2)} ₽
              </span>
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black ml-0.5 shadow">
                +
              </span>
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                isDarkTheme ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div
          className={`px-4 py-3 border-b flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none ${
            isDarkTheme ? 'border-[#242f3d] bg-[#131c25]' : 'border-slate-200 bg-slate-100/80'
          }`}
        >
          {SHOP_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 shadow-lg shadow-orange-500/25 font-black scale-[1.02]'
                    : isDarkTheme
                    ? 'bg-[#1e2a38] text-slate-300 hover:bg-[#273648] border border-white/5'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentProducts.map((prod) => {
              const canAfford = userBalance >= prod.price;

              return (
                <div
                  key={prod.id}
                  className={`group rounded-3xl border overflow-hidden transition-all flex flex-col justify-between shadow-lg ${
                    isDarkTheme
                      ? 'bg-[#1e2a38]/60 border-[#2b3a4e] hover:border-amber-500/50 hover:bg-[#1e2a38]'
                      : 'bg-white border-slate-200 hover:border-amber-400 shadow-slate-100'
                  }`}
                >
                  <div>
                    {prod.imageUrl ? (
                      <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                        <img
                          src={prod.imageUrl}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#182330] via-black/20 to-transparent" />
                        {prod.badge && (
                          <span className="absolute top-3 left-3 text-[11px] font-black px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center gap-1 shadow-md">
                            <Flame className="w-3.5 h-3.5 fill-slate-950" />
                            {prod.badge}
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-black/60 text-emerald-400 backdrop-blur-md border border-white/10">
                          {prod.stockCount}
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 pb-2 flex items-center justify-between">
                        {prod.badge ? (
                          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center gap-1 shadow">
                            <Sparkles className="w-3 h-3" />
                            {prod.badge}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            В наличии
                          </span>
                        )}
                        <span className="text-[11px] font-mono opacity-60 font-semibold">{prod.stockCount}</span>
                      </div>
                    )}

                    <div className="p-4 sm:p-5">
                      <h3 className="font-extrabold text-sm sm:text-base leading-snug mb-2 group-hover:text-amber-400 transition-colors">
                        {prod.title}
                      </h3>
                      <p className="text-xs opacity-75 leading-relaxed line-clamp-3">
                        {prod.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom / Price & Buy */}
                  <div
                    className={`p-4 pt-3 border-t flex items-center justify-between gap-3 ${
                      isDarkTheme ? 'border-[#29384c]/60 bg-black/20' : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-lg font-black text-amber-400">
                          {prod.price === 0 ? 'Бесплатно' : `${prod.price} ₽`}
                        </span>
                        {prod.oldPrice && (
                          <span className="text-xs opacity-40 line-through font-mono">
                            {prod.oldPrice} ₽
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onBuyProduct(prod);
                        onClose();
                      }}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black tracking-wide flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        canAfford || prod.price === 0
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/25 font-extrabold'
                          : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/25'
                      }`}
                    >
                      <span>{canAfford || prod.price === 0 ? 'КУПИТЬ' : 'ПОПОЛНИТЬ'}</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Promo Bar */}
        <div
          className={`px-5 py-3 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
            isDarkTheme ? 'border-[#242f3d] bg-[#131c25] text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Tag className="w-4 h-4 text-amber-400" />
            <span>
              Введите промокод <b className="text-amber-400 font-mono tracking-wider bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">NEXUS</b> в чат для получения <b className="text-emerald-400">+150 ₽</b> на баланс!
            </span>
          </div>
          <button
            onClick={() => {
              onOpenDeposit();
              onClose();
            }}
            className="text-amber-400 font-bold hover:underline text-xs flex items-center gap-1 shrink-0"
          >
            <span>Пополнить баланс</span>
            <Zap className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
};
