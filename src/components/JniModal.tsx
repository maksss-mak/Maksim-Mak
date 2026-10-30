import React, { useState } from 'react';
import { X, Play, Code2, Cpu, HardDrive, Layers } from 'lucide-react';
import { JNI_PRESETS, NDK_VERSIONS, ARCHITECTURES } from '../data/botData';
import { JniBuildConfig } from '../types';

interface JniModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onRunCompilation: (presetTitle: string, code: string, config: JniBuildConfig) => void;
  currentConfig: JniBuildConfig;
  onChangeConfig: (newConfig: Partial<JniBuildConfig>) => void;
}

export const JniModal: React.FC<JniModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onRunCompilation,
  currentConfig,
  onChangeConfig,
}) => {
  const [selectedPreset, setSelectedPreset] = useState(JNI_PRESETS[0]);
  const [customCode, setCustomCode] = useState(JNI_PRESETS[0].code);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof JNI_PRESETS[0]) => {
    setSelectedPreset(preset);
    setCustomCode(preset.code);
    onChangeConfig({ libraryName: preset.filename });
  };

  const handleStart = () => {
    onRunCompilation(selectedPreset.title, customCode, currentConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
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
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">🛠 JNI Builder | Конфигуратор и компилятор</h3>
              <p className="text-[11px] opacity-70">Сборка нативных C/C++ библиотек под Android CRMP</p>
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
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1.5 block">
              1. Выберите готовый C++ шаблон хука или введите свой:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {JNI_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    selectedPreset.id === p.id
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300 font-medium ring-1 ring-sky-500'
                      : isDarkTheme
                      ? 'border-[#242f3d] bg-[#1e2a38] hover:border-slate-600 text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="font-semibold truncate">{p.title}</p>
                  <p className="text-[10px] font-mono opacity-70 mt-0.5">{p.filename}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Config Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* NDK Version */}
            <div>
              <label className="text-xs font-semibold flex items-center gap-1.5 opacity-80 mb-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> Версия Android NDK:
              </label>
              <select
                value={currentConfig.ndkVersion}
                onChange={(e) => onChangeConfig({ ndkVersion: e.target.value as JniBuildConfig['ndkVersion'] })}
                className={`w-full p-2 rounded-xl text-xs outline-none border ${
                  isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {NDK_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            {/* Architecture */}
            <div>
              <label className="text-xs font-semibold flex items-center gap-1.5 opacity-80 mb-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" /> Архитектура (ABI):
              </label>
              <select
                value={currentConfig.arch}
                onChange={(e) => onChangeConfig({ arch: e.target.value as JniBuildConfig['arch'] })}
                className={`w-full p-2 rounded-xl text-xs outline-none border ${
                  isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {ARCHITECTURES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Code Viewer / Editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <HardDrive className="w-3.5 h-3.5 text-purple-400" /> Исходный код C/C++ (jni/main.cpp):
              </label>
              <span className="text-[11px] font-mono text-sky-400">{selectedPreset.filename}</span>
            </div>
            <textarea
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              rows={8}
              spellCheck={false}
              className={`w-full p-3 rounded-2xl font-mono text-xs outline-none border resize-none leading-relaxed ${
                isDarkTheme
                  ? 'bg-[#0f1722] border-[#243447] text-sky-200 focus:border-sky-500'
                  : 'bg-slate-900 border-slate-700 text-sky-100 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3.5 border-t flex items-center justify-between ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1a2530]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="text-[11px] opacity-70 hidden sm:block">
            Готовый .so файл будет скомпилирован через облачный воркер
          </div>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-medium text-xs bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Запустить компиляцию в боте</span>
          </button>
        </div>
      </div>
    </div>
  );
};
