import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { telegramBotService } from './server/telegramBotService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Endpoints for Telegram Integration
  app.get('/api/telegram/status', (_req, res) => {
    res.json(telegramBotService.getStatus());
  });

  app.get('/api/telegram/logs', (_req, res) => {
    res.json(telegramBotService.getLogs());
  });

  app.post('/api/telegram/connect', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ ok: false, error: 'Токен бота не предоставлен' });
      }
      const bot = await telegramBotService.initBot(token.trim());
      res.json({ ok: true, bot });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ошибка подключения бота';
      res.status(400).json({ ok: false, error: message });
    }
  });

  app.post('/api/telegram/disconnect', (_req, res) => {
    telegramBotService.disconnect();
    res.json({ ok: true });
  });

  app.post('/api/telegram/test-message', async (req, res) => {
    try {
      const { chatId, text } = req.body;
      if (!chatId) {
        return res.status(400).json({ ok: false, error: 'Chat ID обязателен' });
      }
      await telegramBotService.sendTestMessage(Number(chatId), text || 'Тестовое сообщение из панели');
      res.json({ ok: true });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Ошибка отправки';
      res.status(400).json({ ok: false, error: message });
    }
  });

  // Webhook endpoint (if Telegram webhook mode is used)
  app.post('/api/telegram-webhook', async (req, res) => {
    try {
      if (req.body) {
        await telegramBotService.handleUpdate(req.body);
      }
      res.sendStatus(200);
    } catch (e) {
      console.error('Webhook error:', e);
      res.sendStatus(200);
    }
  });

  // Mount Vite middlewares in development or serve static in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Telegram Bot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
