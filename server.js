const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS, map tiles, etc.)
app.use(express.static(path.join(__dirname)));

// API endpoint para sa Telegram log
app.get('/api/log-visit', async (req, res) => {
    const userIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    try {
        // Fetch geolocation from ipwho.is
        const geoRes = await fetch(`https://ipwho.is/${userIP}`);
        const geo = await geoRes.json();

        const message = `
🌐 *Bagong User sa AnoAngIpKo.com!*

🆔 *IP:* ${geo.ip || userIP}
📍 *Lokasyon:* ${geo.city || 'Hindi tiyak'}, ${geo.region || ''}, \( {geo.country || ''} ( \){geo.country_code || ''})
🌐 *ISP:* ${geo.connection?.isp || 'Unknown'}
🖥️ *Device:* ${userAgent.substring(0, 80)}...
🕐 *Oras:* ${new Date().toLocaleString('tl-PH', {timeZone: 'Asia/Manila'})}

${geo.proxy || geo.tor || geo.relay ? '⚠️ *Proxy/VPN/Tor Detected!*' : '✅ Normal connection'}
        `.trim();

        // === ILAGAY MO DITO ANG TOKEN AT CHAT_ID MO ===
        const BOT_TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_BOT_TOKEN_HERE';
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';

        if (BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE' && CHAT_ID !== 'YOUR_CHAT_ID_HERE') {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        }
    } catch (e) {
        console.error('Error:', e);
    }

    res.json({ status: 'logged' });
});

// Root route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});