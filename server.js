const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// React ka build folder serve karega
app.use(express.static(path.join(__dirname, 'dist')));

// API wala code wahi rahega (tumhara telegram wala)
app.post('/api/order', async (req, res) => {
  try {
    const orderData = req.body;
    const msg = `New Order - ${orderData.name} - ${orderData.phone} - Rs.${orderData.total}`;
    console.log(msg);
    // Telegram code yaha tha wahi rehne do
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// React ke liye
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Dhawan Mall Server is running on port ${PORT}`);
});
