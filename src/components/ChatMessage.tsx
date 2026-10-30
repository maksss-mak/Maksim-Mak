import React from 'react';
import { CheckCheck, Download, FileCode, Check, Copy } from 'lucide-react';
import { ChatMessage as ChatMessageType, InlineButton } from '../types';
import { downloadFile } from '../utils/compiler';

interface ChatMessageProps {
  message: ChatMessageType;
  isDarkTheme: boolean;
  onInlineClick: (btn: InlineButton) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isDarkTheme,
  onInlineClick,
}) => {
  const [copied, setCopied] = React.useState(false);
  const isBot = message.sender === 'bot';

  const handleCopy = (text: string) => {
    // Strip HTML tags for clean copy
    const cleanText = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Convert HTML tags safely to React nodes
  const renderFormattedText = (rawText: string) => {
    // We safely parse basic tags: <b>, <code>, <pre>, <i>, <br>
    const lines = rawText.split('\n');

    return lines.map((line, lineIdx) => {
      // Check if it's a pre block or normal line
      return (
        <span key={lineIdx} className="block leading-relaxed">
          <span
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/<b>(.*?)<\/b>/g, '<strong class="font-semibold text-sky-400">$1</strong>')
                .replace(/<i>(.*?)<\/i>/g, '<em class="italic text-slate-300">$1</em>')
                .replace(
                  /<code>(.*?)<\/code>/g,
                  '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-black/30 text-amber-300 border border-white/10">$1</code>'
                ),
            }}
          />
        </span>
      );
    });
  };

  return (
    <div
      className={`flex flex-col mb-3.5 transition-all ${
        isBot ? 'items-start' : 'items-end'
      }`}
    >
      {/* Message Bubble */}
      <div
        className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-sm relative group shadow-sm transition-all ${
          isBot
            ? isDarkTheme
              ? 'bg-[#182533] text-slate-100 rounded-bl-sm border border-[#243447]/60'
              : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200/80 shadow-slate-200'
            : isDarkTheme
            ? 'bg-[#2b5278] text-white rounded-br-sm'
            : 'bg-[#5288c1] text-white rounded-br-sm shadow-blue-200'
        }`}
      >
        {/* Copy button on hover */}
        <button
          onClick={() => handleCopy(message.text)}
          className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
            isDarkTheme ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-black/5 text-slate-500'
          }`}
          title="Скопировать текст"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Status Badge (if any, like Compiling / Ready) */}
        {message.statusBadge && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {message.statusBadge}
            </span>
          </div>
        )}

        {/* Message Body */}
        <div className="space-y-1 select-text">
          {renderFormattedText(message.text)}
        </div>

        {/* File Attachment Card (e.g. compiled .so or .amx) */}
        {message.fileAttachment && (
          <div
            className={`mt-3 p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
              isDarkTheme
                ? 'bg-[#111923] border-[#293c52]'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold truncate">
                  {message.fileAttachment.name}
                </p>
                <p className="text-[11px] opacity-70">
                  {message.fileAttachment.size} • {message.fileAttachment.type.toUpperCase()} binary
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const content = message.fileAttachment?.downloadContent || 'Yankyzz Developer Compiled Binary Mock Content';
                downloadFile(message.fileAttachment!.name, content);
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать</span>
            </button>
          </div>
        )}

        {/* Timestamp & Read Receipts */}
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60 font-mono">
          <span>{message.timestamp}</span>
          {!isBot && <CheckCheck className="w-3.5 h-3.5 text-sky-200" />}
        </div>
      </div>

      {/* Inline Keyboards */}
      {message.replyMarkup?.inline_keyboard && (
        <div className="mt-2 w-full max-w-[92%] sm:max-w-[80%] space-y-1.5">
          {message.replyMarkup.inline_keyboard.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
              }}
            >
              {row.map((btn, btnIdx) => (
                <button
                  key={btnIdx}
                  onClick={() => onInlineClick(btn)}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all text-center truncate flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] ${
                    isDarkTheme
                      ? 'bg-[#242f3d] hover:bg-[#2b3848] text-[#64b5f6] border border-[#2c3a4d]'
                      : 'bg-white hover:bg-slate-50 text-[#1976d2] border border-slate-200 shadow-slate-100'
                  }`}
                >
                  <span className="truncate">{btn.text}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
