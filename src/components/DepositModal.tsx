import React, { useState } from 'react';
import { X, CreditCard, QrCode, CheckCircle2, Gift, Zap, ShieldCheck } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  userBalance: number;
  onAddBalance: (amount: number, reason: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  userBalance,
  onAddBalance,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(300);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<'sbp' | 'card' | 'yoomoney' | 'stars' | 'crypto'>('sbp');
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const finalAmount = customAmount ? Number(customAmount) || 0 : selectedAmount;

  const handleDeposit = () => {
    if (finalAmount <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      onAddBalance(finalAmount, `Пополнение через ${selectedMethod.toUpperCase()}`);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === 'NEXUS' || code === 'CRMP' || code === 'START' || code === 'NEXUS2026') {
      onAddBalance(150, `Активация промокода ${code}`);
      setPromoMessage({ text: 'Промокод активирован! +150.00 ₽ начислено', ok: true });
      setPromoInput('');
    } else {
      setPromoMessage({ text: 'Неверный или устаревший промокод', ok: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div
        className={`w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDarkTheme ? 'bg-[#17212b] border-[#242f3d] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1a2530]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Пополнение баланса</h3>
              <p className="text-[11px] opacity-70">Текущий баланс: {userBalance.toFixed(2)} ₽</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkTheme ? 'hover:bg-[#242f3d] text-slate-400' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Preset Amounts */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70 block mb-2">
              1. Выберите сумму пополнения:
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[100, 300, 500, 1000, 2500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2 px-1 rounded-xl font-bold font-mono text-xs text-center border transition-all ${
                    selectedAmount === amt && !customAmount
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-sky-400 shadow-md shadow-sky-500/20'
                      : isDarkTheme
                      ? 'bg-[#1e2a38] border-[#293c52] text-slate-200 hover:border-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
                >
                  +{amt} ₽
                </button>
              ))}
            </div>

            <div className="mt-2">
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                placeholder="Или укажите свою сумму (в рублях)..."
                className={`w-full p-2.5 rounded-xl text-xs outline-none border font-mono ${
                  isDarkTheme
                    ? 'bg-[#0f1722] border-[#243447] text-white focus:border-sky-500'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70 block mb-2">
              2. Способ оплаты:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSelectedMethod('sbp')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMethod === 'sbp'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : isDarkTheme
                    ? 'bg-[#1e2a38] border-[#293c52] text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">СБП (0% комиссия)</p>
                  <p className="text-[10px] opacity-70">Без комиссии • Мгновенно</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-sky-500/15 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                    : isDarkTheme
                    ? 'bg-[#1e2a38] border-[#293c52] text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold">Карты РФ / МИР</p>
                  <p className="text-[10px] opacity-70">Сбер, Т-Банк, ВТБ, Альфа</p>
                </div>
              </button>
            </div>
          </div>

          {/* Promo code box */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              isDarkTheme ? 'bg-[#1e2a38]/60 border-[#293c52]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
              <Gift className="w-3.5 h-3.5 text-amber-400" /> Есть промокод?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Введите промокод (например: NEXUS)"
                className={`flex-1 p-2 rounded-xl text-xs outline-none border font-mono uppercase ${
                  isDarkTheme ? 'bg-[#0f1722] border-[#243447] text-white' : 'bg-white border-slate-300'
                }`}
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
              >
                Применить
              </button>
            </div>
            {promoMessage && (
              <p
                className={`text-[11px] font-medium flex items-center gap-1 ${
                  promoMessage.ok ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {promoMessage.ok && <CheckCircle2 className="w-3.5 h-3.5" />}
                {promoMessage.text}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1a2530]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] opacity-70">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Безопасный эквайринг</span>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isProcessing || finalAmount <= 0}
            className="px-6 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {isProcessing ? 'Зачисление...' : `Пополнить на +${finalAmount} ₽`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
