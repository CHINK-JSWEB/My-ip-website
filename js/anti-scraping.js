// ============================================
// ANTI-SCRAPING & SECURITY PROTECTION
// © 2025 Jonnel Soriano - All Rights Reserved
// ============================================

(function() {
    'use strict';

    // =========================================
    // 1. CONSOLE PROTECTION
    // =========================================
    
    // Disable console
    const disableConsole = () => {
        const noop = () => {};
        const methods = ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace', 'dir', 'group', 'groupEnd', 'clear'];
        
        methods.forEach(method => {
            console[method] = noop;
        });
    };

    // Detect DevTools
    const detectDevTools = () => {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: #f1f5f9; font-family: 'Poppins', sans-serif; text-align: center; padding: 20px;">
                    <div>
                        <h1 style="font-size: 3rem; color: #ef4444; margin-bottom: 20px;">⚠️ Access Denied</h1>
                        <p style="font-size: 1.2rem; color: #cbd5e1;">Developer tools detected. Please close DevTools to continue.</p>
                        <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 20px;">This site is protected against unauthorized access.</p>
                    </div>
                </div>
            `;
        }
    };

    // Check every second
    setInterval(detectDevTools, 1000);

    // =========================================
    // 2. RIGHT-CLICK & COPY PROTECTION
    // =========================================
    
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showSecurityAlert('⚠️ Right-click is disabled on this site');
        return false;
    });

    // Disable text selection on sensitive elements
    document.addEventListener('selectstart', (e) => {
        if (e.target.classList.contains('no-select') || 
            e.target.closest('.ip-display') || 
            e.target.closest('.info-value')) {
            e.preventDefault();
            return false;
        }
    });

    // Disable copy
    document.addEventListener('copy', (e) => {
        const selection = window.getSelection().toString();
        if (selection.length > 50) {
            e.preventDefault();
            showSecurityAlert('⚠️ Copying large amounts of content is not allowed');
            return false;
        }
    });

    // Disable cut
    document.addEventListener('cut', (e) => {
        e.preventDefault();
        showSecurityAlert('⚠️ Cut operation is disabled');
        return false;
    });

    // =========================================
    // 3. KEYBOARD SHORTCUTS PROTECTION
    // =========================================
    
    document.addEventListener('keydown', (e) => {
        // Disable F12 (DevTools)
        if (e.key === 'F12') {
            e.preventDefault();
            showSecurityAlert('⚠️ Developer tools are disabled');
            return false;
        }
        
        // Disable Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            showSecurityAlert('⚠️ Developer tools are disabled');
            return false;
        }
        
        // Disable Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            showSecurityAlert('⚠️ Console access is disabled');
            return false;
        }
        
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            showSecurityAlert('⚠️ View source is disabled');
            return false;
        }
        
        // Disable Ctrl+S (Save)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            showSecurityAlert('⚠️ Saving is disabled');
            return false;
        }
        
        // Disable Ctrl+A (Select All) on sensitive content
        if (e.ctrlKey && e.key === 'a') {
            const target = e.target;
            if (target.closest('.ip-display') || target.closest('.info-value')) {
                e.preventDefault();
                showSecurityAlert('⚠️ Selection is limited on this element');
                return false;
            }
        }
    });

    // =========================================
    // 4. BOT DETECTION
    // =========================================
    
    const detectBot = () => {
        const botPatterns = [
            /bot/i, /crawler/i, /spider/i, /scraper/i,
            /curl/i, /wget/i, /python/i, /java/i,
            /headless/i, /phantom/i, /selenium/i
        ];
        
        const userAgent = navigator.userAgent;
        
        for (let pattern of botPatterns) {
            if (pattern.test(userAgent)) {
                blockAccess('Bot detected');
                return true;
            }
        }
        
        // Check for missing browser features
        if (!navigator.plugins || navigator.plugins.length === 0) {
            if (!navigator.mimeTypes || navigator.mimeTypes.length === 0) {
                blockAccess('Suspicious browser detected');
                return true;
            }
        }
        
        // Check for automated browsers
        if (navigator.webdriver) {
            blockAccess('Automated browser detected');
            return true;
        }
        
        return false;
    };

    // =========================================
    // 5. HONEYPOT TRAP
    // =========================================
    
    const createHoneypot = () => {
        const honeypot = document.createElement('div');
        honeypot.id = 'honeypot-trap';
        honeypot.className = 'user-data hidden-data api-key';
        honeypot.style.cssText = 'position: absolute; left: -9999px; opacity: 0; pointer-events: none;';
        honeypot.innerHTML = `
            <input type="text" name="secret_key" value="TRAP_VALUE_DO_NOT_ACCESS">
            <span class="api-token">fake-api-token-12345</span>
            <div class="admin-panel">admin_access_point</div>
        `;
        document.body.appendChild(honeypot);
        
        // Monitor if honeypot is accessed
        const observer = new MutationObserver(() => {
            blockAccess('Honeypot triggered - Scraper detected');
        });
        
        observer.observe(honeypot, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        });
    };

    // =========================================
    // 6. REQUEST RATE LIMITING
    // =========================================
    
    let requestCount = 0;
    let requestWindow = Date.now();
    const MAX_REQUESTS = 20; // Max 20 requests per minute
    const TIME_WINDOW = 60000; // 1 minute
    
    const checkRateLimit = () => {
        const now = Date.now();
        
        if (now - requestWindow > TIME_WINDOW) {
            requestCount = 0;
            requestWindow = now;
        }
        
        requestCount++;
        
        if (requestCount > MAX_REQUESTS) {
            blockAccess('Rate limit exceeded');
            return false;
        }
        
        return true;
    };

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (!checkRateLimit()) {
            return Promise.reject(new Error('Rate limit exceeded'));
        }
        return originalFetch.apply(this, args);
    };

    // =========================================
    // 7. FINGERPRINTING
    // =========================================
    
    const generateFingerprint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = {
            canvas: canvas.toDataURL(),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
            timestamp: Date.now()
        };
        
        return btoa(JSON.stringify(fingerprint));
    };

    // Store fingerprint
    const fingerprint = generateFingerprint();
    sessionStorage.setItem('_fp', fingerprint);

    // =========================================
    // 8. TIMING ATTACK DETECTION
    // =========================================
    
    let interactionCount = 0;
    let pageLoadTime = Date.now();
    
    document.addEventListener('click', () => interactionCount++);
    document.addEventListener('scroll', () => interactionCount++);
    document.addEventListener('mousemove', () => interactionCount++);
    
    setTimeout(() => {
        const timeSpent = Date.now() - pageLoadTime;
        
        // If user spent less than 2 seconds and had no interactions
        if (timeSpent < 2000 && interactionCount < 3) {
            console.warn('Suspicious behavior detected');
            // Log for analytics but don't block (might be legit fast user)
        }
    }, 5000);

    // =========================================
    // 9. OBFUSCATION
    // =========================================
    
    // Hide critical data
    const obfuscateData = (data) => {
        return btoa(encodeURIComponent(data));
    };

    const deobfuscateData = (data) => {
        return decodeURIComponent(atob(data));
    };

    // Export functions for use in main script
    window.securityUtils = {
        obfuscate: obfuscateData,
        deobfuscate: deobfuscateData
    };

    // =========================================
    // HELPER FUNCTIONS
    // =========================================
    
    function blockAccess(reason) {
        console.error('Access blocked:', reason);
        
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #0f172a, #1e293b); color: #f1f5f9; font-family: 'Poppins', sans-serif; text-align: center; padding: 20px;">
                <div style="max-width: 600px;">
                    <div style="font-size: 5rem; margin-bottom: 20px;">🚫</div>
                    <h1 style="font-size: 2.5rem; color: #ef4444; margin-bottom: 20px;">Access Denied</h1>
                    <p style="font-size: 1.2rem; color: #cbd5e1; margin-bottom: 15px;">Your request has been blocked due to suspicious activity.</p>
                    <p style="font-size: 0.95rem; color: #94a3b8; margin-bottom: 30px;">Reason: <strong>${reason}</strong></p>
                    <div style="padding: 20px; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; border-radius: 12px; margin-bottom: 20px;">
                        <p style="font-size: 0.9rem; color: #fca5a5;">This website is protected by advanced security measures. If you believe this is an error, please contact the administrator.</p>
                    </div>
                    <p style="font-size: 0.85rem; color: #64748b;">© 2025 Jonnel Soriano. All Rights Reserved.</p>
                </div>
            </div>
        `;
        
        // Send alert to server
        try {
            fetch('/api/security-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reason,
                    fingerprint,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (e) {
            console.error('Could not send security alert');
        }
    }

    function showSecurityAlert(message) {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            border-radius: 12px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
            animation: slideIn 0.3s ease-out;
        `;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
        .no-select {
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
    `;
    document.head.appendChild(style);

    // =========================================
    // INITIALIZE SECURITY
    // =========================================
    
    // Disable console in production
    if (window.location.hostname !== 'localhost') {
        disableConsole();
    }
    
    // Run bot detection
    detectBot();
    
    // Create honeypot
    createHoneypot();
    
    // Mark sensitive elements
    setTimeout(() => {
        document.querySelectorAll('.ip-display, .info-value').forEach(el => {
            el.classList.add('no-select');
        });
    }, 1000);

    console.log('%c⚠️ SECURITY ALERT', 'color: red; font-size: 30px; font-weight: bold;');
    console.log('%cThis website is protected. Unauthorized access attempts are logged and may result in IP blocking.', 'color: orange; font-size: 14px;');
    console.log('%c© 2025 Jonnel Soriano', 'color: #6366f1; font-size: 12px;');

})();