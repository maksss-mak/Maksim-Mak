/**
 * Telegram Bot Service for real Telegram integration
 * Implements NEXUS SHOP CRMP (@nexus_shop_crmp_bot)
 */

import {
  BOT_INFO,
  START_MESSAGE_TEXT,
  START_INLINE_KEYBOARD,
  SHOP_CATEGORIES,
  SHOP_PRODUCTS,
  SAMPLE_REVIEWS,
  JNI_MENU_TEXT,
  JNI_INLINE_KEYBOARD,
  HELP_INSTRUCTION_TEXT,
  SAMPLE_SERVERS,
  NDK_VERSIONS,
  ARCHITECTURES,
} from '../src/data/botData';
import { generateJniLogs, generatePawnLogs } from '../src/utils/compiler';

export interface TelegramBotUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'message' | 'callback' | 'error' | 'file' | 'purchase';
  text: string;
  chatId?: number;
  username?: string;
}

interface UserShopState {
  balance: number;
  ordersCount: number;
  lastBonusClaimed?: number;
  purchases: Array<{ title: string; price: number; date: string }>;
  ndkVersion: string;
  arch: string;
}

class TelegramBotService {
  private token: string = '';
  private botUser: TelegramBotUser | null = null;
  private isRunning: boolean = false;
  private pollingAbortController: AbortController | null = null;
  private lastUpdateId: number = 0;
  private userStates: Map<number, UserShopState> = new Map();
  private logs: TelegramLogEntry[] = [];
  public stats = {
    totalMessages: 0,
    totalCallbacks: 0,
    activeUsersCount: 0,
    purchasesCount: 0,
    totalTurnover: 0,
    startedAt: new Date().toISOString(),
  };

  private activeUserIds: Set<number> = new Set();

  constructor() {
    const envToken = process.env.TELEGRAM_BOT_TOKEN;
    if (envToken && envToken.trim().length > 10) {
      this.initBot(envToken.trim()).catch((err) => {
        this.addLog('error', `Ошибка запуска бота из env: ${err.message}`);
      });
    }
  }

  public addLog(type: TelegramLogEntry['type'], text: string, chatId?: number, username?: string) {
    const entry: TelegramLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      text,
      chatId,
      username,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 120) {
      this.logs.pop();
    }
  }

  public getLogs(): TelegramLogEntry[] {
    return this.logs;
  }

  public getStatus() {
    return {
      isConnected: this.isRunning && !!this.botUser,
      tokenConfigured: !!this.token,
      botUser: this.botUser,
      stats: {
        ...this.stats,
        activeUsersCount: this.activeUserIds.size,
      },
      hasEnvToken: !!process.env.TELEGRAM_BOT_TOKEN,
    };
  }

  private async apiCall(method: string, body: Record<string, unknown> = {}) {
    if (!this.token) {
      throw new Error('Токен бота не задан');
    }

    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as { ok: boolean; result?: unknown; description?: string };
    if (!data.ok) {
      throw new Error(data.description || `Telegram API error on ${method}`);
    }
    return data.result;
  }

  private async sendDocument(
    chatId: number,
    filename: string,
    fileContent: string,
    caption?: string
  ) {
    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    formData.append('document', blob, filename);
    if (caption) {
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
    }

    const res = await fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }

  public async initBot(token: string): Promise<TelegramBotUser> {
    this.stopPolling();
    this.token = token.trim();

    this.addLog('info', 'Авторизация в Telegram Bot API...');
    const bot = (await this.apiCall('getMe')) as TelegramBotUser;
    this.botUser = bot;
    this.isRunning = true;

    this.addLog('info', `✅ Бот NEXUS SHOP запущен: @${bot.username} (${bot.first_name})`);

    try {
      await this.apiCall('setMyCommands', {
        commands: [
          { command: 'start', description: '🛒 Главное меню магазина NEXUS' },
          { command: 'catalog', description: '🛍 Каталог виртов, скриптов и аккаунтов' },
          { command: 'balance', description: '💰 Пополнить баланс' },
          { command: 'profile', description: '👤 Личный кабинет и промокоды' },
          { command: 'bonus', description: '🎁 Забрать ежедневный бонус' },
          { command: 'jni', description: '🛠 JNI Builder (компиляция .so)' },
          { command: 'pawn', description: '📜 PAWN Compiler (.pwn -> .amx)' },
          { command: 'reviews', description: '⭐️ Отзывы покупателей' },
          { command: 'help', description: 'ℹ️ Помощь и поддержка' },
        ],
      });
      this.addLog('info', 'Команды магазина NEXUS SHOP зарегистрированы в Telegram');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.addLog('error', `Не удалось установить команды: ${msg}`);
    }

    this.startPolling();
    return bot;
  }

  public disconnect() {
    this.stopPolling();
    this.token = '';
    this.botUser = null;
    this.isRunning = false;
    this.addLog('info', 'Бот отключен');
  }

  private stopPolling() {
    if (this.pollingAbortController) {
      this.pollingAbortController.abort();
      this.pollingAbortController = null;
    }
  }

  private async startPolling() {
    this.stopPolling();
    this.pollingAbortController = new AbortController();
    const signal = this.pollingAbortController.signal;

    const poll = async () => {
      while (!signal.aborted && this.isRunning) {
        try {
          const res = await fetch(
            `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=20`,
            { signal }
          );

          if (!res.ok) {
            await new Promise((r) => setTimeout(r, 3000));
            continue;
          }

          const data = (await res.json()) as { ok: boolean; result?: Array<Record<string, unknown>> };
          if (data.ok && Array.isArray(data.result)) {
            for (const update of data.result) {
              const updateId = update.update_id as number;
              this.lastUpdateId = Math.max(this.lastUpdateId, updateId);
              await this.handleUpdate(update);
            }
          }
        } catch (err: unknown) {
          if (signal.aborted) break;
          const msg = err instanceof Error ? err.message : String(err);
          if (!msg.includes('aborted')) {
            await new Promise((r) => setTimeout(r, 3000));
          }
        }
      }
    };

    poll().catch((e) => console.error('Polling error:', e));
  }

  private getUserState(userId: number): UserShopState {
    if (!this.userStates.has(userId)) {
      this.userStates.set(userId, {
        balance: 150, // Welcome starting bonus of 150 ₽ for authentic experience
        ordersCount: 0,
        purchases: [],
        ndkVersion: 'NDK r25c (LTS)',
        arch: 'armeabi-v7a',
      });
    }
    return this.userStates.get(userId)!;
  }

  private getReplyKeyboard() {
    return {
      keyboard: [
        [{ text: '🛍 Каталог товаров' }, { text: '💰 Пополнить баланс' }],
        [{ text: '👤 Личный кабинет' }, { text: '📦 Мои покупки' }],
        [{ text: '🛠 JNI & Скрипты' }, { text: '⭐️ Отзывы & Гарантии' }],
      ],
      resize_keyboard: true,
      persistent: true,
    };
  }

  public async handleUpdate(update: Record<string, unknown>) {
    try {
      if (update.message) {
        const msg = update.message as {
          message_id: number;
          chat: { id: number };
          from?: { id: number; username?: string; first_name?: string };
          text?: string;
          document?: { file_id: string; file_name?: string; file_size?: number };
        };

        const chatId = msg.chat.id;
        const fromUser = msg.from;
        if (fromUser) this.activeUserIds.add(fromUser.id);
        this.stats.totalMessages++;

        if (msg.document) {
          await this.handleDocument(chatId, fromUser, msg.document);
          return;
        }

        if (msg.text) {
          const text = msg.text.trim();
          this.addLog('message', `Сообщение: "${text}"`, chatId, fromUser?.username);
          await this.handleTextMessage(chatId, fromUser, text);
        }
      }

      if (update.callback_query) {
        const cb = update.callback_query as {
          id: string;
          from: { id: number; username?: string; first_name?: string };
          message?: { message_id: number; chat: { id: number } };
          data?: string;
        };

        this.stats.totalCallbacks++;
        this.activeUserIds.add(cb.from.id);
        this.addLog('callback', `Кнопка: "${cb.data}"`, cb.message?.chat.id, cb.from.username);
        await this.handleCallbackQuery(cb);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.addLog('error', `Ошибка обработки: ${msg}`);
    }
  }

  private async handleTextMessage(
    chatId: number,
    fromUser: { id: number; username?: string; first_name?: string } | undefined,
    text: string
  ) {
    const userId = fromUser?.id || chatId;
    const state = this.getUserState(userId);
    const upperText = text.toUpperCase();

    // Check promo codes
    if (upperText === 'NEXUS' || upperText === 'CRMP' || upperText === 'START' || upperText === 'NEXUS2026') {
      state.balance += 150;
      this.addLog('purchase', `Промокод ${upperText} активирован (+150 ₽)`, chatId, fromUser?.username);
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text:
          `🎉 <b>Промокод ${upperText} успешно активирован!</b>\n\n` +
          `💰 На ваш баланс начислено: <b>+150.00 ₽</b>\n` +
          `💳 Текущий баланс: <b>${state.balance.toFixed(2)} ₽</b>\n\n` +
          `Используйте средства в разделе <b>🛍 Каталог товаров</b>!`,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛍 Перейти в каталог', callback_data: 'shop_catalog' }],
          ],
        },
      });
      return;
    }

    if (text === '/start' || text === '🔙 Главное меню') {
      const startText = START_MESSAGE_TEXT.replace('{balance}', state.balance.toFixed(2))
        .replace('{id}', userId.toString())
        .replace('{ordersCount}', state.ordersCount.toString());

      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text: startText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: START_INLINE_KEYBOARD.map((r) =>
            r.map((b) => ({ text: b.text, callback_data: b.callback_data, url: b.url }))
          ),
          ...this.getReplyKeyboard(),
        },
      });
    } else if (text === '/catalog' || text === '🛍 Каталог товаров') {
      await this.sendCatalogMessage(chatId);
    } else if (text === '/balance' || text === '💰 Пополнить баланс') {
      await this.sendDepositMessage(chatId, state);
    } else if (text === '/profile' || text === '👤 Личный кабинет') {
      await this.sendProfileMessage(chatId, userId, fromUser?.username, state);
    } else if (text === '/orders' || text === '📦 Мои покупки') {
      await this.sendOrdersMessage(chatId, state);
    } else if (text === '/reviews' || text === '⭐️ Отзывы & Гарантии') {
      await this.sendReviewsMessage(chatId);
    } else if (text === '/bonus' || text === '🎁 Бесплатный бонус') {
      await this.claimBonus(chatId, state);
    } else if (text === '/jni' || text === '🛠 JNI & Скрипты') {
      await this.sendJniMessage(chatId, state);
    } else if (text === '/help' || text === 'ℹ️ Помощь') {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text: HELP_INSTRUCTION_TEXT,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛍 В каталог товаров', callback_data: 'shop_catalog' }],
            [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
          ],
        },
      });
    } else {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text:
          `🤖 <b>NEXUS SHOP CRMP</b>\n` +
          `Вы ввели: <code>${text}</code>\n\n` +
          `Используйте кнопки меню внизу экрана или введите промокод <code>NEXUS</code> для получения бонуса +150 ₽!`,
        parse_mode: 'HTML',
        reply_markup: this.getReplyKeyboard(),
      });
    }
  }

  private async sendCatalogMessage(chatId: number, messageId?: number) {
    const text =
      `🛍 <b>КАТАЛОГ ТОВАРОВ NEXUS SHOP CRMP</b>\n\n` +
      `Выберите интересующую категорию товаров:`;

    const keyboard = SHOP_CATEGORIES.map((cat) => [
      { text: `${cat.icon} ${cat.title}`, callback_data: `cat_${cat.id}` },
    ]);
    keyboard.push([{ text: '🔙 Главное меню', callback_data: 'menu_main' }]);

    if (messageId) {
      await this.apiCall('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    } else {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    }
  }

  private async sendCategoryProducts(chatId: number, messageId: number, categoryId: string) {
    const category = SHOP_CATEGORIES.find((c) => c.id === categoryId);
    const products = SHOP_PRODUCTS.filter((p) => p.categoryId === categoryId);

    let text = `📂 <b>${category?.title || 'Категория'}</b>\n\n${category?.description || ''}\n\n<b>Товары в наличии:</b>`;

    const keyboard = products.map((prod) => [
      {
        text: `${prod.title} — ${prod.price === 0 ? 'БЕСПЛАТНО' : `${prod.price} ₽`}`,
        callback_data: `prod_${prod.id}`,
      },
    ]);
    keyboard.push([{ text: '🔙 Назад к категориям', callback_data: 'shop_catalog' }]);

    await this.apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async sendProductDetails(chatId: number, messageId: number, productId: string, state: UserShopState) {
    const prod = SHOP_PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    const text =
      `📦 <b>${prod.title}</b>\n\n` +
      `📝 <b>Описание:</b>\n${prod.description}\n\n` +
      `💰 <b>Цена:</b> <b>${prod.price === 0 ? '0 ₽ (Бесплатно)' : `${prod.price} ₽`}</b>${
        prod.oldPrice ? ` <s>${prod.oldPrice} ₽</s>` : ''
      }\n` +
      `📊 <b>Наличие:</b> 🟢 ${prod.stockCount}\n` +
      `💳 <b>Ваш баланс:</b> <code>${state.balance.toFixed(2)} ₽</code>`;

    const keyboard = [
      [
        {
          text: `🛒 Купить за ${prod.price === 0 ? '0 ₽' : `${prod.price} ₽`}`,
          callback_data: `buy_${prod.id}`,
        },
      ],
      [{ text: '🔙 Назад к списку', callback_data: `cat_${prod.categoryId}` }],
    ];

    await this.apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async handleProductPurchase(chatId: number, messageId: number, productId: string, state: UserShopState) {
    const prod = SHOP_PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    if (state.balance < prod.price) {
      const diff = prod.price - state.balance;
      const text =
        `⚠️ <b>Недостаточно средств на балансе!</b>\n\n` +
        `Стоимость товара: <b>${prod.price} ₽</b>\n` +
        `Ваш баланс: <b>${state.balance.toFixed(2)} ₽</b>\n` +
        `Не хватает: <b>${diff.toFixed(2)} ₽</b>\n\n` +
        `Пополните баланс любым удобным способом:`;

      const keyboard = [
        [{ text: `💰 Пополнить на +${Math.ceil(diff)} ₽`, callback_data: `deposit_add_${Math.ceil(diff)}` }],
        [{ text: '💰 Способы пополнения', callback_data: 'shop_deposit' }],
        [{ text: '🔙 Назад к товару', callback_data: `prod_${prod.id}` }],
      ];

      await this.apiCall('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
      return;
    }

    // Deduct and purchase
    state.balance -= prod.price;
    state.ordersCount++;
    this.stats.purchasesCount++;
    this.stats.totalTurnover += prod.price;
    state.purchases.push({
      title: prod.title,
      price: prod.price,
      date: new Date().toLocaleDateString('ru-RU'),
    });

    this.addLog('purchase', `Покупка товара "${prod.title}" на сумму ${prod.price} ₽`, chatId);

    const successText =
      `🎉 <b>Оплата прошла успешно! Заказ #${Math.floor(100000 + Math.random() * 900000)}</b>\n\n` +
      `📦 <b>Товар:</b> <code>${prod.title}</code>\n` +
      `💰 <b>Списано:</b> <code>${prod.price} ₽</code>\n` +
      `💳 <b>Остаток баланса:</b> <code>${state.balance.toFixed(2)} ₽</code>\n\n` +
      `🔑 <b>Данные товара / Выдача:</b>\n<pre>${prod.itemDeliveryContent}</pre>\n\n` +
      `Спасибо за покупку в <b>NEXUS SHOP CRMP</b>!`;

    const keyboard = [
      [{ text: '⭐️ Оставить отзыв', callback_data: 'shop_reviews' }],
      [{ text: '🛍 Продолжить покупки', callback_data: 'shop_catalog' }],
    ];

    await this.apiCall('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text: successText,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });

    if (prod.filename) {
      setTimeout(async () => {
        await this.sendDocument(chatId, prod.filename!, `// Content for ${prod.title}`, `📁 Файл к вашему заказу: ${prod.filename}`);
      }, 800);
    }
  }

  private async sendDepositMessage(chatId: number, state: UserShopState, messageId?: number) {
    const text =
      `💰 <b>ПОПОЛНЕНИЕ БАЛАНСА NEXUS SHOP</b>\n\n` +
      `💳 <b>Текущий баланс:</b> <code>${state.balance.toFixed(2)} ₽</code>\n\n` +
      `Выберите сумму для мгновенного пополнения через СБП / Карту / ЮMoney / Stars:`;

    const keyboard = [
      [
        { text: '+100 ₽', callback_data: 'deposit_add_100' },
        { text: '+300 ₽', callback_data: 'deposit_add_300' },
        { text: '+500 ₽', callback_data: 'deposit_add_500' },
      ],
      [
        { text: '+1000 ₽', callback_data: 'deposit_add_1000' },
        { text: '+2500 ₽ (+5% бонус)', callback_data: 'deposit_add_2500' },
      ],
      [
        { text: '🎁 Активировать промокод (NEXUS)', callback_data: 'promo_hint' },
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'menu_main' },
      ],
    ];

    if (messageId) {
      await this.apiCall('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    } else {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: keyboard },
      });
    }
  }

  private async sendProfileMessage(
    chatId: number,
    userId: number,
    username: string | undefined,
    state: UserShopState
  ) {
    const text =
      `👤 <b>ЛИЧНЫЙ КАБИНЕТ NEXUS SHOP</b>\n\n` +
      `🆔 <b>Ваш Telegram ID:</b> <code>${userId}</code>\n` +
      `👤 <b>Пользователь:</b> @${username || 'user'}\n` +
      `💳 <b>Баланс:</b> <b>${state.balance.toFixed(2)} ₽</b>\n` +
      `📦 <b>Заказов совершено:</b> <code>${state.ordersCount}</code>\n` +
      `💎 <b>Статус:</b> <b>VIP Клиент (Кэшбэк 5%)</b>\n` +
      `🎁 <b>Реферальная ссылка:</b> <code>https://t.me/${this.botUser?.username || 'nexus_shop_crmp_bot'}?start=ref_${userId}</code>\n\n` +
      `💡 <i>Отправьте промокод <code>NEXUS</code> в чат, чтобы получить +150 ₽ на баланс!</i>`;

    const keyboard = [
      [
        { text: '💰 Пополнить баланс', callback_data: 'shop_deposit' },
        { text: '📦 Мои покупки', callback_data: 'shop_orders' },
      ],
      [
        { text: '🎁 Забрать бонус', callback_data: 'shop_daily_bonus' },
        { text: '🔙 Главное меню', callback_data: 'menu_main' },
      ],
    ];

    await this.apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async sendOrdersMessage(chatId: number, state: UserShopState) {
    let text = `📦 <b>ИСТОРИЯ ВАШИХ ПОКУПОК</b>\n\n`;
    if (state.purchases.length === 0) {
      text += `У вас пока нет покупок. Перейдите в <b>🛍 Каталог товаров</b>, чтобы сделать свой первый заказ!`;
    } else {
      state.purchases.forEach((p, idx) => {
        text += `${idx + 1}. <b>${p.title}</b> — <code>${p.price} ₽</code> (${p.date})\n`;
      });
    }

    const keyboard = [
      [{ text: '🛍 Каталог товаров', callback_data: 'shop_catalog' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ];

    await this.apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async sendReviewsMessage(chatId: number) {
    let text = `⭐️ <b>ОТЗЫВЫ ПОКУПАТЕЛЕЙ NEXUS SHOP (1,890+)</b>\n\n`;
    SAMPLE_REVIEWS.forEach((r) => {
      text +=
        `👤 <b>${r.author}</b> ${r.rating}\n` +
        `📦 <i>${r.product}</i>\n` +
        `💬 «${r.comment}»\n` +
        `🕒 ${r.date}\n\n`;
    });
    text += `🛡 <i>Все отзывы верифицированы реальными транзакциями.</i>`;

    const keyboard = [
      [{ text: '🛍 Перейти к покупкам', callback_data: 'shop_catalog' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ];

    await this.apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async claimBonus(chatId: number, state: UserShopState) {
    const bonusAmount = 50;
    state.balance += bonusAmount;
    this.addLog('purchase', `Получен ежедневный бонус +${bonusAmount} ₽`, chatId);

    const text =
      `🎁 <b>ЕЖЕДНЕВНЫЙ БОНУС ПОЛУЧЕН!</b>\n\n` +
      `Вам начислено: <b>+${bonusAmount}.00 ₽</b> на баланс!\n` +
      `💳 Текущий баланс: <b>${state.balance.toFixed(2)} ₽</b>\n\n` +
      `Возвращайтесь каждые 24 часа за новым бонусом!`;

    const keyboard = [
      [{ text: '🛍 Потратить в каталоге', callback_data: 'shop_catalog' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ];

    await this.apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: keyboard },
    });
  }

  private async sendJniMessage(chatId: number, state: UserShopState) {
    const text = JNI_MENU_TEXT.replace('{ndk}', state.ndkVersion)
      .replace('{arch}', state.arch)
      .replace('{cxx}', 'c++17')
      .replace('{opt}', '-O3')
      .replace('{strip}', 'Включено');

    await this.apiCall('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: JNI_INLINE_KEYBOARD(state.ndkVersion, state.arch).map((r) =>
          r.map((b) => ({ text: b.text, callback_data: b.callback_data, url: b.url }))
        ),
      },
    });
  }

  private async handleCallbackQuery(cb: {
    id: string;
    from: { id: number; username?: string; first_name?: string };
    message?: { message_id: number; chat: { id: number } };
    data?: string;
  }) {
    const data = cb.data;
    const chatId = cb.message?.chat.id;
    const messageId = cb.message?.message_id;
    const userId = cb.from.id;
    const state = this.getUserState(userId);

    await this.apiCall('answerCallbackQuery', {
      callback_query_id: cb.id,
      text: 'Загрузка...',
      show_alert: false,
    });

    if (!chatId || !messageId || !data) return;

    if (data === 'menu_main') {
      const startText = START_MESSAGE_TEXT.replace('{balance}', state.balance.toFixed(2))
        .replace('{id}', userId.toString())
        .replace('{ordersCount}', state.ordersCount.toString());

      await this.apiCall('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: startText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: START_INLINE_KEYBOARD.map((r) =>
            r.map((b) => ({ text: b.text, callback_data: b.callback_data, url: b.url }))
          ),
        },
      });
    } else if (data === 'shop_catalog') {
      await this.sendCatalogMessage(chatId, messageId);
    } else if (data.startsWith('cat_')) {
      const categoryId = data.replace('cat_', '');
      await this.sendCategoryProducts(chatId, messageId, categoryId);
    } else if (data.startsWith('prod_')) {
      const productId = data.replace('prod_', '');
      await this.sendProductDetails(chatId, messageId, productId, state);
    } else if (data.startsWith('buy_')) {
      const productId = data.replace('buy_', '');
      await this.handleProductPurchase(chatId, messageId, productId, state);
    } else if (data === 'shop_deposit') {
      await this.sendDepositMessage(chatId, state, messageId);
    } else if (data.startsWith('deposit_add_')) {
      const amount = Number(data.replace('deposit_add_', '')) || 100;
      state.balance += amount;
      this.addLog('purchase', `Пополнение баланса на +${amount} ₽ (СБП Тест)`, chatId, cb.from.username);

      const successText =
        `✅ <b>Баланс успешно пополнен!</b>\n\n` +
        `💰 Зачислено: <b>+${amount}.00 ₽</b>\n` +
        `💳 Текущий баланс: <b>${state.balance.toFixed(2)} ₽</b>\n\n` +
        `Теперь вы можете совершить покупку в каталоге!`;

      await this.apiCall('editMessageText', {
        chat_id: chatId,
        message_id: messageId,
        text: successText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🛍 Перейти в каталог', callback_data: 'shop_catalog' }],
            [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
          ],
        },
      });
    } else if (data === 'shop_daily_bonus') {
      await this.claimBonus(chatId, state);
    } else if (data === 'shop_orders') {
      await this.sendOrdersMessage(chatId, state);
    } else if (data === 'shop_reviews') {
      await this.sendReviewsMessage(chatId);
    } else if (data === 'shop_profile') {
      await this.sendProfileMessage(chatId, userId, cb.from.username, state);
    } else if (data === 'menu_jni') {
      await this.sendJniMessage(chatId, state);
    } else if (data === 'promo_hint') {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text: '🎁 <b>Активация промокода:</b>\nОтправьте в чат слово <code>NEXUS</code>, чтобы получить <b>+150.00 ₽</b> прямо сейчас!',
        parse_mode: 'HTML',
      });
    } else if (data === 'jni_start_compile') {
      await this.apiCall('sendMessage', {
        chat_id: chatId,
        text: `⏳ <b>JNI Builder:</b> Компиляция <code>libclient.so</code> (${state.ndkVersion})...`,
        parse_mode: 'HTML',
      });
      setTimeout(async () => {
        const mockBinary = `ELF_JNI_NEXUS_DEV_${state.arch}`;
        await this.sendDocument(chatId, 'libclient.so', mockBinary, `✅ Готовая библиотека <code>libclient.so</code> скомпилирована в NEXUS SHOP!`);
      }, 1500);
    }
  }

  private async handleDocument(
    chatId: number,
    fromUser: { id: number; username?: string } | undefined,
    doc: { file_id: string; file_name?: string; file_size?: number }
  ) {
    const filename = doc.file_name || 'archive.zip';
    this.addLog('file', `Получен файл: ${filename}`, chatId, fromUser?.username);

    await this.apiCall('sendMessage', {
      chat_id: chatId,
      text: `⏳ Файл <code>${filename}</code> принят на облачную компиляцию NEXUS...`,
      parse_mode: 'HTML',
    });

    setTimeout(async () => {
      await this.sendDocument(chatId, 'libclient.so', 'BINARY_MOCK', `✅ Сборка <code>${filename}</code> завершена!`);
    }, 1500);
  }

  public async sendTestMessage(chatId: number, text: string) {
    return this.apiCall('sendMessage', {
      chat_id: chatId,
      text: `🔔 <b>Уведомление от NEXUS SHOP:</b>\n${text}`,
      parse_mode: 'HTML',
    });
  }
}

export const telegramBotService = new TelegramBotService();
