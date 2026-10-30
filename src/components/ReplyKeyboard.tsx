import React from 'react';
import { REPLY_KEYBOARD } from '../data/botData';

interface ReplyKeyboardProps {
  isOpen: boolean;
  isDarkTheme: boolean;
  onButtonClick: (label: string) => void;
}

export const ReplyKeyboard: React.FC<ReplyKeyboardProps> = ({
  isOpen,
  isDarkTheme,
  onButtonClick,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`p-2 border-t select-none transition-colors ${
        isDarkTheme
          ? 'bg-[#17212b] border-[#0e1621]'
          : 'bg-[#f4f4f5] border-slate-200'
      }`}
    >
      <div className="max-w-2xl mx-auto space-y-1.5">
        {REPLY_KEYBOARD.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
            }}
          >
            {row.map((btnLabel, btnIdx) => (
              <button
                key={btnIdx}
                onClick={() => onButtonClick(btnLabel)}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-sm active:scale-[0.98] truncate ${
                  isDarkTheme
                    ? 'bg-[#242f3d] hover:bg-[#2e3b4d] text-slate-100 border border-[#2d3a4b]'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-slate-200'
                }`}
              >
                {btnLabel}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
