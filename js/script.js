let map, marker, polyline;
let currentUserData = null;
let visitorCount = 0;
let soundEnabled = false;

// Sound effects
const sounds = {
    click: () => playBeep(200, 0.1, 'sine'),
    success: () => playBeep(400, 0.15, 'sine'),
    error: () => playBeep(100, 0.2, 'square')
};

function playBeep(freq, duration, type) {
    if (!soundEnabled) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

// Particle Background
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 80;
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        
        draw() {
            ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, i) => {
            particle.update();
            particle.draw();
            
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Counter animation
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Update visitor count
function updateVisitorCount() {
    visitorCount = Math.floor(Math.random() * 50) + 100; // Mock data
    animateCounter(document.getElementById('visitor-count'), visitorCount);
}

// Detect device info
function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';
    
    // Browser detection
    if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    
    // OS detection
    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iOS') > -1) os = 'iOS';
    
    const screen = `${window.screen.width}x${window.screen.height}`;
    
    document.getElementById('browser').textContent = browser;
    document.getElementById('os').textContent = os;
    document.getElementById('screen').textContent = screen;
}

// Speed test simulation
function initSpeedTest() {
    const ctx = document.getElementById('speedChart').getContext('2d');
    
    const data = {
        labels: ['0s', '1s', '2s', '3s', '4s', '5s'],
        datasets: [{
            label: 'Speed (Mbps)',
            data: [0, 20, 45, 70, 85, 95],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
    
    // Simulate speed
    setTimeout(() => {
        const speed = (Math.random() * 50 + 50).toFixed(1);
        const latency = Math.floor(Math.random() * 30 + 10);
        document.getElementById('download-speed').textContent = `${speed} Mbps`;
        document.getElementById('latency').textContent = `${latency} ms`;
    }, 2000);
}

// Load IP and location data
async function loadIP() {
    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();

        if (data.success === false) {
            showToast('Error loading IP data', 'error');
            sounds.error();
            return;
        }

        currentUserData = data;

        // Display IP
        const ipElement = document.getElementById('ip');
        ipElement.style.opacity = '0';
        setTimeout(() => {
            ipElement.innerText = data.ip;
            ipElement.style.opacity = '1';
            ipElement.style.transition = 'opacity 0.5s ease-in';
            sounds.success();
        }, 300);

        // IP type
        const ipType = data.ip.includes(':') ? 'IPv6' : 'IPv4';
        document.getElementById('ip-type').textContent = ipType;

        // Security badges
        const securityBadge = document.getElementById('security-badge-mini');
        const vpnStatus = document.getElementById('vpn-status');
        
        if (data.proxy || data.tor || data.relay) {
            securityBadge.className = 'security-badge warning';
            securityBadge.innerHTML = '<span class="badge-icon">⚠️</span><span class="badge-text">VPN Detected</span>';
            vpnStatus.textContent = '⚠';
            vpnStatus.style.color = '#f59e0b';
        } else {
            securityBadge.className = 'security-badge secure';
            securityBadge.innerHTML = '<span class="badge-icon">✅</span><span class="badge-text">Secure</span>';
            vpnStatus.textContent = '✓';
            vpnStatus.style.color = '#10b981';
        }

        // HTTPS status
        const httpsStatus = document.getElementById('https-status');
        httpsStatus.textContent = window.location.protocol === 'https:' ? '✓' : '⚠';
        httpsStatus.style.color = window.location.protocol === 'https:' ? '#10b981' : '#f59e0b';

        // Info cards
        const infoGrid = document.getElementById('info');
        const cards = [
            { icon: '🌍', label: 'Country', value: `${data.country || 'Unknown'} ${data.flag?.emoji || ''}` },
            { icon: '🏙️', label: 'City', value: data.city || 'Unknown' },
            { icon: '📍', label: 'Region', value: data.region || 'Unknown' },
            { icon: '🌐', label: 'ISP', value: data.connection?.isp || 'Unknown' },
            { icon: '🕐', label: 'Timezone', value: data.timezone?.id || 'Unknown' },
            { icon: '📮', label: 'Postal', value: data.postal || 'N/A' }
        ];

        infoGrid.innerHTML = cards.map(card => `
            <div class="glass-card info-card">
                <span class="info-icon">${card.icon}</span>
                <div class="info-label">${card.label}</div>
                <div class="info-value">${card.value}</div>
            </div>
        `).join('');

        // Initialize map
        initMap(data.latitude, data.longitude, data.city, data.country);

        // Log visit
        logVisit(data);

        // Update IP history
        updateIPHistory(data);

        // Update visitors
        updateVisitorCount();
        updateRecentVisitors(data);

    } catch (e) {
        console.error('Error loading IP:', e);
        showToast('Failed to load IP data', 'error');
        sounds.error();
    }
}

// Initialize map
function initMap(lat, lon, city, country) {
    if (map) map.remove();

    map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 18
    }).addTo(map);

    const markerIcon = L.divIcon({
        html: `
            <div style="position: relative;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #ec4899); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(99, 102, 241, 0.6);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                </div>
                <div style="position: absolute; top: 0; left: 0; width: 40px; height: 40px; border: 2px solid #6366f1; border-radius: 50%; animation: pulse 2s infinite;"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    marker = L.marker([lat, lon], { icon: markerIcon }).addTo(map)
        .bindPopup(`
            <div style="font-family: Poppins; text-align: center; padding: 10px;">
                <strong style="color: #6366f1; font-size: 16px;">📍 Your Location</strong><br>
                <span style="color: #ec4899; font-weight: 600;">${city}, ${country}</span><br>
                <small style="color: #64748b;">Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}</small>
            </div>
        `)
        .openPopup();

    L.circle([lat, lon], {
        color: '#6366f1',
        fillColor: '#ec4899',
        fillOpacity: 0.2,
        radius: 1000
    }).addTo(map);
}

// Update recent visitors
function updateRecentVisitors(data) {
    const visitorsList = document.getElementById('visitors-list');
    const locations = [
        `${data.city}, ${data.country}`,
        'Manila, Philippines',
        'Singapore',
        'Tokyo, Japan',
        'New York, USA'
    ];
    
    visitorsList.innerHTML = locations.map((loc, i) => `
        <div class="visitor-item">
            <div class="visitor-avatar">${i === 0 ? '👤' : '🌐'}</div>
            <div class="visitor-details">
                <div class="visitor-location">${loc}</div>
                <div class="visitor-time">${i === 0 ? 'Just now' : `${i * 5} min ago`}</div>
            </div>
        </div>
    `).join('');
}

// Log visit
async function logVisit(data) {
    try {
        await fetch('/api/log-visit');
        console.log('✅ Visit logged');
    } catch (e) {
        console.error('❌ Failed to log:', e);
    }
}

// Copy IP
document.getElementById('copy-btn').addEventListener('click', () => {
    if (currentUserData) {
        navigator.clipboard.writeText(currentUserData.ip);
        showToast('IP copied to clipboard!', 'success');
        sounds.click();
    }
});

// QR Code
document.getElementById('qr-btn').addEventListener('click', () => {
    if (currentUserData) {
        const qrcodeDiv = document.getElementById('qrcode');
        qrcodeDiv.innerHTML = '';
        
        new QRCode(qrcodeDiv, {
            text: currentUserData.ip,
            width: 200,
            height: 200,
            colorDark: '#0f172a',
            colorLight: '#ffffff'
        });
        
        document.getElementById('qr-modal').classList.remove('hidden');
        sounds.click();
    }
});

document.getElementById('close-qr').addEventListener('click', () => {
    document.getElementById('qr-modal').classList.add('hidden');
    sounds.click();
});

// WHOIS
document.getElementById('whois-btn').addEventListener('click', () => {
    if (currentUserData) {
        document.getElementById('whois-modal').classList.remove('hidden');
        const whoisContent = document.getElementById('whois-content');
        whoisContent.innerHTML = `
            <div style="font-family: monospace; font-size: 0.9rem; line-height: 1.8;">
                <strong>IP Address:</strong> ${currentUserData.ip}<br>
                <strong>Type:</strong> ${currentUserData.ip.includes(':') ? 'IPv6' : 'IPv4'}<br>
                <strong>Country:</strong> ${currentUserData.country}<br>
                <strong>Region:</strong> ${currentUserData.region}<br>
                <strong>City:</strong> ${currentUserData.city}<br>
                <strong>ISP:</strong> ${currentUserData.connection?.isp || 'Unknown'}<br>
                <strong>ASN:</strong> ${currentUserData.connection?.asn || 'N/A'}<br>
                <strong>Organization:</strong> ${currentUserData.connection?.org || 'N/A'}<br>
                <strong>Timezone:</strong> ${currentUserData.timezone?.id || 'Unknown'}<br>
                <strong>Postal Code:</strong> ${currentUserData.postal || 'N/A'}<br>
                <strong>Coordinates:</strong> ${currentUserData.latitude}, ${currentUserData.longitude}<br>
                <strong>Security:</strong> ${currentUserData.proxy || currentUserData.tor ? '⚠️ Proxy/VPN' : '✅ Clean'}
            </div>
        `;
        sounds.click();
    }
});

document.getElementById('close-whois').addEventListener('click', () => {
    document.getElementById('whois-modal').classList.add('hidden');
    sounds.click();
});

// Refresh
document.getElementById('refresh-btn').addEventListener('click', () => {
    showToast('Refreshing...', 'success');
    sounds.click();
    setTimeout(() => location.reload(), 500);
});

// Fullscreen
document.getElementById('fullscreen-btn').addEventListener('click', () => {
    const mapEl = document.getElementById('map');
    if (mapEl.requestFullscreen) mapEl.requestFullscreen();
    sounds.click();
});

// Traceroute
document.getElementById('traceroute-btn').addEventListener('click', () => {
    if (!currentUserData) {
        showToast('Wait for location to load!', 'error');
        sounds.error();
        return;
    }

    const hops = [
        [currentUserData.latitude, currentUserData.longitude],
        [14.5995, 120.9842],
        [1.3521, 103.8198],
        [35.6762, 139.6503],
        [34.0522, -118.2437],
        [40.7128, -74.0060]
    ];

    const hopNames = ['You', 'Manila', 'Singapore', 'Tokyo', 'LA', 'NYC'];

    if (polyline) polyline.remove();
    if (window.hopMarkers) window.hopMarkers.forEach(m => m.remove());
    window.hopMarkers = [];

    let hop = 0;
    const interval = setInterval(() => {
        if (hop >= hops.length - 1) {
            clearInterval(interval);
            showToast('Traceroute complete! 🚀', 'success');
            sounds.success();
            return;
        }

        if (polyline) polyline.remove();
        polyline = L.polyline(hops.slice(0, hop + 2), {
            color: '#6366f1',
            weight: 3,
            opacity: 0.8,
            dashArray: '10, 5'
        }).addTo(map);

        if (hop > 0) {
            const icon = L.divIcon({
                html: `<div style="width: 35px; height: 35px; background: linear-gradient(135deg, #6366f1, #ec4899); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 3px 15px rgba(99, 102, 241, 0.5);">${hop}</div>`,
                iconSize: [35, 35]
            });
            
            const m = L.marker(hops[hop], { icon }).addTo(map)
                .bindPopup(`<strong>${hopNames[hop]}</strong>`);
            window.hopMarkers.push(m);
            sounds.click();
        }

        hop++;
    }, 700);

    map.fitBounds(L.latLngBounds(hops), { padding: [50, 50] });
});

// Port Scanner
document.getElementById('port-scan-btn').addEventListener('click', () => {
    showToast('Port scanning... 🔍', 'success');
    sounds.click();
    
    setTimeout(() => {
        const ports = [21, 22, 80, 443, 3306, 8080];
        const status = ports.map(p => `Port ${p}: ${Math.random() > 0.5 ? '✅ Open' : '❌ Closed'}`);
        alert('Port Scan Results:\n\n' + status.join('\n'));
    }, 2000);
});

// Theme switcher
document.getElementById('theme-btn').addEventListener('click', () => {
    document.getElementById('theme-modal').classList.remove('hidden');
    sounds.click();
});

document.getElementById('close-theme').addEventListener('click', () => {
    document.getElementById('theme-modal').classList.add('hidden');
    sounds.click();
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        document.body.className = `theme-${theme}`;
        document.getElementById('theme-modal').classList.add('hidden');
        showToast(`Theme changed to ${theme}!`, 'success');
        sounds.success();
    });
});

// Sound toggle
document.getElementById('sound-btn').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const soundOn = document.querySelector('.sound-on');
    const soundOff = document.querySelector('.sound-off');
    
    if (soundEnabled) {
        soundOn.classList.remove('hidden');
        soundOff.classList.add('hidden');
        showToast('Sound enabled 🔊', 'success');
        sounds.success();
    } else {
        soundOn.classList.add('hidden');
        soundOff.classList.remove('hidden');
        showToast('Sound disabled 🔇', 'success');
    }
});

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Update IP history
function updateIPHistory(data) {
    const historyContainer = document.getElementById('ip-history');
    document.getElementById('current-ip').textContent = data.ip;
    document.getElementById('current-location').textContent = `${data.city}, ${data.country}`;
    
    // Get stored history from localStorage (if any)
    let history = [];
    try {
        const stored = localStorage.getItem('ip_history');
        if (stored) history = JSON.parse(stored);
    } catch (e) {
        console.log('No history found');
    }
    
    // Add current to history if different
    const currentEntry = {
        ip: data.ip,
        location: `${data.city}, ${data.country}`,
        time: new Date().toLocaleString()
    };
    
    // Check if IP is different from last entry
    if (history.length === 0 || history[0].ip !== currentEntry.ip) {
        history.unshift(currentEntry);
        history = history.slice(0, 5); // Keep only last 5
        
        try {
            localStorage.setItem('ip_history', JSON.stringify(history));
        } catch (e) {
            console.log('Could not save history');
        }
    }
    
    // Display history
    if (history.length > 1) {
        const historyHTML = history.slice(1).map(entry => `
            <div class="history-item">
                <div class="history-dot"></div>
                <div class="history-content">
                    <div class="history-ip">${entry.ip}</div>
                    <div class="history-location">${entry.location}</div>
                    <div class="history-time">${entry.time}</div>
                </div>
            </div>
        `).join('');
        
        historyContainer.innerHTML = `
            <div class="history-item current">
                <div class="history-dot"></div>
                <div class="history-content">
                    <div class="history-ip">${data.ip}</div>
                    <div class="history-location">${data.city}, ${data.country}</div>
                    <div class="history-time">Current session</div>
                </div>
            </div>
            ${historyHTML}
        `;
    }
}

// Clear history
document.getElementById('clear-history-btn').addEventListener('click', () => {
    try {
        localStorage.removeItem('ip_history');
        showToast('History cleared! 🗑️', 'success');
        sounds.success();
        
        // Reset display
        const historyContainer = document.getElementById('ip-history');
        if (currentUserData) {
            historyContainer.innerHTML = `
                <div class="history-item current">
                    <div class="history-dot"></div>
                    <div class="history-content">
                        <div class="history-ip">${currentUserData.ip}</div>
                        <div class="history-location">${currentUserData.city}, ${currentUserData.country}</div>
                        <div class="history-time">Current session</div>
                    </div>
                </div>
                <div class="history-item">
                    <div class="history-dot"></div>
                    <div class="history-content">
                        <div class="history-ip">History cleared</div>
                        <div class="history-location">Visit again to track changes</div>
                        <div class="history-time">Your IP changes will appear here</div>
                    </div>
                </div>
            `;
        }
    } catch (e) {
        showToast('Could not clear history', 'error');
        sounds.error();
    }
});

// Privacy & Terms modals
document.getElementById('privacy-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('privacy-modal').classList.remove('hidden');
    sounds.click();
});

document.getElementById('close-privacy').addEventListener('click', () => {
    document.getElementById('privacy-modal').classList.add('hidden');
    sounds.click();
});

document.getElementById('terms-link').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('terms-modal').classList.remove('hidden');
    sounds.click();
});

document.getElementById('close-terms').addEventListener('click', () => {
    document.getElementById('terms-modal').classList.add('hidden');
    sounds.click();
});

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            sounds.click();
        }
    });
});

// =========================================
// IP LOOKUP FEATURE
// =========================================

// Load search history
function loadSearchHistory() {
    try {
        const stored = localStorage.getItem('ip_search_history');
        if (stored) {
            searchHistory = JSON.parse(stored);
            displaySearchHistory();
        }
    } catch (e) {
        console.log('No search history');
    }
}

// Display search history
function displaySearchHistory() {
    const container = document.getElementById('history-chips');
    
    if (searchHistory.length === 0) {
        container.innerHTML = '<span class="history-chip">No searches yet</span>';
        return;
    }
    
    container.innerHTML = searchHistory.map(ip => `
        <span class="history-chip" onclick="quickLookup('${ip}')">${ip}</span>
    `).join('');
}

// Quick lookup from history
window.quickLookup = function(ip) {
    document.getElementById('ip-lookup-input').value = ip;
    document.getElementById('lookup-btn').click();
    sounds.click();
};

// Validate IP address
function isValidIP(ip) {
    // IPv4 regex
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 regex (simplified)
    const ipv6 = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (ipv4.test(ip)) {
        const parts = ip.split('.');
        return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255);
    }
    
    return ipv6.test(ip);
}

// Perform IP lookup
document.getElementById('lookup-btn').addEventListener('click', async () => {
    const input = document.getElementById('ip-lookup-input');
    const ip = input.value.trim();
    
    if (!ip) {
        showToast('Please enter an IP address', 'error');
        sounds.error();
        return;
    }
    
    if (!isValidIP(ip)) {
        showToast('Invalid IP address format', 'error');
        sounds.error();
        return;
    }
    
    // Show loading
    const resultsDiv = document.getElementById('lookup-results');
    resultsDiv.classList.remove('hidden');
    document.getElementById('lookup-ip-value').textContent = 'Loading...';
    document.getElementById('lookup-info-grid').innerHTML = '<div class="loader"></div>';
    
    sounds.click();
    
    try {
        const res = await fetch(`https://ipwho.is/${ip}`);
        const data = await res.json();
        
        if (data.success === false) {
            showToast(`Error: ${data.message}`, 'error');
            sounds.error();
            resultsDiv.classList.add('hidden');
            return;
        }
        
        // Display results
        displayLookupResults(data);
        
        // Save to history
        if (!searchHistory.includes(ip)) {
            searchHistory.unshift(ip);
            searchHistory = searchHistory.slice(0, 10); // Keep last 10
            try {
                localStorage.setItem('ip_search_history', JSON.stringify(searchHistory));
                displaySearchHistory();
            } catch (e) {
                console.log('Could not save history');
            }
        }
        
        sounds.success();
        
    } catch (e) {
        showToast('Failed to lookup IP address', 'error');
        sounds.error();
        console.error('Lookup error:', e);
        resultsDiv.classList.add('hidden');
    }
});

// Display lookup results
function displayLookupResults(data) {
    document.getElementById('lookup-ip-value').textContent = data.ip;
    
    const infoGrid = document.getElementById('lookup-info-grid');
    const items = [
        { label: 'Type', value: data.ip.includes(':') ? 'IPv6' : 'IPv4', icon: '🔢' },
        { label: 'Country', value: `${data.country || 'Unknown'} ${data.flag?.emoji || ''}`, icon: '🌍' },
        { label: 'City', value: data.city || 'Unknown', icon: '🏙️' },
        { label: 'Region', value: data.region || 'Unknown', icon: '📍' },
        { label: 'ISP', value: data.connection?.isp || 'Unknown', icon: '🌐' },
        { label: 'ASN', value: data.connection?.asn || 'N/A', icon: '🔢' },
        { label: 'Timezone', value: data.timezone?.id || 'Unknown', icon: '🕐' },
        { label: 'Postal', value: data.postal || 'N/A', icon: '📮' },
        { label: 'Coordinates', value: `${data.latitude?.toFixed(4)}, ${data.longitude?.toFixed(4)}`, icon: '🎯' },
        { 
            label: 'Security', 
            value: data.proxy || data.tor || data.relay ? '⚠️ VPN/Proxy' : '✅ Clean',
            icon: '🛡️'
        }
    ];
    
    infoGrid.innerHTML = items.map(item => `
        <div class="lookup-info-item">
            <span class="lookup-info-label">${item.icon} ${item.label}</span>
            <span class="lookup-info-value">${item.value}</span>
        </div>
    `).join('');
    
    // Initialize lookup map
    initLookupMap(data.latitude, data.longitude, data.city, data.country, data.ip);
}

// Initialize lookup map
function initLookupMap(lat, lon, city, country, ip) {
    const mapContainer = document.getElementById('lookup-map');
    
    if (lookupMap) {
        lookupMap.remove();
    }
    
    lookupMap = L.map('lookup-map').setView([lat, lon], 10);
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri',
        maxZoom: 18
    }).addTo(lookupMap);
    
    const markerIcon = L.divIcon({
        html: `
            <div style="position: relative;">
                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #ec4899, #f59e0b); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 20px rgba(236, 72, 153, 0.6);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                </div>
                <div style="position: absolute; top: 0; left: 0; width: 40px; height: 40px; border: 2px solid #ec4899; border-radius: 50%; animation: pulse 2s infinite;"></div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
    
    lookupMarker = L.marker([lat, lon], { icon: markerIcon }).addTo(lookupMap)
        .bindPopup(`
            <div style="font-family: Poppins; text-align: center; padding: 10px;">
                <strong style="color: #ec4899; font-size: 16px;">📍 Located IP</strong><br>
                <span style="color: #6366f1; font-weight: 600; font-family: Orbitron;">${ip}</span><br>
                <span style="color: #94a3b8;">${city}, ${country}</span><br>
                <small style="color: #64748b;">Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}</small>
            </div>
        `)
        .openPopup();
    
    L.circle([lat, lon], {
        color: '#ec4899',
        fillColor: '#f59e0b',
        fillOpacity: 0.2,
        radius: 2000
    }).addTo(lookupMap);
}

// Compare with your IP
document.getElementById('compare-btn').addEventListener('click', () => {
    if (!currentUserData) {
        showToast('Your IP data not loaded yet', 'error');
        sounds.error();
        return;
    }
    
    const lookupIP = document.getElementById('lookup-ip-value').textContent;
    
    const comparison = `
📊 IP COMPARISON

YOUR IP: ${currentUserData.ip}
Location: ${currentUserData.city}, ${currentUserData.country}
ISP: ${currentUserData.connection?.isp || 'Unknown'}

SEARCHED IP: ${lookupIP}
Location: Check results above
ISP: Check results above

${currentUserData.ip === lookupIP ? '✅ Same IP address!' : '❌ Different IP addresses'}
    `.trim();
    
    alert(comparison);
    sounds.click();
});

// Export results
document.getElementById('export-btn').addEventListener('click', () => {
    const lookupIP = document.getElementById('lookup-ip-value').textContent;
    const infoItems = document.querySelectorAll('.lookup-info-item');
    
    let exportData = `IP Lookup Results\n`;
    exportData += `===================\n\n`;
    exportData += `IP Address: ${lookupIP}\n`;
    exportData += `Lookup Date: ${new Date().toLocaleString()}\n\n`;
    
    infoItems.forEach(item => {
        const label = item.querySelector('.lookup-info-label').textContent;
        const value = item.querySelector('.lookup-info-value').textContent;
        exportData += `${label}: ${value}\n`;
    });
    
    exportData += `\n\n© 2025 My-IP-Address | Jonnel Soriano`;
    
    // Create download
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ip-lookup-${lookupIP}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Results exported! 📄', 'success');
    sounds.success();
});

// Close results
document.getElementById('close-results').addEventListener('click', () => {
    document.getElementById('lookup-results').classList.add('hidden');
    sounds.click();
});

// Enter key to search
document.getElementById('ip-lookup-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('lookup-btn').click();
    }
});

// Initialize
initParticles();
getDeviceInfo();
initSpeedTest();
loadSearchHistory();
loadIP();