/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TelegramHeader } from './components/TelegramHeader';
import { ChatMessage } from './components/ChatMessage';
import { ReplyKeyboard } from './components/ReplyKeyboard';
import { ChatInput } from './components/ChatInput';
import { BotInfoModal } from './components/BotInfoModal';
import { JniModal } from './components/JniModal';
import { PawnModal } from './components/PawnModal';
import { LauncherModal } from './components/LauncherModal';
import { ShopCatalogModal } from './components/ShopCatalogModal';
import { DepositModal } from './components/DepositModal';
import {
  START_MESSAGE_TEXT,
  START_INLINE_KEYBOARD,
  SHOP_CATEGORIES,
  SHOP_PRODUCTS,
  SAMPLE_REVIEWS,
  ShopProduct,
  JNI_MENU_TEXT,
  JNI_INLINE_KEYBOARD,
  HELP_INSTRUCTION_TEXT,
  SAMPLE_SERVERS,
  NDK_VERSIONS,
  ARCHITECTURES,
} from './data/botData';
import { ChatMessage as ChatMessageType, InlineButton, JniBuildConfig, PawnBuildConfig } from './types';
import { sound } from './utils/audio';
import { generateJniLogs, generatePawnLogs } from './utils/compiler';

export default function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [isReplyKeyboardOpen, setIsReplyKeyboardOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Shop State
  const [userBalance, setUserBalance] = useState<number>(150.0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [purchases, setPurchases] = useState<Array<{ title: string; price: number; date: string }>>([]);

  // Modals
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isJniModalOpen, setIsJniModalOpen] = useState(false);
  const [isPawnModalOpen, setIsPawnModalOpen] = useState(false);
  const [isLauncherModalOpen, setIsLauncherModalOpen] = useState(false);
  const [isShopCatalogModalOpen, setIsShopCatalogModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // JNI Configuration
  const [jniConfig, setJniConfig] = useState<JniBuildConfig>({
    ndkVersion: 'NDK r25c (LTS)',
    arch: 'armeabi-v7a',
    cxxStandard: 'c++17',
    optimization: '-O3',
    stripSymbols: true,
    libraryName: 'libclient.so',
  });

  // User Profile Data
  const userProfile = {
    id: 582194812,
    username: '@nexus_client',
    plan: 'VIP Клиент (Кэшбэк 5%)',
    regDate: '15.02.2025',
  };

  const getStartText = () => {
    return START_MESSAGE_TEXT.replace('{balance}', userBalance.toFixed(2))
      .replace('{id}', userProfile.id.toString())
      .replace('{ordersCount}', ordersCount.toString());
  };

  // Messages list initialized with bot welcome message
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: 'welcome-msg',
      sender: 'bot',
      text: START_MESSAGE_TEXT.replace('{balance}', '150.00')
        .replace('{id}', '582194812')
        .replace('{ordersCount}', '0'),
      timestamp: '12:00',
      replyMarkup: {
        inline_keyboard: START_INLINE_KEYBOARD,
      },
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const getNowTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendBotMessage = (
    text: string,
    keyboard?: InlineButton[][],
    attachment?: ChatMessageType['fileAttachment'],
    statusBadge?: string
  ) => {
    sound.playIncoming();
    const newMsg: ChatMessageType = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text,
      timestamp: getNowTime(),
      replyMarkup: keyboard ? { inline_keyboard: keyboard } : undefined,
      fileAttachment: attachment,
      statusBadge,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const sendUserMessage = (text: string) => {
    sound.playOutgoing();
    const newMsg: ChatMessageType = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: getNowTime(),
    };
    setMessages((prev) => [...prev, newMsg]);

    setTimeout(() => {
      handleBotResponse(text);
    }, 400);
  };

  // Process text messages / commands
  const handleBotResponse = (input: string) => {
    const clean = input.trim();
    const upper = clean.toUpperCase();

    // Promo code handler
    if (upper === 'NEXUS' || upper === 'CRMP' || upper === 'START' || upper === 'NEXUS2026') {
      handleAddBalance(150, `Промокод ${upper}`);
      sendBotMessage(
        `🎉 <b>Промокод ${upper} успешно активирован!</b>\n\n` +
          `💰 Начислено: <b>+150.00 ₽</b>\n` +
          `💳 Ваш текущий баланс: <b>${(userBalance + 150).toFixed(2)} ₽</b>\n\n` +
          `Используйте средства в разделе <b>🛍 Каталог товаров</b>!`,
        [[{ text: '🛍 Открыть каталог', callback_data: 'shop_catalog' }]]
      );
      return;
    }

    if (clean === '/start' || clean === '🔙 Главное меню') {
      sendBotMessage(getStartText(), START_INLINE_KEYBOARD);
    } else if (clean === '/catalog' || clean === '🛍 Каталог товаров') {
      triggerCatalogCategories();
    } else if (clean === '/balance' || clean === '💰 Пополнить баланс') {
      triggerDepositMenu();
    } else if (clean === '/profile' || clean === '👤 Личный кабинет') {
      triggerProfileMenu();
    } else if (clean === '/orders' || clean === '📦 Мои покупки') {
      triggerOrdersMenu();
    } else if (clean === '/reviews' || clean === '⭐️ Отзывы & Гарантии') {
      triggerReviewsMenu();
    } else if (clean === '/bonus' || clean === '🎁 Бесплатный бонус') {
      triggerDailyBonus();
    } else if (clean === '/jni' || clean === '🛠 JNI & Скрипты') {
      triggerJniMenu();
    } else if (clean === '/pawn') {
      triggerPawnMenu();
    } else if (clean === '/launcher') {
      setIsLauncherModalOpen(true);
    } else if (clean === '/status') {
      triggerStatusMenu();
    } else if (clean === '/help' || clean === 'ℹ️ Помощь') {
      triggerHelpMenu();
    } else {
      sendBotMessage(
        `🤖 <b>NEXUS SHOP | CRMP</b>\n` +
          `Вы отправили: <code>${clean}</code>\n\n` +
          `Используйте кнопки меню ниже или введите промокод <code>NEXUS</code> для получения бонуса +150 ₽!`,
        [
          [{ text: '🛍 Каталог товаров', callback_data: 'shop_catalog' }],
          [{ text: '💰 Пополнить баланс', callback_data: 'shop_deposit' }],
        ]
      );
    }
  };

  // Add balance helper
  const handleAddBalance = (amount: number, reason: string) => {
    sound.playSuccess();
    setUserBalance((prev) => prev + amount);
    showToast(`Баланс пополнен на +${amount} ₽! (${reason})`);
  };

  // Execute purchase
  const handleBuyProduct = (product: ShopProduct) => {
    if (userBalance < product.price && product.price > 0) {
      const diff = product.price - userBalance;
      sendBotMessage(
        `⚠️ <b>Недостаточно средств на балансе!</b>\n\n` +
          `📦 <b>Товар:</b> <code>${product.title}</code>\n` +
          `💰 <b>Стоимость:</b> <code>${product.price} ₽</code>\n` +
          `💳 <b>Ваш баланс:</b> <code>${userBalance.toFixed(2)} ₽</code>\n` +
          `Не хватает: <b>${diff.toFixed(2)} ₽</b>\n\n` +
          `Пополните баланс в один клик:`,
        [
          [{ text: `💰 Пополнить на +${Math.ceil(diff)} ₽`, callback_data: `deposit_add_${Math.ceil(diff)}` }],
          [{ text: '💳 Другие способы пополнения', callback_data: 'shop_deposit' }],
          [{ text: '🔙 Назад к товару', callback_data: `prod_${product.id}` }],
        ]
      );
      return;
    }

    sound.playSuccess();
    setUserBalance((prev) => prev - product.price);
    setOrdersCount((prev) => prev + 1);
    setPurchases((prev) => [
      {
        title: product.title,
        price: product.price,
        date: new Date().toLocaleDateString('ru-RU'),
      },
      ...prev,
    ]);

    showToast(`Заказ успешно оформлен!`);

    const orderId = Math.floor(100000 + Math.random() * 900000);
    const successText =
      `🎉 <b>Оплата прошла успешно! Заказ #${orderId}</b>\n\n` +
      `📦 <b>Товар:</b> <code>${product.title}</code>\n` +
      `💰 <b>Списано:</b> <code>${product.price} ₽</code>\n` +
      `💳 <b>Остаток баланса:</b> <code>${(userBalance - product.price).toFixed(2)} ₽</code>\n\n` +
      `🔑 <b>Данные к заказу / Моментальная выдача:</b>\n<pre>${product.itemDeliveryContent}</pre>\n\n` +
      `Спасибо за доверие к <b>NEXUS SHOP CRMP</b>!`;

    const attachment = product.filename
      ? {
          name: product.filename,
          size: product.filename.endsWith('.so') ? '342.6 KB' : '1.8 MB',
          type: (product.filename.endsWith('.so') ? 'so' : 'zip') as any,
          downloadContent: `// Delivery content for ${product.title}\n` + product.itemDeliveryContent,
        }
      : undefined;

    sendBotMessage(
      successText,
      [
        [{ text: '⭐️ Оставить отзыв', callback_data: 'shop_reviews' }],
        [{ text: '🛍 Продолжить покупки', callback_data: 'shop_catalog' }],
      ],
      attachment,
      'Выдано мгновенно'
    );
  };

  // Trigger Catalog Categories
  const triggerCatalogCategories = () => {
    const text =
      `🛍 <b>КАТАЛОГ ТОВАРОВ NEXUS SHOP CRMP</b>\n\n` +
      `Выберите интересующую вас категорию:`;

    const rows: InlineButton[][] = SHOP_CATEGORIES.map((cat) => [
      { text: `${cat.icon} ${cat.title}`, callback_data: `cat_${cat.id}` },
    ]);
    rows.push([{ text: '🔙 Главное меню', callback_data: 'menu_main' }]);

    sendBotMessage(text, rows);
  };

  // Trigger Category Products
  const triggerCategoryProducts = (categoryId: string) => {
    const category = SHOP_CATEGORIES.find((c) => c.id === categoryId);
    const prods = SHOP_PRODUCTS.filter((p) => p.categoryId === categoryId);

    let text = `📂 <b>${category?.title || 'Категория'}</b>\n\n${category?.description || ''}\n\n<b>Товары в наличии:</b>`;

    const rows: InlineButton[][] = prods.map((p) => [
      {
        text: `${p.title} — ${p.price === 0 ? 'БЕСПЛАТНО' : `${p.price} ₽`}`,
        callback_data: `prod_${p.id}`,
      },
    ]);
    rows.push([{ text: '🔙 Назад к категориям', callback_data: 'shop_catalog' }]);

    sendBotMessage(text, rows);
  };

  // Trigger Product Details
  const triggerProductDetails = (productId: string) => {
    const prod = SHOP_PRODUCTS.find((p) => p.id === productId);
    if (!prod) return;

    const text =
      `📦 <b>${prod.title}</b>\n\n` +
      `📝 <b>Описание:</b>\n${prod.description}\n\n` +
      `💰 <b>Цена:</b> <b>${prod.price === 0 ? '0 ₽ (Бесплатно)' : `${prod.price} ₽`}</b>${
        prod.oldPrice ? ` <s>${prod.oldPrice} ₽</s>` : ''
      }\n` +
      `📊 <b>Наличие:</b> 🟢 ${prod.stockCount}\n` +
      `💳 <b>Ваш баланс:</b> <code>${userBalance.toFixed(2)} ₽</code>`;

    const rows: InlineButton[][] = [
      [
        {
          text: `🛒 Купить за ${prod.price === 0 ? '0 ₽' : `${prod.price} ₽`}`,
          callback_data: `buy_${prod.id}`,
        },
      ],
      [{ text: '🔙 Назад к списку', callback_data: `cat_${prod.categoryId}` }],
    ];

    sendBotMessage(text, rows);
  };

  // Trigger Deposit Menu
  const triggerDepositMenu = () => {
    const text =
      `💰 <b>ПОПОЛНЕНИЕ БАЛАНСА NEXUS SHOP</b>\n\n` +
      `💳 <b>Ваш текущий баланс:</b> <code>${userBalance.toFixed(2)} ₽</code>\n\n` +
      `Выберите сумму для моментального зачисления через СБП / Карту / ЮMoney / Stars:`;

    const rows: InlineButton[][] = [
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
        { text: '🎁 Ввести промокод (NEXUS)', callback_data: 'promo_hint' },
      ],
      [
        { text: '🔙 Главное меню', callback_data: 'menu_main' },
      ],
    ];

    sendBotMessage(text, rows);
  };

  // Trigger Profile
  const triggerProfileMenu = () => {
    const text =
      `👤 <b>ЛИЧНЫЙ КАБИНЕТ NEXUS SHOP</b>\n\n` +
      `🆔 <b>Ваш ID:</b> <code>${userProfile.id}</code>\n` +
      `👤 <b>Пользователь:</b> ${userProfile.username}\n` +
      `💳 <b>Баланс:</b> <b>${userBalance.toFixed(2)} ₽</b>\n` +
      `📦 <b>Заказов совершено:</b> <code>${ordersCount}</code>\n` +
      `💎 <b>Статус:</b> <b>${userProfile.plan}</b>\n` +
      `🎁 <b>Реферальная ссылка:</b> <code>https://t.me/nexus_shop_crmp_bot?start=ref_${userProfile.id}</code>\n\n` +
      `💡 <i>Напишите промокод <code>NEXUS</code> в чат для получения +150 ₽!</i>`;

    const rows: InlineButton[][] = [
      [
        { text: '💰 Пополнить баланс', callback_data: 'shop_deposit' },
        { text: '📦 Мои покупки', callback_data: 'shop_orders' },
      ],
      [
        { text: '🎁 Забрать бонус', callback_data: 'shop_daily_bonus' },
        { text: '🔙 Главное меню', callback_data: 'menu_main' },
      ],
    ];

    sendBotMessage(text, rows);
  };

  // Trigger Orders
  const triggerOrdersMenu = () => {
    let text = `📦 <b>ИСТОРИЯ ВАШИХ ПОКУПОК</b>\n\n`;
    if (purchases.length === 0) {
      text += `У вас пока нет оформленных заказов.\nПерейдите в <b>🛍 Каталог товаров</b>, чтобы сделать первую покупку!`;
    } else {
      purchases.forEach((p, idx) => {
        text += `${idx + 1}. <b>${p.title}</b> — <code>${p.price} ₽</code> (${p.date})\n`;
      });
    }

    sendBotMessage(text, [
      [{ text: '🛍 Каталог товаров', callback_data: 'shop_catalog' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ]);
  };

  // Trigger Reviews
  const triggerReviewsMenu = () => {
    let text = `⭐️ <b>ОТЗЫВЫ ПОКУПАТЕЛЕЙ NEXUS SHOP (1,890+)</b>\n\n`;
    SAMPLE_REVIEWS.forEach((r) => {
      text +=
        `👤 <b>${r.author}</b> ${r.rating}\n` +
        `📦 <i>${r.product}</i>\n` +
        `💬 «${r.comment}»\n` +
        `🕒 ${r.date}\n\n`;
    });
    text += `🛡 <i>Все отзывы подтверждены реальными заказами.</i>`;

    sendBotMessage(text, [
      [{ text: '🛍 Перейти к покупкам', callback_data: 'shop_catalog' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ]);
  };

  // Daily Bonus
  const triggerDailyBonus = () => {
    handleAddBalance(50, 'Ежедневный бонус');
    sendBotMessage(
      `🎁 <b>ЕЖЕДНЕВНЫЙ БОНУС ПОЛУЧЕН!</b>\n\n` +
        `💰 Вам начислено: <b>+50.00 ₽</b> на баланс!\n` +
        `💳 Текущий баланс: <b>${(userBalance + 50).toFixed(2)} ₽</b>\n\n` +
        `Возвращайтесь каждые 24 часа за новым бонусом!`,
      [
        [{ text: '🛍 Потратить в каталоге', callback_data: 'shop_catalog' }],
        [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
      ]
    );
  };

  // JNI Menu
  const triggerJniMenu = () => {
    const text = JNI_MENU_TEXT.replace('{ndk}', jniConfig.ndkVersion)
      .replace('{arch}', jniConfig.arch)
      .replace('{cxx}', jniConfig.cxxStandard)
      .replace('{opt}', jniConfig.optimization)
      .replace('{strip}', jniConfig.stripSymbols ? 'Включено (llvm-strip)' : 'Выключено');

    sendBotMessage(text, JNI_INLINE_KEYBOARD(jniConfig.ndkVersion, jniConfig.arch));
  };

  // PAWN Menu
  const triggerPawnMenu = () => {
    const text =
      `📜 <b>PAWN COMPILER v3.2.3664 (CRMP Mobile Edition)</b>\n\n` +
      `Облачная компиляция серверных скриптов и гейммодов в бинарный файл <code>.amx</code>.\n\n` +
      `📦 <b>Поддерживаемые библиотеки:</b>\n` +
      `• a_samp, a_npc, zcmd, sscanf2\n` +
      `• CRMP 0.3.7 R1 / R3 includes\n` +
      `• streamer, YSI 5.x, fixes2\n\n` +
      `Выберите действие:`;

    sendBotMessage(text, [
      [
        { text: '📂 Выбрать готовый скрипт (PWN)', callback_data: 'pawn_open_modal' },
        { text: '⚡️ Быстрая компиляция', callback_data: 'pawn_quick_compile' },
      ],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ]);
  };

  // Server Status
  const triggerStatusMenu = () => {
    let text = `🌐 <b>МОНИТОРИНГ ИГРОВЫХ СЕРВЕРОВ CRMP</b>\n\n`;
    SAMPLE_SERVERS.forEach((s) => {
      text +=
        `<b>${s.name}</b>\n` +
        `• IP: <code>${s.ip}:${s.port}</code>\n` +
        `• Онлайн: 🟢 <b>${s.online} / ${s.maxPlayers}</b> игроков\n` +
        `• Мод: <code>${s.gamemode}</code>\n` +
        `• Пинг: <b>${s.ping} ms</b>\n\n`;
    });
    text += `💡 <i>Статистика обновляется по протоколу SA-MP Query.</i>`;

    sendBotMessage(text, [
      [{ text: '🔄 Обновить статус', callback_data: 'status_refresh' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ]);
  };

  // Help Menu
  const triggerHelpMenu = () => {
    sendBotMessage(HELP_INSTRUCTION_TEXT, [
      [{ text: '🛍 Каталог товаров', callback_data: 'shop_catalog' }],
      [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
    ]);
  };

  // Handle Inline Button clicks
  const handleInlineClick = (button: InlineButton) => {
    sound.playClick();
    const data = button.callback_data;
    if (!data) return;

    if (data === 'menu_main') {
      sendBotMessage(getStartText(), START_INLINE_KEYBOARD);
    } else if (data === 'shop_catalog') {
      triggerCatalogCategories();
    } else if (data.startsWith('cat_')) {
      const catId = data.replace('cat_', '');
      triggerCategoryProducts(catId);
    } else if (data.startsWith('prod_')) {
      const prodId = data.replace('prod_', '');
      triggerProductDetails(prodId);
    } else if (data.startsWith('buy_')) {
      const prodId = data.replace('buy_', '');
      const prod = SHOP_PRODUCTS.find((p) => p.id === prodId);
      if (prod) handleBuyProduct(prod);
    } else if (data === 'shop_deposit') {
      triggerDepositMenu();
    } else if (data.startsWith('deposit_add_')) {
      const amount = Number(data.replace('deposit_add_', '')) || 100;
      handleAddBalance(amount, 'Быстрое пополнение');
      sendBotMessage(
        `✅ <b>Баланс успешно пополнен!</b>\n\n` +
          `💰 Зачислено: <b>+${amount}.00 ₽</b>\n` +
          `💳 Текущий баланс: <b>${(userBalance + amount).toFixed(2)} ₽</b>\n\n` +
          `Приятных покупок в <b>NEXUS SHOP CRMP</b>!`,
        [
          [{ text: '🛍 Перейти в каталог', callback_data: 'shop_catalog' }],
          [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
        ]
      );
    } else if (data === 'promo_hint') {
      sendBotMessage(
        '🎁 <b>Активация промокода:</b>\nОтправьте в чат слово <code>NEXUS</code>, чтобы получить <b>+150.00 ₽</b> прямо сейчас!'
      );
    } else if (data === 'shop_profile') {
      triggerProfileMenu();
    } else if (data === 'shop_orders') {
      triggerOrdersMenu();
    } else if (data === 'shop_reviews') {
      triggerReviewsMenu();
    } else if (data === 'shop_daily_bonus') {
      triggerDailyBonus();
    } else if (data === 'shop_support') {
      sendBotMessage(
        `💬 <b>Служба поддержки NEXUS SHOP CRMP</b>\n\n` +
          `Наш саппорт на связи 24/7 для помощи с получением виртов, настройкой лаунчеров и ответом на любые вопросы.\n\n` +
          `Контакты поддержки: <b>@nexus_crmp_support</b>\n` +
          `Официальный канал: <b>@nexus_crmp</b>`,
        [[{ text: '🔙 Главное меню', callback_data: 'menu_main' }]]
      );
    } else if (data === 'menu_jni') {
      triggerJniMenu();
    } else if (data === 'open_channel') {
      setIsInfoModalOpen(true);
      showToast('Открыт профиль канала @nexus_crmp');

    } else if (data === 'jni_presets' || data === 'jni_upload_custom') {
      setIsJniModalOpen(true);
    } else if (data === 'jni_select_ndk') {
      const ndkRows: InlineButton[][] = NDK_VERSIONS.map((v) => [
        {
          text: v === jniConfig.ndkVersion ? `✅ ${v}` : v,
          callback_data: `set_ndk_${v}`,
        },
      ]);
      ndkRows.push([{ text: '🔙 Назад к JNI', callback_data: 'menu_jni' }]);
      sendBotMessage('⚙️ <b>Выберите версию Android NDK для сборки:</b>', ndkRows);
    } else if (data.startsWith('set_ndk_')) {
      const selected = data.replace('set_ndk_', '') as JniBuildConfig['ndkVersion'];
      setJniConfig((prev) => ({ ...prev, ndkVersion: selected }));
      showToast(`Выбрана ${selected}`);
      setTimeout(() => triggerJniMenu(), 250);
    } else if (data === 'jni_select_arch') {
      const archRows: InlineButton[][] = ARCHITECTURES.map((a) => [
        {
          text: a.id === jniConfig.arch ? `✅ ${a.label}` : a.label,
          callback_data: `set_arch_${a.id}`,
        },
      ]);
      archRows.push([{ text: '🔙 Назад к JNI', callback_data: 'menu_jni' }]);
      sendBotMessage('🎯 <b>Выберите целевую архитектуру (ABI):</b>', archRows);
    } else if (data.startsWith('set_arch_')) {
      const selected = data.replace('set_arch_', '') as JniBuildConfig['arch'];
      setJniConfig((prev) => ({ ...prev, arch: selected }));
      showToast(`Выбрана архитектура: ${selected}`);
      setTimeout(() => triggerJniMenu(), 250);
    } else if (data === 'jni_start_compile') {
      runJniCompilation('CRMP Hook Library', 'Mock Source', jniConfig);
    } else if (data === 'pawn_open_modal') {
      setIsPawnModalOpen(true);
    } else if (data === 'pawn_quick_compile') {
      runPawnCompilation('CRMP Admin Script', '#include <a_samp>', 'crmp_admin.pwn', {
        includes: 'CRMP 0.3.7 R1',
        debugLevel: '-d3',
        optimize: true,
        warningsLevel: '-w2',
      });
    } else if (data === 'status_refresh') {
      showToast('Статус серверов обновлен!');
      triggerStatusMenu();
    }
  };

  // Run JNI compilation
  const runJniCompilation = (presetTitle: string, code: string, config: JniBuildConfig) => {
    const libName = config.libraryName || 'libclient.so';
    showToast(`Запуск компиляции ${libName}...`);

    sendBotMessage(
      `⏳ <b>JNI Builder: Начало компиляции проекта:</b> <code>${presetTitle}</code>\n` +
        `• NDK: <code>${config.ndkVersion}</code> | ABI: <code>${config.arch}</code>\n` +
        `Выделен воркер Nexus-Cloud. Компиляция запущена...`,
      undefined,
      undefined,
      'Компиляция...'
    );

    setTimeout(() => {
      const logs = generateJniLogs(libName, config);
      sound.playSuccess();

      const successText =
        `✅ <b>Компиляция успешно завершена!</b>\n\n` +
        `📁 <b>Файл:</b> <code>${libName}</code>\n` +
        `🎯 <b>Архитектура:</b> <code>${config.arch}</code>\n` +
        `⚙️ <b>Сборщик:</b> <code>Android Clang++ (${config.ndkVersion})</code>\n\n` +
        `<b>Лог сборки:</b>\n<pre>${logs.slice(4).join('\n')}</pre>\n\n` +
        `👇 <i>Нажмите кнопку ниже, чтобы скачать готовую .so библиотеку:</i>`;

      sendBotMessage(
        successText,
        [
          [{ text: '⚡️ Собрать еще раз', callback_data: 'menu_jni' }],
          [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
        ],
        {
          name: libName,
          size: '342.6 KB',
          type: 'so',
          downloadContent: `// Compiled binary for ${libName} via Nexus Developer\n` + code,
        },
        'Сборка готова'
      );
    }, 1800);
  };

  // Run PAWN compilation
  const runPawnCompilation = (
    title: string,
    code: string,
    filename: string,
    config: PawnBuildConfig
  ) => {
    const amxName = filename.replace(/\.pwn$/i, '') + '.amx';
    showToast(`Компиляция ${filename} в .amx...`);

    sendBotMessage(
      `⏳ <b>Компиляция PAWN скрипта:</b> <code>${filename}</code>\n` +
        `Инклюды: <code>${config.includes}</code>\nЗапуск pawncc...`,
      undefined,
      undefined,
      'Компиляция...'
    );

    setTimeout(() => {
      const logs = generatePawnLogs(filename, config);
      sound.playSuccess();

      const successText =
        `✅ <b>Скрипт успешно скомпилирован!</b>\n\n` +
        `📄 <b>Исходник:</b> <code>${filename}</code>\n` +
        `📦 <b>Результат:</b> <code>${amxName}</code>\n\n` +
        `<b>Отчет компилятора:</b>\n<pre>${logs.join('\n')}</pre>`;

      sendBotMessage(
        successText,
        [
          [{ text: '📜 Еще один скрипт', callback_data: 'pawn_open_modal' }],
          [{ text: '🔙 Главное меню', callback_data: 'menu_main' }],
        ],
        {
          name: amxName,
          size: '82.4 KB',
          type: 'amx',
          downloadContent: `// Compiled AMX binary mock for ${amxName}\n` + code,
        },
        'Готово к загрузке'
      );
    }, 1500);
  };

  const handleFileUpload = (file: File) => {
    sound.playOutgoing();
    const fileName = file.name;
    const isPwn = fileName.endsWith('.pwn');
    const isZip = fileName.endsWith('.zip');
    const isCpp = fileName.endsWith('.cpp') || fileName.endsWith('.c') || fileName.endsWith('.h');

    const userMsg: ChatMessageType = {
      id: 'upload-' + Date.now(),
      sender: 'user',
      text: `📤 Отправлен файл: <b>${fileName}</b> (${(file.size / 1024).toFixed(1)} KB)`,
      timestamp: getNowTime(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      sound.playIncoming();
      if (isPwn) {
        runPawnCompilation('Пользовательский скрипт', '// uploaded', fileName, {
          includes: 'CRMP 0.3.7 R1',
          debugLevel: '-d3',
          optimize: true,
          warningsLevel: '-w2',
        });
      } else if (isZip || isCpp) {
        const libName = fileName.replace(/\.(zip|cpp|c|h)$/i, '') + '.so';
        runJniCompilation(fileName, '// Custom source', {
          ...jniConfig,
          libraryName: libName.startsWith('lib') ? libName : `lib${libName}`,
        });
      } else {
        sendBotMessage(
          `📄 Получен файл <code>${fileName}</code>.\n` +
            `Для компиляции библиотек отправьте <code>.zip</code> или <code>.cpp</code>.\n` +
            `Для скриптов отправьте <code>.pwn</code>.`
        );
      }
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg-' + Date.now(),
        sender: 'bot',
        text: getStartText(),
        timestamp: getNowTime(),
        replyMarkup: {
          inline_keyboard: START_INLINE_KEYBOARD,
        },
      },
    ]);
    showToast('Диалог перезапущен!');
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center transition-colors ${
        isDarkTheme ? 'bg-[#0e1621]' : 'bg-[#e5ecf3]'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 z-50 left-1/2 -translate-x-1/2 px-4 py-2 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Main Container */}
      <div
        className={`w-full h-screen flex flex-col overflow-hidden transition-all duration-300 ${
          isMobileFrame
            ? 'sm:max-w-[420px] sm:h-[860px] sm:max-h-[95vh] sm:rounded-[42px] sm:border-[8px] sm:border-slate-800 sm:shadow-2xl sm:ring-1 sm:ring-slate-700/50 relative'
            : 'max-w-4xl h-screen sm:border-x sm:border-slate-800/40 shadow-2xl'
        }`}
      >
        {/* Telegram Top Header */}
        <TelegramHeader
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.enabled = next;
            showToast(next ? 'Звук включен' : 'Звук выключен');
          }}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
          isDarkTheme={isDarkTheme}
          onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          onOpenInfo={() => setIsInfoModalOpen(true)}
          userBalance={userBalance}
          onOpenCatalog={() => setIsShopCatalogModalOpen(true)}
          onOpenDeposit={() => setIsDepositModalOpen(true)}
        />

        {/* Chat Messages Scroll Container */}
        <div
          className={`flex-1 p-3 sm:p-4 overflow-y-auto ${
            isDarkTheme ? 'tg-pattern-dark' : 'tg-pattern-light'
          }`}
        >
          {/* Telegram Date Indicator */}
          <div className="flex justify-center my-3 select-none">
            <span
              className={`text-[11px] font-medium px-3 py-1 rounded-full backdrop-blur-md ${
                isDarkTheme
                  ? 'bg-black/30 text-slate-300 border border-white/5'
                  : 'bg-black/15 text-white'
              }`}
            >
              Сегодня
            </span>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isDarkTheme={isDarkTheme}
              onInlineClick={handleInlineClick}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Telegram Reply Keyboard (Persistent Buttons) */}
        <ReplyKeyboard
          isOpen={isReplyKeyboardOpen}
          isDarkTheme={isDarkTheme}
          onButtonClick={(label) => sendUserMessage(label)}
        />

        {/* Telegram Input Bar */}
        <ChatInput
          onSendMessage={sendUserMessage}
          onFileUpload={handleFileUpload}
          toggleReplyKeyboard={() => setIsReplyKeyboardOpen(!isReplyKeyboardOpen)}
          isReplyKeyboardOpen={isReplyKeyboardOpen}
          isDarkTheme={isDarkTheme}
        />
      </div>

      {/* Modals */}
      <ShopCatalogModal
        isOpen={isShopCatalogModalOpen}
        onClose={() => setIsShopCatalogModalOpen(false)}
        isDarkTheme={isDarkTheme}
        userBalance={userBalance}
        onBuyProduct={handleBuyProduct}
        onOpenDeposit={() => setIsDepositModalOpen(true)}
      />

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        isDarkTheme={isDarkTheme}
        userBalance={userBalance}
        onAddBalance={handleAddBalance}
      />

      <BotInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        isDarkTheme={isDarkTheme}
        onResetChat={handleResetChat}
      />

      <JniModal
        isOpen={isJniModalOpen}
        onClose={() => setIsJniModalOpen(false)}
        isDarkTheme={isDarkTheme}
        onRunCompilation={runJniCompilation}
        currentConfig={jniConfig}
        onChangeConfig={(newCfg) => setJniConfig((prev) => ({ ...prev, ...newCfg }))}
      />

      <PawnModal
        isOpen={isPawnModalOpen}
        onClose={() => setIsPawnModalOpen(false)}
        isDarkTheme={isDarkTheme}
        onRunCompilation={runPawnCompilation}
      />

      <LauncherModal
        isOpen={isLauncherModalOpen}
        onClose={() => setIsLauncherModalOpen(false)}
        isDarkTheme={isDarkTheme}
        onSendToChat={(text) => {
          sound.playIncoming();
          sendBotMessage(text);
        }}
      />

    </div>
  );
}
