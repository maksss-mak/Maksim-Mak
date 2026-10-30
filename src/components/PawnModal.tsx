import React, { useState } from 'react';
import { X, Play, FileCode, CheckCircle2 } from 'lucide-react';
import { PAWN_PRESETS } from '../data/botData';
import { PawnBuildConfig } from '../types';

interface PawnModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onRunCompilation: (title: string, code: string, filename: string, config: PawnBuildConfig) => void;
}

export const PawnModal: React.FC<PawnModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onRunCompilation,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(PAWN_PRESETS[0]);
  const [code, setCode] = useState(PAWN_PRESETS[0].code);
  const [includes, setIncludes] = useState<PawnBuildConfig['includes']>('CRMP 0.3.7 R1');

  if (!isOpen) return null;

  const handleSelectPreset = (p: typeof PAWN_PRESETS[0]) => {
    setSelectedPreset(p);
    setCode(p.code);
  };

  const handleCompile = () => {
    onRunCompilation(selectedPreset.title, code, selectedPreset.filename, {
      includes,
      debugLevel: '-d3',
      optimize: true,
      warningsLevel: '-w2',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDarkTheme ? 'bg-[#17212b] border-[#242f3d] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1a2530]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">📜 PAWN Compiler | Сборка .amx скриптов</h3>
              <p className="text-[11px] opacity-70">Серверный компилятор pawncc для CRMP 0.3.7</p>
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

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Presets */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1.5 block">
              Выберите готовый скрипт:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PAWN_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    selectedPreset.id === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium ring-1 ring-emerald-500'
                      : isDarkTheme
                      ? 'border-[#242f3d] bg-[#1e2a38] text-slate-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-[10px] font-mono opacity-70 mt-0.5">{p.filename}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Includes selection */}
          <div>
            <label className="text-xs font-semibold block opacity-80 mb-1">
              Пакет инклюдов:
            </label>
            <select
              value={includes}
              onChange={(e) => setIncludes(e.target.value as PawnBuildConfig['includes'])}
              className={`w-full p-2 rounded-xl text-xs outline-none border ${
                isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <option value="CRMP 0.3.7 R1">CRMP 0.3.7 R1 (Стандарт Криминальная Россия)</option>
              <option value="CRMP 0.3.7 R3">CRMP 0.3.7 R3 (Обновленный пакет с фиксами)</option>
              <option value="Open.MP v1.2">Open.MP v1.2 Modern Runtime</option>
              <option value="Standard SA-MP">Standard SA-MP 0.3.7 R2</option>
            </select>
          </div>

          {/* Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold opacity-80">
                Код скрипта (pawn):
              </label>
              <span className="text-[11px] font-mono text-emerald-400">{selectedPreset.filename}</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              spellCheck={false}
              className={`w-full p-3 rounded-2xl font-mono text-xs outline-none border resize-none leading-relaxed ${
                isDarkTheme
                  ? 'bg-[#0f1722] border-[#243447] text-emerald-200 focus:border-emerald-500'
                  : 'bg-slate-900 border-slate-700 text-emerald-100 focus:border-emerald-500'
              }`}
            />
          </div>
        </div>

        <div
          className={`p-3.5 border-t flex items-center justify-between ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1a2530]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-[11px] opacity-70 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pawn Compiler 3.2.3664</span>
          </div>
          <button
            onClick={handleCompile}
            className="px-5 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Скомпилировать в .amx</span>
          </button>
        </div>
      </div>
    </div>
  );
};
