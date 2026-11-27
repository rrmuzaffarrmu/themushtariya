// Fayl joyi: api/track.js
// Vercel -> Settings -> Environment Variables: BOT_TOKEN, ADMIN_ID (ixtiyoriy: SITE_HOST=themushtariya.vercel.app)
const NAMES = {
  visit: '👀 Sahifaga kirdi',
  telegram_kanal: '📢 Telegram Kanalimiz bosildi',
  telegram_aloqa: '💬 Telegram orqali bog‘lanish bosildi',
  manzil: '📍 Manzilimiz bosildi',
  qongiroq: '📞 Qo‘ng‘iroq qilish bosildi',
  youtube: '▶️ YouTube bosildi',
  whatsapp: '🟢 WhatsApp bosildi'
};
const esc = s => String(s || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const dec = s => { try { return decodeURIComponent(s || ''); } catch (e) { return s || ''; } };

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const token = process.env.BOT_TOKEN, admin = process.env.ADMIN_ID;
  if (!token || !admin) return res.status(500).end();

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (!NAMES[b.e]) return res.status(400).end();

  const h = req.headers, ua = h['user-agent'] || '';
  const site = process.env.SITE_HOST;
  if (site && !String(h.origin || h.referer || '').includes(site)) return res.status(403).end();
  if (/bot|crawl|spider|preview|facebookexternalhit/i.test(ua)) return res.status(200).end();

  const device = /iPhone|iPad/.test(ua) ? 'iPhone/iPad' : /Android/.test(ua) ? 'Android' : /Windows|Macintosh|Linux/.test(ua) ? 'Kompyuter' : 'Noma’lum';
  const app = /Instagram/i.test(ua) ? 'Instagram ilovasi ichida' : /FBAN|FBAV/.test(ua) ? 'Facebook ilovasi ichida' : /Telegram/i.test(ua) ? 'Telegram ichida' : 'Oddiy brauzer';
  const place = [dec(h['x-vercel-ip-city']), h['x-vercel-ip-country']].filter(Boolean).join(', ') || 'Noma’lum';
  const time = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Tashkent', hour12: false });
  const ref = String(b.r || '').slice(0, 100), src = String(b.s || '').slice(0, 40);

  const text = [
    `<b>${NAMES[b.e]}</b>`,
    `🕐 ${esc(time)}`,
    `📱 ${esc(device)} · ${esc(app)}`,
    `🌍 ${esc(place)}`,
    src ? `🏷 Manba: ${esc(src)}` : '',
    ref ? `🔗 Qayerdan: ${esc(ref)}` : ''
  ].filter(Boolean).join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: admin, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
  } catch (e) {}
  res.status(200).json({ ok: true });
};
