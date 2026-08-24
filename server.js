import express from 'express';
const app=express();
app.use(express.json());
app.use(express.static('.'));

app.post('/api/order', async (req,res)=>{
  const {customer,product,price}=req.body;
  const BOT=process.env.BOT_TOKEN;
  const CHAT=process.env.CHAT_ID;
  if(BOT && CHAT){
    await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`,{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:CHAT,text:`🛒 Order: ${customer.name} ${customer.phone}\n${product} ₹${price}`})
    });
  }
  res.json({ok:true});
});
app.listen(process.env.PORT||3000);
