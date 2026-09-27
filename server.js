const express = require('express');
const fetch = require('node-fetch');
const app = express();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const CHAT_ID    = process.env.CHAT_ID;
const API_KEY    = process.env.YT_API_KEY;
const CHANNEL_ID = "UC7zlvo1M98giyCdGAKiMo-A";
const CHECK_MS   = 60000; // 60 saniyə

let lastCount = null;

async function sendTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    });
  } catch (e) { console.error(e.message); }
}

async function check() {
  try {
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data.items?.length) return;

    const subs = parseInt(data.items[0].statistics.subscriberCount, 10);
    const name = data.items[0].snippet.title;
    const now  = new Date().toLocaleString('tr-TR');

    if (lastCount === null) {
      lastCount = subs;
      await sendTelegram(`🟢 Bot işə başladı\nKanal: ${name}\nAbunə: ${subs}`);
      return;
    }

    const diff = subs - lastCount;
    if (diff === 0) return;

    if (diff > 0) {
      await sendTelegram(`📈 +${diff} yeni abunə!\nKanal: ${name}\nÜmumi: ${subs}\nVaxt: ${now}`);
    } else {
      await sendTelegram(`📉 ${diff} abunə getdi\nKanal: ${name}\nÜmumi: ${subs}\nVaxt: ${now}`);
    }
    lastCount = subs;
  } catch (e) { console.error(e.message); }
}

check();
setInterval(check, CHECK_MS);

app.get('/', (_, res) => res.send('✅ Bot işləyir'));
app.listen(process.env.PORT || 3000);
