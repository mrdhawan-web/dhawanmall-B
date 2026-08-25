const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());
app.use(express.static('.'));

let lastOrder = {}; // Rate limit

app.post('/api/order', async (req, res) => {
  try {
    const ip = req.ip;
    if(lastOrder[ip] && Date.now() - lastOrder[ip] < 12000) {
      return res.status(429).json({error: "Slow down"});
    }
    lastOrder[ip] = Date.now();

    const {customer, products, total} = req.body;
    if(!customer ||!products || products.length==0) return res.status(400).json({error:"Invalid"});

    // SECURITY: Price validation 1-99000
    let calcTotal = 0;
    for(let p of products){
      let price = parseInt(p.price);
      if(!(price>=1 && price<=99000)) return res.status(400).json({error:"Price out of range"});
      calcTotal += price;
    }
    if(calcTotal!== parseInt(total)) return res.status(400).json({error:"Total mismatch"});

    // SECURITY: Sanitize
    const safe = (s) => String(s).replace(/</g,"").replace(/>/g,"").slice(0,100);

    let msg = `🛒 NEW ORDER\nName: ${safe(customer.name)}\nPhone: ${safe(customer.phone)}\nAddr: ${safe(customer.address)}\nTotal: ₹${calcTotal}\nItems: ${products.map(p=>safe(p.name)).join(', ')}`;

    await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({chat_id: process.env.CHAT_ID, text: msg})
    });

    res.json({ok:true});
  } catch(e){ res.status(500).json({error:"Server error"}) }
});

app.listen(process.env.PORT || 3000);;
