const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ===== TELEGRAM + SMS =====
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

let bot = null;
try {
  if (process.env.Telegram_bot_token) {
    bot = new TelegramBot(process.env.Telegram_bot_token, { polling: false });
    console.log('Telegram Bot Ready');
  }
} catch (e) {
  console.log('Bot init skip:', e.message);
}

const CHAT_ID = process.env.Telegram_chat_id;
const SMS_KEY = process.env.fast2sms_api_key;

async function sendOrderNotification(orderData) {
  try {
    const msg = `New Order - ${orderData.name} - ${orderData.phone} - Rs.${orderData.total}`;
    console.log('Order Received:', orderData);
    if (bot && CHAT_ID) {
      await bot.sendMessage(CHAT_ID, msg).catch(err => console.log('Telegram fail:', err.message));
    }
  } catch (e) {
    console.log('Notify Error:', e.message);
  }
}

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/order', async (req, res) => {
  try {
    await sendOrderNotification(req.body);
    res.json({ success: true, message: 'Order placed' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'Order failed' });
  }
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`Dhawan Mall Server is running on port ${PORT}`);
});

module.exports = app;
