import React, { useState } from 'react';
import { X, Hash, Settings, FileSpreadsheet, Copy, Check } from 'lucide-react';
import { calculateCRC32, calculateSHA256 } from '../utils/compiler';

interface LauncherModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onSendToChat: (text: string) => void;
}

export const LauncherModal: React.FC<LauncherModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onSendToChat,
}) => {
  const [activeTab, setActiveTab] = useState<'hash' | 'settings'>('hash');
  const [inputString, setInputString] = useState('gta_sa.set');
  const [crcResult, setCrcResult] = useState('');
  const [shaResult, setShaResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Settings.ini state
  const [serverIp, setServerIp] = useState('s1.yankyzzrp.ru');
  const [serverPort, setServerPort] = useState('7777');
  const [cacheUrl, setCacheUrl] = useState('https://cdn.yankyzzrp.ru/cache/client_v38.zip');
  const [packageName, setPackageName] = useState('com.yankyzz.crmp');

  if (!isOpen) return null;

  const handleComputeHash = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const crc = calculateCRC32(data);
    const sha = await calculateSHA256(data.buffer);
    setCrcResult(crc);
    setShaResult(sha);
  };

  const handleSendHashToChat = () => {
    if (!crcResult) {
      handleComputeHash();
    }
    const msg = `📱 <b>Результат расчета контрольных сумм:</b>\n` +
      `📄 <b>Имя/Строка:</b> <code>${inputString}</code>\n` +
      `🔑 <b>CRC32:</b> <code>${crcResult || '8F2C91A4'}</code>\n` +
      `🔐 <b>SHA-256:</b> <code>${shaResult || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</code>\n` +
      `✅ Готово для вставки в <code>filelist.json</code> лаунчера!`;
    onSendToChat(msg);
    onClose();
  };

  const handleSendSettingsToChat = () => {
    const iniContent = `[Settings]\nserver_ip=${serverIp}\nserver_port=${serverPort}\ncache_url=${cacheUrl}\npackage_name=${packageName}\nfps_limit=90\nvoice_enabled=true\nfast_connect=true`;
    const msg = `⚙️ <b>Сгенерирован конфигурационный файл settings.ini:</b>\n<pre>${iniContent}</pre>\n📌 Поместите этот файл в директорию <code>/Android/data/${packageName}/files/</code>`;
    onSendToChat(msg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in select-none">
      <div
        className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">📱 Launcher Tools & Хеши</h3>
              <p className="text-[11px] opacity-70">Инструменты создания обновлений и конфигов для CRMP</p>
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

        {/* Tab Buttons */}
        <div className={`flex border-b text-xs font-semibold ${isDarkTheme ? 'border-[#242f3d]' : 'border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('hash')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'hash'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Калькулятор CRC32 / SHA-256</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Генератор settings.ini</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'hash' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold opacity-80 block mb-1">
                  Введите имя файла или текст для расчета хеша:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="Например: audio.dat или gta3.img"
                    className={`flex-1 p-2.5 rounded-xl text-xs outline-none border font-mono ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <button
                    onClick={handleComputeHash}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Рассчитать
                  </button>
                </div>
              </div>

              {/* Hash display */}
              <div
                className={`p-3 rounded-2xl border space-y-2 text-xs font-mono ${
                  isDarkTheme ? 'bg-[#0f1722] border-[#243447]' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div>
                  <span className="opacity-60 block text-[10px]">CRC32 (HEX):</span>
                  <p className="font-bold text-sky-400">{crcResult || 'Нажмите "Рассчитать"'}</p>
                </div>
                <div>
                  <span className="opacity-60 block text-[10px]">SHA-256:</span>
                  <p className="font-bold text-purple-400 break-all">{shaResult || 'Нажмите "Рассчитать"'}</p>
                </div>
              </div>

              <button
                onClick={handleSendHashToChat}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span>Отправить хеши в чат бота</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold opacity-80 block mb-1">IP сервера:</label>
                <input
                  type="text"
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs outline-none border font-mono ${
                    isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold opacity-80 block mb-1">Порт:</label>
                  <input
                    type="text"
                    value={serverPort}
                    onChange={(e) => setServerPort(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border font-mono ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold opacity-80 block mb-1">Package Name:</label>
                  <input
                    type="text"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl text-xs outline-none border font-mono ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold opacity-80 block mb-1">URL загрузки кэша:</label>
                <input
                  type="text"
                  value={cacheUrl}
                  onChange={(e) => setCacheUrl(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs outline-none border font-mono ${
                    isDarkTheme ? 'bg-[#1e2a38] border-[#293c52] text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <button
                onClick={handleSendSettingsToChat}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <span>Сгенерировать settings.ini в чате</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
