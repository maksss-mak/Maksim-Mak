import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  Activity,
  Cpu,
  Power,
  Users,
  MessageSquare,
} from 'lucide-react';

interface BotStatus {
  isConnected: boolean;
  tokenConfigured: boolean;
  botUser: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  } | null;
  stats: {
    totalMessages: number;
    totalCallbacks: number;
    activeUsersCount: number;
    buildsTriggered: number;
    startedAt: string;
  };
  hasEnvToken: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  text: string;
  chatId?: number;
  username?: string;
}

interface RealTelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkTheme: boolean;
  onBotStatusChange?: (status: BotStatus) => void;
}

export const RealTelegramModal: React.FC<RealTelegramModalProps> = ({
  isOpen,
  onClose,
  isDarkTheme,
  onBotStatusChange,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testChatId, setTestChatId] = useState('');
  const [testSuccess, setTestSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'logs'>('setup');

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = (await res.json()) as BotStatus;
        setStatus(data);
        if (onBotStatusChange) onBotStatusChange(data);
      }
    } catch {
      // server might still be restarting
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/telegram/logs');
      if (res.ok) {
        const data = (await res.json()) as LogEntry[];
        setLogs(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      fetchLogs();
      const interval = setInterval(() => {
        fetchStatus();
        fetchLogs();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async () => {
    if (!tokenInput.trim()) {
      setErrorMsg('Пожалуйста, введите токен бота');
      return;
    }
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось подключиться к Telegram');
      }
      setTokenInput('');
      fetchStatus();
      fetchLogs();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка подключения';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch('/api/telegram/disconnect', { method: 'POST' });
      fetchStatus();
      fetchLogs();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testChatId.trim()) return;
    try {
      const res = await fetch('/api/telegram/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: testChatId.trim(), text: 'Бот успешно запущен и работает в настоящем Telegram!' }),
      });
      if (res.ok) {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 3000);
      }
    } catch {
      // ignore
    }
  };

  const isConnected = status?.isConnected && status.botUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div
        className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border transition-colors ${
          isDarkTheme ? 'bg-[#17212b] border-[#242f3d] text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDarkTheme ? 'border-[#242f3d] bg-[#1a2530]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Send className="w-4 h-4 translate-x-0.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                Подключение к настоящему Telegram
                {isConnected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </h3>
              <p className="text-[11px] opacity-70">
                Запуск копии бота @nexus_shop_crmp_bot в реальном мессенджере Telegram
              </p>
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

        {/* Tab switcher */}
        <div className={`flex border-b text-xs font-semibold ${isDarkTheme ? 'border-[#242f3d]' : 'border-slate-200'}`}>
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'setup'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Управление ботом</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-3 text-center transition-colors flex items-center justify-center gap-2 border-b-2 ${
              activeTab === 'logs'
                ? 'border-sky-500 text-sky-400 bg-sky-500/10'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Живой лог событий ({logs.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'setup' ? (
            isConnected ? (
              // Connected State
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDarkTheme
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Бот активен и запущен в Telegram!</p>
                      <p className="text-xs opacity-80 mt-0.5">
                        Имя: <b>{status?.botUser?.first_name}</b> • Юзернейм:{' '}
                        <b className="underline">@{status?.botUser?.username}</b>
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://t.me/${status?.botUser?.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all shrink-0"
                  >
                    <span>Открыть в Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Real-time Bot Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 mx-auto mb-1 text-sky-400" />
                    <p className="text-[10px] opacity-70">Сообщений</p>
                    <p className="text-sm font-bold font-mono">{status?.stats?.totalMessages || 0}</p>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Activity className="w-4 h-4 mx-auto mb-1 text-indigo-400" />
                    <p className="text-[10px] opacity-70">Кликов кнопок</p>
                    <p className="text-sm font-bold font-mono">{status?.stats?.totalCallbacks || 0}</p>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                    <p className="text-[10px] opacity-70">Пользователей</p>
                    <p className="text-sm font-bold font-mono">{status?.stats?.activeUsersCount || 0}</p>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-center ${
                      isDarkTheme ? 'bg-[#1e2a38] border-[#293c52]' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <Cpu className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                    <p className="text-[10px] opacity-70">Сборок через TG</p>
                    <p className="text-sm font-bold font-mono">{status?.stats?.buildsTriggered || 0}</p>
                  </div>
                </div>

                {/* Test message form */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    isDarkTheme ? 'bg-[#1e2a38]/60 border-[#293c52]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <label className="text-xs font-semibold block opacity-80">
                    Отправить тестовое сообщение в ваш чат Telegram:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testChatId}
                      onChange={(e) => setTestChatId(e.target.value)}
                      placeholder="Ваш Chat ID или Telegram User ID"
                      className={`flex-1 p-2 rounded-xl text-xs outline-none border font-mono ${
                        isDarkTheme ? 'bg-[#0f1722] border-[#243447] text-white' : 'bg-white border-slate-200'
                      }`}
                    />
                    <button
                      onClick={handleSendTestMessage}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-sm"
                    >
                      {testSuccess ? 'Отправлено! ✓' : 'Отправить'}
                    </button>
                  </div>
                  <p className="text-[10px] opacity-60">
                    (Узнать свой ID можно в боте @userinfobot или просто написав команду /start вашему боту)
                  </p>
                </div>

                {/* Disconnect button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>Остановить бота в Telegram</span>
                  </button>
                </div>
              </div>
            ) : (
              // Setup Instructions & Token Input
              <div className="space-y-4">
                <div
                  className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-2.5 ${
                    isDarkTheme ? 'bg-[#1e2a38]/80 border-[#293c52] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <p className="font-semibold text-sm text-sky-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Как подключить за 1 минуту:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>
                      Откройте в Telegram официального бота{' '}
                      <a
                        href="https://t.me/BotFather"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 font-bold underline inline-flex items-center gap-0.5"
                      >
                        @BotFather <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      Отправьте команду <code>/newbot</code>
                    </li>
                    <li>
                      Укажите название бота (например: <b>NEXUS SHOP | CRMP</b>)
                    </li>
                    <li>
                      Придумайте юзернейм, оканчивающийся на <code>bot</code> (например:{' '}
                      <code>nexus_shop_crmp_bot</code>)
                    </li>
                    <li>
                      Скопируйте выданный <b>HTTP API Token</b> (вида{' '}
                      <code>123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ</code>) и вставьте в поле ниже:
                    </li>
                  </ol>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Token Input Form */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold block opacity-80">
                    Токен вашего бота от @BotFather:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      className={`flex-1 p-3 rounded-xl text-xs outline-none border font-mono ${
                        isDarkTheme
                          ? 'bg-[#0f1722] border-[#243447] text-white focus:border-sky-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                      }`}
                    />
                    <button
                      onClick={handleConnect}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all shrink-0"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Подключение...</span>
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4" />
                          <span>Запустить бота в Telegram</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] opacity-60">
                    🔒 Токен используется только локально вашим сервером для связи с Telegram Bot API.
                  </p>
                </div>
              </div>
            )
          ) : (
            // Logs tab
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>События в реальном времени:</span>
                <button
                  onClick={fetchLogs}
                  className="hover:underline flex items-center gap-1 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" /> Обновить
                </button>
              </div>

              <div
                className={`p-3 rounded-2xl border font-mono text-xs max-h-80 overflow-y-auto space-y-1.5 ${
                  isDarkTheme ? 'bg-[#0a0f17] border-[#1e293b]' : 'bg-slate-900 text-slate-100 border-slate-700'
                }`}
              >
                {logs.length === 0 ? (
                  <p className="opacity-50 text-center py-6">Пока нет событий. Отправьте боту команду в Telegram!</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                      <span className="opacity-40 text-[10px] shrink-0">{log.timestamp}</span>
                      <span
                        className={`text-[10px] px-1 rounded uppercase shrink-0 ${
                          log.type === 'error'
                            ? 'bg-rose-500/20 text-rose-400'
                            : log.type === 'message'
                            ? 'bg-sky-500/20 text-sky-400'
                            : log.type === 'callback'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="break-all">{log.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
