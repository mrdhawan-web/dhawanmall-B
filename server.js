const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('.'));

let lastOrder = {};

app.post('/api/order', async (req, res) => {
  try{
    const ip = req.headers['x-forwarded-for'] || req.ip;
    if(lastOrder[ip] && Date.now() - lastOrder[ip] < 15000) {
      return res.status(429).json({error:"Slow"});
    }
    lastOrder[ip] = Date.now();

    const {customer, products, total} = req.body;
    if(!products || products.length==0) return res.status(400).json({error:"empty"});

    let calcTotal = 0;
    for(let p of products){
      let pr = parseInt(p.price);
      if(!(pr>=1 && pr<=99000)) return res.status(400).json({error:"price range"});
      calcTotal += pr;
    }

    const safe = (s) => String(s||"").replace(/</g,"").slice(0,120);
    let msg = `🛒 NEW ORDER%0AName: ${safe(customer.name)}%0APhone: ${safe(customer.phone)}%0AAddr: ${safe(customer.address)}%0ATotal: ${calcTotal}%0AItems: ${products.map(p=>safe(p.name)).join(', ')}`;

    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    // Node 18 built-in fetch use kiya, node-fetch hataya
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${msg}`);

    res.json({ok:true});
  }catch(e){
    console.log(e);
    res.status(500).json({error:"server"});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Running '+PORT));
