const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Enhanced Telegram logging with map image
app.get('/api/log-visit', async (req, res) => {
    const userIP = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                   req.headers['x-real-ip'] || 
                   req.socket.remoteAddress || 
                   'Unknown';
    
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const referer = req.headers['referer'] || 'Direct';
    const acceptLang = req.headers['accept-language']?.split(',')[0] || 'Unknown';

    try {
        const geoRes = await fetch(`https://ipwho.is/${userIP}`);
        const geo = await geoRes.json();

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

        // Detect browser and OS
        let browser = 'Unknown';
        let os = 'Unknown';
        
        if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        if (userAgent.includes('Windows')) os = 'Windows';
        else if (userAgent.includes('Mac')) os = 'macOS';
        else if (userAgent.includes('Linux')) os = 'Linux';
        else if (userAgent.includes('Android')) os = 'Android';
        else if (userAgent.includes('iOS')) os = 'iOS';

        // Build enhanced message
        const message = `
🚀 *NEW VISITOR ALERT* 🚀
━━━━━━━━━━━━━━━━━━━━━━━━

🌐 *IP INFORMATION*
┣ 🆔 IP: \`${geo.ip || userIP}\`
┣ 📱 Type: ${geo.ip?.includes(':') ? 'IPv6' : 'IPv4'}
┗ ${geo.proxy || geo.tor || geo.relay ? '⚠️ *VPN/PROXY DETECTED*' : '✅ *Clean Connection*'}

📍 *GEOLOCATION*
┣ 🌍 Country: ${geo.country || 'Unknown'} ${geo.flag?.emoji || '🏳️'}
┣ 🏙️ City: ${geo.city || 'Unknown'}
┣ 📍 Region: ${geo.region || 'Unknown'}
┣ 🎯 Coordinates: \`${geo.latitude}, ${geo.longitude}\`
┣ 📮 Postal: ${geo.postal || 'N/A'}
┗ 🕐 Timezone: ${geo.timezone?.id || 'Unknown'}

🌐 *NETWORK DETAILS*
┣ 🏢 ISP: ${geo.connection?.isp || 'Unknown'}
┣ 🔢 ASN: ${geo.connection?.asn || 'N/A'}
┣ 🏛️ Organization: ${geo.connection?.org || 'N/A'}
┗ 🌐 Domain: ${geo.connection?.domain || 'N/A'}

💻 *DEVICE INFORMATION*
┣ 🖥️ Browser: ${browser}
┣ 📱 OS: ${os}
┣ 🌍 Language: ${acceptLang}
┗ 🔗 Referer: ${referer.substring(0, 50)}${referer.length > 50 ? '...' : ''}

⏰ *VISIT TIME (PH)*
┗ 🕐 ${phTime}

━━━━━━━━━━━━━━━━━━━━━━━━
🗺️ [View on Google Maps](https://www.google.com/maps?q=${geo.latitude},${geo.longitude})
🌐 [IP Lookup](https://ipwho.is/${geo.ip})
━━━━━━━━━━━━━━━━━━━━━━━━

⚡ *My-IP-Address Ultimate*
© 2025 Jonnel Soriano
        `.trim();

        const BOT_TOKEN = process.env.TELEGRAM_TOKEN || '8195403278:AAFK6s8cDdCbJS_9B1DOWrgx09hrAtXaKS4';
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7540290780';

        if (BOT_TOKEN && CHAT_ID) {
            // Send text message
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
            
            if (telegramData.ok) {
                console.log('✅ Telegram notification sent!');
                
                // Try to send location
                try {
                    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendLocation`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: CHAT_ID,
                            latitude: parseFloat(geo.latitude),
                            longitude: parseFloat(geo.longitude)
                        })
                    });
                    console.log('✅ Location sent to Telegram!');
                } catch (locErr) {
                    console.log('⚠️ Could not send location:', locErr.message);
                }
            } else {
                console.error('❌ Telegram error:', telegramData);
            }
        }

        res.json({ 
            status: 'success', 
            message: 'Visit logged',
            data: {
                ip: geo.ip,
                location: `${geo.city}, ${geo.country}`,
                browser,
                os
            }
        });

    } catch (e) {
        console.error('❌ Error:', e);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to log visit',
            error: e.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'My-IP-Address Ultimate API',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// Serve index
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 MY-IP-ADDRESS ULTIMATE EDITION 🚀       ║
║                                               ║
║   Port: ${PORT}                                  ║
║   Status: ✅ ONLINE & ACTIVE                  ║
║   Telegram: ✅ CONFIGURED                     ║
║   Features: 🎨 ALL-IN                         ║
║                                               ║
║   © 2025 Jonnel Soriano                      ║
║   Version: 2.0.0 Ultimate                    ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);
});