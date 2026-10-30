import React, { useState, useRef } from 'react';
import { Send, Paperclip, LayoutGrid, Terminal, Mic } from 'lucide-react';
import { BOT_INFO } from '../data/botData';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload: (file: File) => void;
  toggleReplyKeyboard: () => void;
  isReplyKeyboardOpen: boolean;
  isDarkTheme: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  toggleReplyKeyboard,
  isReplyKeyboardOpen,
  isDarkTheme,
}) => {
  const [text, setText] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
    setShowCommands(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleSelectCommand = (cmd: string) => {
    onSendMessage(cmd);
    setShowCommands(false);
  };

  return (
    <div className="relative select-none">
      {/* Commands Popup list */}
      {showCommands && (
        <div
          className={`absolute bottom-full left-0 right-0 mb-1 rounded-2xl shadow-xl border overflow-hidden backdrop-blur-md z-30 max-h-72 overflow-y-auto ${
            isDarkTheme
              ? 'bg-[#17212b]/95 border-[#242f3d] text-white'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          <div
            className={`px-3 py-2 text-xs font-semibold tracking-wider uppercase border-b flex items-center justify-between ${
              isDarkTheme ? 'border-[#242f3d] text-slate-400' : 'border-slate-100 text-slate-500'
            }`}
          >
            <span>Команды @Yankyzzbot</span>
            <button
              onClick={() => setShowCommands(false)}
              className="hover:underline text-[11px] normal-case"
            >
              Закрыть
            </button>
          </div>
          <div className="p-1 space-y-0.5">
            {BOT_INFO.commands.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectCommand(item.command)}
                className={`w-full px-3 py-2 rounded-xl text-left flex items-start gap-2.5 text-xs transition-colors ${
                  isDarkTheme ? 'hover:bg-[#242f3d]' : 'hover:bg-slate-100'
                }`}
              >
                <span className="font-mono font-semibold text-sky-400 shrink-0">
                  {item.command}
                </span>
                <span className="opacity-80 truncate">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".zip,.cpp,.c,.h,.pwn,.txt,.ini,.json"
      />

      {/* Input container */}
      <div
        className={`p-2.5 sm:p-3 flex items-center gap-2 border-t transition-colors ${
          isDarkTheme ? 'bg-[#17212b] border-[#0e1621]' : 'bg-white border-slate-200'
        }`}
      >
        {/* File Attach Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить архив (.zip), C++ (.cpp) или PAWN (.pwn) файл"
          className={`p-2 rounded-full transition-colors ${
            isDarkTheme
              ? 'hover:bg-[#242f3d] text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <Paperclip className="w-5 h-5 rotate-45" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value === '/') {
                setShowCommands(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение или выберите команду..."
            className={`w-full px-4 py-2.5 text-sm rounded-2xl outline-none transition-all ${
              isDarkTheme
                ? 'bg-[#242f3d] text-white placeholder-slate-400 focus:ring-1 focus:ring-sky-500'
                : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-1 focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Slash Command Toggle */}
        <button
          type="button"
          onClick={() => setShowCommands(!showCommands)}
          title="Список команд бота"
          className={`p-2 rounded-full transition-colors ${
            showCommands
              ? 'bg-sky-500 text-white'
              : isDarkTheme
              ? 'hover:bg-[#242f3d] text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-5 h-5" />
        </button>

        {/* Reply Keyboard Toggle */}
        <button
          type="button"
          onClick={toggleReplyKeyboard}
          title={isReplyKeyboardOpen ? 'Скрыть панель кнопок' : 'Показать панель кнопок'}
          className={`p-2 rounded-full transition-colors ${
            isReplyKeyboardOpen
              ? 'bg-sky-500/20 text-sky-400'
              : isDarkTheme
              ? 'hover:bg-[#242f3d] text-slate-400 hover:text-white'
              : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Send / Mic Button */}
        {text.trim() ? (
          <button
            type="button"
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 active:scale-95 transition-all"
            title="Отправить"
          >
            <Send className="w-4 h-4 translate-x-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSendMessage('Привет, бот!')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isDarkTheme
                ? 'hover:bg-[#242f3d] text-slate-400'
                : 'hover:bg-slate-100 text-slate-500'
            }`}
            title="Голосовое сообщение (симуляция)"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
