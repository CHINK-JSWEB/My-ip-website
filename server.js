const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API endpoint para sa Telegram logging
app.get('/api/log-visit', async (req, res) => {
    const userIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.headers['x-real-ip'] || 
                   req.socket.remoteAddress || 
                   'Unknown';
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'Direct';

    try {
        // Fetch detailed geolocation from ipwho.is
        const geoRes = await fetch(`https://ipwho.is/${userIP}`);
        const geo = await geoRes.json();

        // Format datetime
        const now = new Date();
        const phTime = now.toLocaleString('en-PH', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // Build Telegram message
        const message = `
🌐 *NEW VISITOR - My-IP-Address*

━━━━━━━━━━━━━━━━━━━━
📱 *VISITOR DETAILS*
━━━━━━━━━━━━━━━━━━━━

🆔 *IP Address:* \`${geo.ip || userIP}\`

📍 *LOCATION INFO*
   • 🏙️ City: ${geo.city || 'Unknown'}
   • 🗺️ Region: ${geo.region || 'Unknown'}
   • 🌍 Country: ${geo.country || 'Unknown'} ${geo.country_code ? `(${geo.country_code})` : ''}
   • 🎯 Coordinates: ${geo.latitude || 'N/A'}, ${geo.longitude || 'N/A'}
   • 📮 Postal: ${geo.postal || 'N/A'}
   • 🕐 Timezone: ${geo.timezone?.id || 'Unknown'}

🌐 *NETWORK INFO*
   • ISP: ${geo.connection?.isp || 'Unknown'}
   • ASN: ${geo.connection?.asn || 'N/A'}
   • Org: ${geo.connection?.org || 'N/A'}
   • Domain: ${geo.connection?.domain || 'N/A'}

🖥️ *DEVICE INFO*
   • Browser: ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}
   • Referer: ${referer}

${geo.flag?.emoji || '🏳️'} *Country Flag:* ${geo.flag?.emoji || ''}

${geo.proxy || geo.tor || geo.relay ? 
    '⚠️ *ALERT: Proxy/VPN/Tor Detected!*' : 
    '✅ *Normal Connection*'}

🕐 *Visit Time (PH):* ${phTime}

━━━━━━━━━━━━━━━━━━━━
🔗 *View on Map:* [Google Maps](https://www.google.com/maps?q=${geo.latitude},${geo.longitude})
━━━━━━━━━━━━━━━━━━━━

Powered by My-IP-Address | © 2025 Jonnel Soriano
        `.trim();

        // Your Telegram credentials
        const BOT_TOKEN = process.env.TELEGRAM_TOKEN || '8195403278:AAFK6s8cDdCbJS_9B1DOWrgx09hrAtXaKS4';
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7540290780';

        // Send to Telegram
        if (BOT_TOKEN && CHAT_ID && BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
            const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: false
                })
            });

            const telegramData = await telegramRes.json();
            
            if (!telegramData.ok) {
                console.error('Telegram API Error:', telegramData);
            } else {
                console.log('✅ Notification sent to Telegram successfully!');
            }
        }

        res.json({ 
            status: 'success', 
            message: 'Visit logged',
            data: {
                ip: geo.ip,
                location: `${geo.city}, ${geo.country}`
            }
        });

    } catch (e) {
        console.error('❌ Error logging visit:', e);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to log visit',
            error: e.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'My-IP-Address API',
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║   🚀 My-IP-Address Server Running    ║
║                                       ║
║   Port: ${PORT}                          ║
║   Status: ✅ Active                   ║
║   Telegram: ✅ Configured             ║
║                                       ║
║   © 2025 Jonnel Soriano              ║
╚═══════════════════════════════════════╝
    `);
});