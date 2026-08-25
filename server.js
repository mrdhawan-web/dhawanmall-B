const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Google Sheet se order Telegram pe (agar BOT_TOKEN hai toh)
app.post('/api/order', async (req,res)=>{
  console.log('Order:', req.body);
  try{
    const token = process.env.BOT_TOKEN;
    const chat = process.env.CHAT_ID;
    if(token && chat){
      let msg = `NEW ORDER\nName: ${req.body.customer?.name}\nPhone: ${req.body.customer?.phone}\nTotal: ${req.body.total}\nItems: ${req.body.products?.length}`;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat}&text=${encodeURIComponent(msg)}`);
    }
    res.json({ok:true});
  }catch(e){ res.json({ok:true}); }
});

app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, ()=> console.log('Live on '+PORT));
