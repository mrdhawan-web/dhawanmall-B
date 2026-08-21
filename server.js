const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // index.html, product.json serve karega

// ========== DATABASE ==========
// Agar MongoDB use nahi kar rahe to ye 4 line comment kar do // laga ke
// const mongoose = require('mongoose');
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dhawan_mall';
// mongoose.connect(MONGO_URL)
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log('MongoDB error:', err));


// ========== TELEGRAM + SMS FUNCTION ==========
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.Telegram_bot_token, { polling: false });
const CHAT_ID = process.env.Telegram_chat_id;
const SMS_KEY = process.env.fast2sms_api_key;

async function sendOrderNotification(orderData) {
    const msg = `🔔 New Order Dhawan Mall\nName: ${orderData.name}\nPhone: ${orderData.phone}\nTotal: ${orderData.total}`;
    
    // Telegram
    await bot.sendMessage(CHAT_ID, msg);
    
    // SMS
    await axios.post('https://www.fast2sms.com/dev/bulkV2', {
        message: msg,
        numbers: orderData.phone
    }, {
        headers: { authorization: SMS_KEY }
    });
}


// ========== ROUTES ==========
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


// ========== SERVER START ==========
app.listen(PORT, () => {
    console.log(`Dhawan Mall Server is running on port ${PORT}`);
});

module.exports = app;
