export interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
  style?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  replyMarkup?: {
    inline_keyboard?: InlineButton[][];
  };
  fileAttachment?: {
    name: string;
    size: string;
    type: 'so' | 'amx' | 'zip' | 'log' | 'apk' | 'ini';
    url?: string;
    downloadContent?: string;
  };
  isLoading?: boolean;
  statusBadge?: string;
}

export interface JniBuildConfig {
  ndkVersion: 'NDK r21e' | 'NDK r23b' | 'NDK r25c (LTS)' | 'NDK r26d' | 'NDK r27';
  arch: 'armeabi-v7a' | 'arm64-v8a' | 'x86' | 'all';
  cxxStandard: 'c++17' | 'c++20' | 'gnu++17';
  optimization: '-O2' | '-O3' | '-Os' | '-g (Debug)';
  stripSymbols: boolean;
  libraryName: string;
}

export interface PawnBuildConfig {
  includes: 'CRMP 0.3.7 R1' | 'CRMP 0.3.7 R3' | 'Open.MP v1.2' | 'Standard SA-MP';
  debugLevel: '-d0' | '-d2' | '-d3';
  optimize: boolean;
  warningsLevel: '-w2' | '-w0';
}

export interface ServerStatusInfo {
  ip: string;
  port: number;
  name: string;
  online: number;
  maxPlayers: number;
  gamemode: string;
  language: string;
  ping: number;
  isOnline: boolean;
}
