import { InlineButton } from '../types';

export const BOT_INFO = {
  name: 'NEXUS SHOP | CRMP & SA-MP',
  username: 'nexus_shop_crmp_bot',
  tagline: 'Автоматический магазин виртов, доната, аккаунтов, лаунчеров и JNI скриптов',
  creator: '@nexus_owner',
  channel: '@nexus_crmp',
  channelUrl: 'https://t.me/nexus_crmp',
  supportUser: '@nexus_crmp_support',
  version: 'v4.2.0 (Nexus Shop Core)',
  status: 'online',
  stats: {
    totalUsers: '28,490',
    totalOrders: '64,120',
    totalReviews: '1,890+',
    avgDeliveryTime: 'Мгновенно (0.5 сек)',
  },
  commands: [
    { command: '/start', description: '🛒 Главное меню магазина NEXUS SHOP' },
    { command: '/catalog', description: '🛍 Каталог товаров (вирты, софт, аккаунты)' },
    { command: '/balance', description: '💰 Пополнить баланс (СБП, Карты, ЮMoney)' },
    { command: '/profile', description: '👤 Личный кабинет, заказы и промокоды' },
    { command: '/bonus', description: '🎁 Ежедневный бесплатный бонус на баланс' },
    { command: '/jni', description: '🛠 JNI Builder (компиляция .so библиотек)' },
    { command: '/pawn', description: '📜 PAWN Compiler (сборка модов .pwn -> .amx)' },
    { command: '/reviews', description: '⭐️ Отзывы покупателей и гарантии' },
    { command: '/help', description: 'ℹ️ Помощь, инструкции и поддержка' },
  ],
};

// Reply Keyboard (Bottom Persistent Panel)
export const REPLY_KEYBOARD = [
  ['🛍 Каталог товаров', '💰 Пополнить баланс'],
  ['👤 Личный кабинет', '📦 Мои покупки'],
  ['🛠 JNI & Скрипты', '⭐️ Отзывы & Гарантии'],
];

// Product Category Types
export interface ShopProduct {
  id: string;
  categoryId: string;
  title: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  stockCount: number | string;
  badge?: string;
  description: string;
  itemDeliveryContent: string; // Given to user upon purchase
  filename?: string;
  imageUrl?: string;
}

export interface ShopCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
}

export const SHOP_CATEGORIES: ShopCategory[] = [
  {
    id: 'currency',
    title: '💰 Вирты & Игровая валюта',
    icon: '💰',
    description: 'Игровая валюта на популярных проектах: Black Russia, Radmir, Live Russia, Grand Mobile.',
  },
  {
    id: 'scripts_dev',
    title: '🛠 Скрипты, Лаунчеры & JNI',
    icon: '🛠',
    description: 'Исходники лаунчеров с автообновлением, JNI хуки, антикраши, PAWN компилятор.',
  },
  {
    id: 'accounts',
    title: '👑 Аккаунты с имуществом',
    icon: '👑',
    description: 'Прокачанные аккаунты с элитными авто, виллами, бизнесами и высоким уровнем.',
  },
  {
    id: 'modpacks',
    title: '📦 Модпаки, Текстуры & Графика',
    icon: '📦',
    description: 'Приватные зимние/летние модпаки, 4K дороги, звуки, замена автопарка, Custom HUD.',
  },
  {
    id: 'soft_tools',
    title: '🔑 Софт & Приватные утилиты',
    icon: '🔑',
    description: 'Чекеры онлайна, автокликеры, автоловля объявлений СМИ, боты для работ.',
  },
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  // 1. Currency
  {
    id: 'br_virts_1kk',
    categoryId: 'currency',
    title: 'Black Russia — 1.000.000 виртов',
    price: 85,
    oldPrice: 110,
    inStock: true,
    stockCount: '180кк в наличии',
    badge: 'ХИТ ПРОДАЖ',
    description: 'Чистые вирты, полученные легальным путём (перепродажи авто, бизнес). Передача через банк или трейд без банов.',
    itemDeliveryContent: 'Инструкция по получению: свяжитесь с курьером @nexus_delivery_bot, укажите номер заказа #NEXUS-BR-1KK и ваш никнейм на сервере.',
    imageUrl: '/src/assets/images/crmp_virts_banner_1793371098173.jpg',
  },
  {
    id: 'br_virts_5kk',
    categoryId: 'currency',
    title: 'Black Russia — 5.000.000 виртов (Пак)',
    price: 390,
    oldPrice: 470,
    inStock: true,
    stockCount: '50кк в наличии',
    badge: 'ВЫГОДА -15%',
    description: 'Выгодный пакет виртов на любом сервере Black Russia (Red, Green, Blue, Cherry, etc.). Моментальная передача.',
    itemDeliveryContent: 'Чек заказа #NEXUS-BR-5KK. Код активации: BR-5000K-SECURE-TRANSFER. Курьер назначен.',
    imageUrl: '/src/assets/images/crmp_virts_banner_1793371098173.jpg',
  },
  {
    id: 'radmir_virts_1kk',
    categoryId: 'currency',
    title: 'Radmir CRMP / Hassle — 1.000.000 ₽',
    price: 79,
    oldPrice: 95,
    inStock: true,
    stockCount: '94кк',
    description: 'Вирты на серверах Radmir RP 01-18. Безопасная передача через нотариуса или продажу транспорта.',
    itemDeliveryContent: 'Заказ #NEXUS-RADMIR-1KK. Введите никнейм и сервер для перевода через курьера.',
  },
  {
    id: 'liverussia_virts_1kk',
    categoryId: 'currency',
    title: 'Live Russia — 1.000.000 LC',
    price: 65,
    oldPrice: 85,
    inStock: true,
    stockCount: '45кк',
    description: 'Игровая валюта Live Russia. Все сервера. Доставка в течение 5 минут.',
    itemDeliveryContent: 'Код получения #LR-1KK-PASS. Напишите нашему саппорту для выдачи.',
  },

  // 2. Developer & Scripts
  {
    id: 'jni_builder_pro',
    categoryId: 'scripts_dev',
    title: '🛠 JNI Builder Cloud (Безлимитная сборка .so)',
    price: 0,
    inStock: true,
    stockCount: 'Неограниченно',
    badge: 'БЕСПЛАТНО',
    description: 'Облачная компиляция C++ исходников в библиотеку .so под Android NDK (r21e - r27) для CRMP клиентов.',
    itemDeliveryContent: 'Доступ активирован! Воспользуйтесь разделом 🛠 JNI Builder в меню или командой /jni.',
    filename: 'libclient.so',
  },
  {
    id: 'launcher_source_2026',
    categoryId: 'scripts_dev',
    title: '📱 Исходники лаунчера CRMP Android + Сервер обновлений',
    price: 490,
    oldPrice: 990,
    inStock: true,
    stockCount: 'Цифровой товар',
    badge: 'ТОП ДЛЯ СЕРВЕРА',
    description: 'Полный готовый проект кастомного Android лаунчера в Android Studio. Включает: автообновление кэша через filelist.json, парсинг онлайна, интеграцию новостей, смену ника.',
    itemDeliveryContent: 'Архив проекта: https://cdn.nexus-crmp.net/sources/Nexus_CRMP_Launcher_Full_v4.zip\nПароль: nexus_dev_2026',
    filename: 'Nexus_Launcher_Project.zip',
    imageUrl: '/src/assets/images/crmp_launcher_preview_1793371099193.jpg',
  },
  {
    id: 'pawn_gamemode_crmp',
    categoryId: 'scripts_dev',
    title: '📜 Чистая основа мода CRMP 0.3.7 (MySQL R41-4)',
    price: 290,
    oldPrice: 450,
    inStock: true,
    stockCount: 'Цифровой товар',
    description: 'Оптимизированный игровой мод без крашей и дыр. Система регистрации, админ-панель, инвентарь, автосалон, динамические фракции.',
    itemDeliveryContent: 'Ссылка на модпак и исходник .pwn: https://cdn.nexus-crmp.net/mods/Clean_CRMP_MySQL_R41.zip',
    filename: 'Clean_CRMP_Gamemode.pwn',
  },
  {
    id: 'crmp_crashfix_fps',
    categoryId: 'scripts_dev',
    title: '⚡️ JNI Хук: CrashFix 1024MB + 120 FPS Unlocker',
    price: 149,
    oldPrice: 250,
    inStock: true,
    stockCount: 'Всегда в наличии',
    description: 'Готовая .so библиотека для внедрения в APK лаунчера. Снимает лимит текстурной памяти и открывает 90-120 кадров/сек.',
    itemDeliveryContent: 'Библиотека libcrashfix.so готова к интеграции. Скачайте файл и добавьте в libs/armeabi-v7a/.',
    filename: 'libcrashfix.so',
  },

  // 3. Accounts
  {
    id: 'acc_br_15lvl',
    categoryId: 'accounts',
    title: 'Аккаунт Black Russia — 15 LVL (BMW M5 F90, 8.5кк)',
    price: 450,
    oldPrice: 650,
    inStock: true,
    stockCount: '1 шт.',
    badge: 'ТОП АККАУНТ',
    description: 'Сервер Black. В наличии BMW M5 F90 Sport+, гараж в г. Арзамас, 8.500.000 виртов на руках. Скины из блекпасса. Без привязок.',
    itemDeliveryContent: 'Логин: Danil_Belo***\nПароль: NexusPass2026!#\nПин-код: 1984\nВсе привязки отвязаны. Обязательно смените пароль и привяжите свой VK/TG.',
  },
  {
    id: 'acc_radmir_18lvl',
    categoryId: 'accounts',
    title: 'Аккаунт Radmir CRMP — 18 LVL (Mercedes G63, Дом)',
    price: 590,
    oldPrice: 850,
    inStock: true,
    stockCount: '1 шт.',
    description: 'Сервер 03. Mercedes-Benz G63 AMG (Full Tune), дом в Бусаево, 12кк на банковском счете. Высокий ранг в ТРК.',
    itemDeliveryContent: 'Логин: Roman_Kuzn***\nПароль: RadmirTop_Nexus#99\nПривязка: чистая, готова к переносу.',
  },

  // 4. Modpacks
  {
    id: 'modpack_winter_2026',
    categoryId: 'modpacks',
    title: '❄️ Приватный Зимний Модпак CRMP 2026 (Full HD)',
    price: 190,
    oldPrice: 300,
    inStock: true,
    stockCount: 'Цифровой товар',
    badge: 'NEW',
    description: 'Качественный зимний пак: падающий снег, реалистичный лед на дорогах, дым из выхлопных труб, замена 120+ автомобилей на русские и иномарки.',
    itemDeliveryContent: 'Ссылка на кэш: https://cdn.nexus-crmp.net/cache/WinterPack_HD_v2026.zip\nИнструкция: распаковать в /Android/data/ваша_игра/files/',
    filename: 'WinterPack_HD_v2026.zip',
    imageUrl: '/src/assets/images/winter_modpack_banner_1793371099444.jpg',
  },
  {
    id: 'modpack_low_fps',
    categoryId: 'modpacks',
    title: '🚀 Low-PC Оптимизатор (+45 FPS для слабых телефонов)',
    price: 99,
    oldPrice: 150,
    inStock: true,
    stockCount: 'Всегда в наличии',
    description: 'Убирает мусорные частицы, сжимает текстуры без потери читаемости номеров, убирает фризы при перестрелках и скоплении машин.',
    itemDeliveryContent: 'Ссылка: https://cdn.nexus-crmp.net/cache/FPS_Booster_CRMP.zip\nУстановка в один клик через лаунчер.',
    filename: 'FPS_Booster_CRMP.zip',
  },

  // 5. Soft & Tools
  {
    id: 'autoclicker_smi',
    categoryId: 'soft_tools',
    title: '📰 Автоловля объявлений СМИ (Android Script)',
    price: 120,
    oldPrice: 200,
    inStock: true,
    stockCount: 'Цифровой товар',
    description: 'Мгновенно редактирует и ловит объявления в радиостанции/СМИ. Зарабатывайте от 500.000 виртов в час на автомате.',
    itemDeliveryContent: 'Скрипт AutoSMI.lua + инструкция по внедрению в MoonLoader Mobile: https://cdn.nexus-crmp.net/tools/AutoSMI_Mobile.zip',
    filename: 'AutoSMI_Mobile.zip',
  },
];

// Start Welcome Message
export const START_MESSAGE_TEXT = `👋 <b>Добро пожаловать в NEXUS SHOP CRMP!</b>

🛒 <b>@nexus_shop_crmp_bot</b> — проверенный автоматический магазин игровых товаров, виртов, аккаунтов, лаунчеров и разработческих утилит для <b>CRMP & SA-MP Mobile</b>.

💳 <b>Ваш профиль:</b>
• <b>Баланс:</b> <code>{balance} ₽</code>
• <b>Ваш Telegram ID:</b> <code>{id}</code>
• <b>Покупок совершено:</b> <code>{ordersCount}</code>

⚡️ <b>Почему выбирают NEXUS SHOP:</b>
✅ Автоматическая выдача товара сразу после оплаты 24/7
✅ Гарантия безопасности от блокировок
✅ Поддержка СБП, Карт РФ/МИР, ЮMoney, Crypto и Telegram Stars
✅ Встроенные инструменты для разработчиков: <b>JNI Builder (.so)</b> и <b>PAWN Compiler (.amx)</b>

👇 <i>Выберите нужный раздел в меню или воспользуйтесь каталогом:</i>`;

export const START_INLINE_KEYBOARD: InlineButton[][] = [
  [
    { text: '🛍 Каталог товаров', callback_data: 'shop_catalog' },
    { text: '💰 Пополнить баланс', callback_data: 'shop_deposit' },
  ],
  [
    { text: '👤 Мой кабинет', callback_data: 'shop_profile' },
    { text: '📦 Мои покупки', callback_data: 'shop_orders' },
  ],
  [
    { text: '🛠 JNI & Разработка', callback_data: 'menu_jni' },
    { text: '🎁 Бесплатный бонус', callback_data: 'shop_daily_bonus' },
  ],
  [
    { text: '⭐️ Отзывы покупателей (1,890+)', callback_data: 'shop_reviews' },
    { text: '💬 Поддержка', callback_data: 'shop_support' },
  ],
  [
    { text: '📢 Наш канал @nexus_crmp', callback_data: 'open_channel' },
  ],
];

// Sample Customer Reviews
export const SAMPLE_REVIEWS = [
  {
    author: 'Артём М. (Red Server)',
    rating: '⭐️⭐️⭐️⭐️⭐️',
    date: 'Сегодня, 11:42',
    product: 'Black Russia — 5.000.000 виртов',
    comment: 'Купил 5кк, курьер передал через банк за 3 минуты! Все четко, бана нет, респект магазину.',
  },
  {
    author: 'Vlad_Developer',
    rating: '⭐️⭐️⭐️⭐️⭐️',
    date: 'Вчера, 19:15',
    product: 'Исходники лаунчера CRMP Android',
    comment: 'Лаунчер запустился в Android Studio с первого раза. Автообновление кэша работает на ура, клиенты довольны!',
  },
  {
    author: 'Максим (Radmir 03)',
    rating: '⭐️⭐️⭐️⭐️⭐️',
    date: 'Вчера, 14:02',
    product: 'Аккаунт Radmir CRMP (Mercedes G63)',
    comment: 'Данные выдали моментально. Перевязал почту и двухфакторку, всё совпадает как в описании. Спасибо!',
  },
];

// JNI & PAWN data (preserved for seamless developer tools!)
export const JNI_MENU_TEXT = `🛠 <b>JNI BUILDER & DEV HUB | NEXUS DEVELOPER</b>

Скомпилируйте исходники нативного кода в готовую <code>.so</code> библиотеку для Android в пару кликов!

⚙️ <b>Текущая конфигурация:</b>
• <b>Версия NDK:</b> <code>{ndk}</code>
• <b>Архитектура:</b> <code>{arch}</code>
• <b>Стандарт C++:</b> <code>{cxx}</code>
• <b>Оптимизация:</b> <code>{opt}</code>
• <b>Strip symbols:</b> <code>{strip}</code>

📦 <b>Как начать сборку:</b>
1. Загрузите <b>ZIP-архив</b> с папкой <code>jni/</code> или один <code>.cpp</code> файл через скрепку.
2. Либо выберите готовый тестовый пресет хуков ниже.`;

export const JNI_INLINE_KEYBOARD = (ndk: string, arch: string): InlineButton[][] => [
  [
    { text: '⚡️ Запустить быструю компиляцию', callback_data: 'jni_start_compile' },
  ],
  [
    { text: '📂 Выбрать готовый пресет кода (C++)', callback_data: 'jni_presets' },
    { text: '📤 Загрузить свой файл/ZIP', callback_data: 'jni_upload_custom' },
  ],
  [
    { text: `⚙️ NDK: ${ndk}`, callback_data: 'jni_select_ndk' },
    { text: `🎯 Архитектура: ${arch}`, callback_data: 'jni_select_arch' },
  ],
  [
    { text: '🛍 В магазин товаров', callback_data: 'shop_catalog' },
    { text: '🔙 Главное меню', callback_data: 'menu_main' },
  ],
];

export const NDK_VERSIONS = [
  'NDK r25c (LTS)',
  'NDK r26d',
  'NDK r27',
  'NDK r23b',
  'NDK r21e',
];

export const ARCHITECTURES = [
  { id: 'armeabi-v7a', label: 'armeabi-v7a (32-bit CRMP/SA-MP)' },
  { id: 'arm64-v8a', label: 'arm64-v8a (64-bit Android 12+)' },
  { id: 'x86', label: 'x86 (Эмуляторы ПК)' },
  { id: 'all', label: '📦 Собрать под все ABI (ZIP)' },
];

export const JNI_PRESETS = [
  {
    id: 'crmp_crashfix',
    title: '🛡 CRMP CrashFix & Texture Hook',
    filename: 'libclient.so',
    description: 'Хук для предотвращения вылетов при загрузке тяжелых текстур и кастомных моделей в CRMP.',
    code: `// Nexus CRMP CrashFix Hook for Android
#include <jni.h>
#include <android/log.h>
#include <unistd.h>
#include <sys/mman.h>

#define TAG "NexusDev_CrashFix"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

extern "C" {
    JNIEXPORT jint JNI_OnLoad(JavaVM* vm, void* reserved) {
        LOGI("Initializing Nexus CRMP CrashFix Module...");
        LOGI("Memory patched successfully. Hook active!");
        return JNI_VERSION_1_6;
    }
}`,
  },
  {
    id: 'fps_unlocker',
    title: '⚡️ 90/120 FPS Unlocker Hook',
    filename: 'libfpsunlock.so',
    description: 'Разблокировка 60/90/120 кадров в секунду на экранах с высокой герцовкой.',
    code: `// Nexus 120 FPS Frame Limiter Patch
#include <jni.h>
#include <stdint.h>
#include <android/log.h>

#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, "Nexus_FPS", __VA_ARGS__)

extern "C" JNIEXPORT void JNICALL
Java_com_nexus_launcher_GameActivity_unlockFps(JNIEnv* env, jobject thiz, jint targetFps) {
    LOGD("Setting target FPS limit to: %d", targetFps);
}`,
  },
];

export const PAWN_PRESETS = [
  {
    id: 'crmp_admin_cmd',
    title: '👑 Система админ-команд (/apanel, /kick)',
    filename: 'admin_system.pwn',
    code: `#include <a_samp>
#include <zcmd>

CMD:apanel(playerid, params[]) {
    if(!IsPlayerAdmin(playerid)) return 0;
    SendClientMessage(playerid, 0x00FF00FF, "[NEXUS] Панель администратора активирована!");
    return 1;
}`,
  },
];

export const SAMPLE_SERVERS = [
  {
    ip: 's1.nexus-crmp.ru',
    port: 7777,
    name: '🔴 Nexus RolePlay | Мобильная Россия #1',
    online: 994,
    maxPlayers: 1000,
    gamemode: 'Nexus RP v4.2',
    language: 'Russian / Русский',
    ping: 24,
    isOnline: true,
  },
  {
    ip: 's2.nexus-crmp.ru',
    port: 7777,
    name: '🔵 Nexus RolePlay | Сервер #2 [X3 День]',
    online: 878,
    maxPlayers: 1000,
    gamemode: 'Nexus RP v4.2',
    language: 'Russian / Русский',
    ping: 31,
    isOnline: true,
  },
];

export const HELP_INSTRUCTION_TEXT = `ℹ️ <b>ПОМОЩЬ И ГАРАНТИИ NEXUS SHOP CRMP</b>

🛒 <b>1. Как совершить покупку:</b>
• Откройте <b>🛍 Каталог товаров</b> и выберите нужный раздел (вирты, софт, аккаунты).
• Нажмите на товар, чтобы прочитать описание и стоимость.
• Нажмите <b>Купить</b> — товар будет выдан мгновенно прямо в этот чат!

💰 <b>2. Пополнение баланса:</b>
• Мы принимаем: <b>СБП (без комиссии)</b>, Банковские карты (МИР, Visa, Mastercard), <b>ЮMoney</b>, <b>USDT TRC-20</b> и <b>Telegram Stars</b>.
• Зачисление средств происходит автоматически за 10-30 секунд.

🛡 <b>3. Гарантии:</b>
• Более 1,890+ подтвержденных отзывов.
• Вирты передаются через безопасные методы без риска блокировок.

🎁 <b>4. Промокоды и Бонусы:</b>
• Используйте промокод <code>NEXUS</code> для получения +150 ₽ на баланс!
• Забирайте ежедневный бонус в разделе <b>🎁 Бесплатный бонус</b>.

💬 <b>Служба поддержки 24/7:</b> @nexus_crmp_support`;
