let map, marker, polyline;

async function loadIP() {
    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();

        if (data.success === false) {
            document.getElementById('ip').innerText = 'Error: ' + data.message;
            return;
        }

        // Display IP with neon glow
        document.getElementById('ip').innerText = data.ip;

        // Safe display ng info (handle missing fields)
        const countryName = data.country || 'Hindi tiyak';
        const countryCode = data.country_code ? `(${data.country_code})` : '';
        const cityName = data.city || 'Hindi tiyak (Province)';
        const regionName = data.region || data.region_code || 'Hindi tiyak';
        const ispName = data.connection?.isp || 'Hindi available';

        const info = document.getElementById('info');
        info.innerHTML = `
            <div class="info-item"><strong>Bansa:</strong> ${countryName} ${countryCode}</div>
            <div class="info-item"><strong>Lungsod:</strong> ${cityName}</div>
            <div class="info-item"><strong>Region:</strong> ${regionName}</div>
            <div class="info-item"><strong>ISP:</strong> ${ispName}</div>
            ${data.proxy || data.tor || data.relay ? 
                '<div class="info-item" style="color:red;"><strong>Babala: Proxy/VPN/Tor Detected!</strong></div>' : 
                ''}
        `;

        // Initialize satellite map
        initMap(data.latitude, data.longitude);

        // Optional: Log visit (kung may backend ka na later, palitan ng fetch('/api/log-visit'))
        // Ngayon static pa tayo, so comment muna
        // sendToTelegram(data);

    } catch (e) {
        document.getElementById('ip').innerText = 'Error sa connection';
        console.error('IP load error:', e);
    }
}

function initMap(lat, lon) {
    if (map) map.remove();

    map = L.map('map').setView([lat, lon], 12);

    // Satellite view (Esri World Imagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri',
        maxZoom: 18
    }).addTo(map);

    // Futuristic neon marker
    const neonIcon = L.divIcon({
        html: `<svg width="50" height="50" viewBox="0 0 24 24" fill="#00ffff" stroke="#a855f7" stroke-width="3">
                 <path d="M12 2L2 12h3v8h14v-8h3z"/>
               </svg>`,
        className: 'neon-marker',
        iconSize: [50, 50],
        iconAnchor: [25, 50]
    });

    marker = L.marker([lat, lon], {icon: neonIcon}).addTo(map)
        .bindPopup(`<strong>Iyong Lokasyon!</strong><br>Lat: ${lat.toFixed(6)}<br>Lon: ${lon.toFixed(6)}`)
        .openPopup();
}

// Visual Traceroute (mock pero maganda ang effect)
document.getElementById('traceroute-btn').addEventListener('click', () => {
    if (!marker) {
        alert('Hintayin munang mag-load ang lokasyon!');
        return;
    }

    const hops = [
        [marker.getLatLng().lat, marker.getLatLng().lng], // User
        [14.5995, 120.9842], // Manila
        [1.3521, 103.8198],  // Singapore
        [34.0522, -118.2437], // Los Angeles
        [40.7128, -74.0060]   // New York
    ];

    // Clear previous
    if (polyline) polyline.remove();
    if (window.hopMarkers) window.hopMarkers.forEach(m => m.remove());
    window.hopMarkers = [];

    // Draw glowing path
    polyline = L.polyline(hops, {
        color: '#00ffff',
        weight: 8,
        opacity: 0.8,
        dashArray: '20, 15'
    }).addTo(map);

    // Numbered hop markers
    hops.forEach((coord, i) => {
        if (i === 0) return; // Skip user location
        const hopIcon = L.divIcon({
            html: `<svg width="35" height="35" viewBox="0 0 24 24">
                     <circle cx="12" cy="12" r="11" fill="#a855f7" stroke="#00ffff" stroke-width="3"/>
                     <text x="12" y="16" font-size="14" text-anchor="middle" fill="white">${i}</text>
                   </svg>`,
            iconSize: [35, 35]
        });
        const m = L.marker(coord, {icon: hopIcon}).addTo(map)
            .bindPopup(`Hop ${i}: International Gateway`);
        window.hopMarkers.push(m);
    });

    map.fitBounds(polyline.getBounds());
    alert('Visual Traceroute Complete! 🔥 Neon path activated!');
});

// Start everything
loadIP();