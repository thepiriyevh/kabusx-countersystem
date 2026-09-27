const express = require('express');
const fetch = require('node-fetch');
const app = express();

const BOT_TOKEN  = process.env.BOT_TOKEN;
const CHAT_ID    = process.env.CHAT_ID;
const API_KEY    = process.env.YT_API_KEY;
const CHANNEL_ID = "UC7zlvo1M98giyCdGAKiMo-A";
const CHECK_MS   = 60000; // 60 saniyə (YouTube API kvotası üçün)

let lastCount = null;

async function sendTelegram(text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' })
    });
  } catch (e) { console.error('TG xəta:', e.message); }
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
      await sendTelegram(`🟢 <b>Bot işə başladı</b>\nKanal: <b>${name}</b>\nAbunə: <b>${subs}</b>`);
      return;
    }

    const diff = subs - lastCount;
    if (diff === 0) return;

    if (diff > 0) {
      await sendTelegram(`📈 <b>+${diff} yeni abunə!</b>\nKanal: <b>${name}</b>\nÜmumi: <b>${subs}</b>\nVaxt: ${now}`);
    } else {
      await sendTelegram(`📉 <b>${diff} abunə getdi</b>\nKanal: <b>${name}</b>\nÜmumi: <b>${subs}</b>\nVaxt: ${now}`);
    }
    lastCount = subs;
  } catch (e) { console.error('Yoxlama xətası:', e.message); }
}

check();
setInterval(check, CHECK_MS);

app.get('/', (_, res) => res.send('✅ KABUS X botu işləyir'));
app.listen(process.env.PORT || 3000, () => console.log('Server hazır'));
