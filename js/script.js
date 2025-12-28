let map, marker, polyline;
let currentUserData = null;

// Initialize on page load
async function loadIP() {
    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();

        if (data.success === false) {
            document.getElementById('ip').innerHTML = '<span style="color:#ff4444;">Error: ' + data.message + '</span>';
            return;
        }

        // Store user data
        currentUserData = data;

        // Display IP with animation
        const ipElement = document.getElementById('ip');
        ipElement.style.opacity = '0';
        setTimeout(() => {
            ipElement.innerText = data.ip;
            ipElement.style.opacity = '1';
            ipElement.style.transition = 'opacity 0.5s ease-in';
        }, 100);

        // Safe display of info
        const countryName = data.country || 'Hindi tiyak';
        const countryCode = data.country_code ? `(${data.country_code})` : '';
        const cityName = data.city || 'Hindi tiyak';
        const regionName = data.region || data.region_code || 'Hindi tiyak';
        const ispName = data.connection?.isp || 'Hindi available';
        const timezone = data.timezone?.id || 'Unknown';
        const postal = data.postal || 'N/A';

        const info = document.getElementById('info');
        info.innerHTML = `
            <div class="info-item">
                <strong>🌍 Bansa</strong>
                <div>${countryName} ${countryCode}</div>
            </div>
            <div class="info-item">
                <strong>🏙️ Lungsod</strong>
                <div>${cityName}</div>
            </div>
            <div class="info-item">
                <strong>📍 Region</strong>
                <div>${regionName}</div>
            </div>
            <div class="info-item">
                <strong>🌐 ISP</strong>
                <div>${ispName}</div>
            </div>
            <div class="info-item">
                <strong>🕐 Timezone</strong>
                <div>${timezone}</div>
            </div>
            <div class="info-item">
                <strong>📮 Postal Code</strong>
                <div>${postal}</div>
            </div>
            ${data.proxy || data.tor || data.relay ? 
                `<div class="info-item" style="border-color:#ff4444; background: rgba(255,68,68,0.1);">
                    <strong>⚠️ Babala</strong>
                    <div>Proxy/VPN/Tor Detected!</div>
                </div>` : 
                `<div class="info-item" style="border-color:#00ff88; background: rgba(0,255,136,0.1);">
                    <strong>✅ Connection</strong>
                    <div>Normal & Secure</div>
                </div>`
            }
        `;

        // Initialize map
        initMap(data.latitude, data.longitude, cityName, countryName);

        // Log visit to backend (which will send to Telegram)
        logVisit(data);

    } catch (e) {
        document.getElementById('ip').innerHTML = '<span style="color:#ff4444;">Error loading data</span>';
        console.error('IP load error:', e);
    }
}

// Initialize satellite map
function initMap(lat, lon, city, country) {
    if (map) map.remove();

    map = L.map('map', {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true
    }).setView([lat, lon], 13);

    // Satellite view (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 18
    }).addTo(map);

    // Futuristic neon marker
    const neonIcon = L.divIcon({
        html: `<div style="position:relative;">
                 <svg width="50" height="50" viewBox="0 0 24 24" fill="#00ffff" stroke="#a855f7" stroke-width="2">
                   <path d="M12 2L2 12h3v8h14v-8h3z"/>
                 </svg>
                 <div style="position:absolute; top:-5px; left:-5px; width:60px; height:60px; border:2px solid #00ffff; border-radius:50%; animation: pulse 2s infinite;"></div>
               </div>`,
        className: 'neon-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 50]
    });

    // Add pulse animation to map container
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);

    marker = L.marker([lat, lon], {icon: neonIcon}).addTo(map)
        .bindPopup(`
            <div style="font-family: Orbitron; text-align: center; padding: 10px;">
                <strong style="color: #00ffff; font-size: 16px;">📍 Iyong Lokasyon!</strong><br>
                <span style="color: #a855f7;">${city}, ${country}</span><br>
                <small>Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}</small>
            </div>
        `, {
            maxWidth: 250
        })
        .openPopup();

    // Add circle overlay
    L.circle([lat, lon], {
        color: '#00ffff',
        fillColor: '#a855f7',
        fillOpacity: 0.2,
        radius: 1000
    }).addTo(map);
}

// Log visit to backend API
async function logVisit(data) {
    try {
        await fetch('/api/log-visit', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Visit logged successfully');
    } catch (e) {
        console.error('Failed to log visit:', e);
    }
}

// Visual Traceroute Feature
document.getElementById('traceroute-btn').addEventListener('click', () => {
    if (!marker || !currentUserData) {
        showNotification('Hintayin munang mag-load ang lokasyon!', 'warning');
        return;
    }

    const userLat = currentUserData.latitude;
    const userLon = currentUserData.longitude;

    // Major internet hubs
    const hops = [
        [userLat, userLon], // User location
        [14.5995, 120.9842], // Manila, Philippines
        [1.3521, 103.8198],  // Singapore
        [35.6762, 139.6503], // Tokyo, Japan
        [34.0522, -118.2437], // Los Angeles, USA
        [40.7128, -74.0060]   // New York, USA
    ];

    const hopNames = [
        'Your Location',
        'Manila Hub',
        'Singapore Hub',
        'Tokyo Hub',
        'Los Angeles Hub',
        'New York Hub'
    ];

    // Clear previous traceroute
    if (polyline) polyline.remove();
    if (window.hopMarkers) {
        window.hopMarkers.forEach(m => m.remove());
    }
    window.hopMarkers = [];

    // Animate the path drawing
    let currentHop = 0;
    const animateTraceroute = setInterval(() => {
        if (currentHop >= hops.length - 1) {
            clearInterval(animateTraceroute);
            showNotification('Visual Traceroute Complete! 🚀', 'success');
            return;
        }

        const segmentHops = hops.slice(0, currentHop + 2);
        
        if (polyline) polyline.remove();
        
        polyline = L.polyline(segmentHops, {
            color: '#00ffff',
            weight: 4,
            opacity: 0.8,
            dashArray: '15, 10',
            className: 'animated-line'
        }).addTo(map);

        // Add hop marker
        if (currentHop > 0) {
            const hopIcon = L.divIcon({
                html: `<div style="background: linear-gradient(135deg, #a855f7, #00ffff); width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; border: 3px solid #00ffff; box-shadow: 0 0 20px #00ffff;">${currentHop}</div>`,
                iconSize: [40, 40],
                className: 'hop-marker'
            });
            
            const m = L.marker(hops[currentHop], {icon: hopIcon}).addTo(map)
                .bindPopup(`
                    <div style="font-family: Orbitron; text-align: center;">
                        <strong style="color: #00ffff;">Hop ${currentHop}</strong><br>
                        <span style="color: #a855f7;">${hopNames[currentHop]}</span>
                    </div>
                `);
            window.hopMarkers.push(m);
        }

        currentHop++;
    }, 800);

    // Fit bounds to show entire route
    map.fitBounds(L.latLngBounds(hops), {padding: [50, 50]});
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00ff88, #00ffff)' : type === 'warning' ? 'linear-gradient(135deg, #ffaa00, #ff6600)' : 'linear-gradient(135deg, #a855f7, #00ffff)'};
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        font-family: Orbitron;
        font-weight: 700;
        box-shadow: 0 5px 25px rgba(0,255,255,0.5);
        z-index: 10000;
        animation: slideIn 0.5s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Add animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.5s ease-out reverse';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Start loading IP data
loadIP();