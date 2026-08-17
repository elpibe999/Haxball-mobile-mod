(function () {
    // 1. FORZAR MODO MÓVIL (Antes de que cargue nada)
    Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5, configurable: true });
    Object.defineProperty(navigator, 'platform', { get: () => 'Linux armv8l', configurable: true });
    
    // 2. CSS PARA OCULTAR INTERFAZ PC Y ADAPTAR PANTALLA
    const style = document.createElement('style');
    style.innerHTML = `
        html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; background: #111; }
        .header, .rightbar, .file-btn { display: none !important; }
        .gameframe { width: 100vw !important; height: 100vh !important; border: none !important; }
        
        #v-hud { position: fixed; inset: 0; z-index: 9999; pointer-events: none; }
        .v-joy { position: fixed; bottom: 30px; left: 30px; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid #fff; pointer-events: auto; touch-action: none; }
        .v-thumb { position: absolute; width: 50px; height: 50px; background: #fff; border-radius: 50%; top: 45px; left: 45px; pointer-events: none; }
        .v-kick { position: fixed; bottom: 50px; right: 50px; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,0,0,0.3); border: 3px solid #fff; pointer-events: auto; touch-action: none; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; }
    `;
    document.head.appendChild(style);

    // 3. CREAR HUD
    const hud = document.createElement('div');
    hud.id = 'v-hud';
    hud.innerHTML = `<div class="v-joy" id="joy"><div class="v-thumb" id="thumb"></div></div><div class="v-kick" id="kick">KICK</div>`;
    document.body.appendChild(hud);

    // 4. LÓGICA DE ENVÍO DE TECLAS (ESTO ES LO QUE NO TENÍAS)
    const sendKey = (code, type) => {
        const frame = document.querySelector('iframe.gameframe');
        if (frame && frame.contentWindow) {
            // Enviamos el evento directamente al juego dentro del iframe
            const ev = new KeyboardEvent(type, { code: code, bubbles: true, cancelable: true });
            frame.contentWindow.dispatchEvent(ev);
            frame.contentDocument.dispatchEvent(ev);
        }
    };

    // 5. JOYSTICK ANALÓGICO (CÁLCULO DE ÁNGULOS)
    let activeKeys = { w: false, a: false, s: false, d: false };
    const joy = document.getElementById('joy');
    const thumb = document.getElementById('thumb');

    joy.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = joy.getBoundingClientRect();
        const dx = touch.clientX - (rect.left + rect.width / 2);
        const dy = touch.clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const maxDist = 50;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        // Limitar posición del thumb
        const clampX = Math.max(-maxDist, Math.min(maxDist, dx));
        const clampY = Math.max(-maxDist, Math.min(maxDist, dy));
        thumb.style.transform = `translate(${clampX}px, ${clampY}px)`;

        // Mapear ángulos a WASD (Simple)
        const newKeys = { w: (angle > -157.5 && angle < -22.5), s: (angle > 22.5 && angle < 157.5), a: (angle > 112.5 || angle < -112.5), d: (angle > -67.5 && angle < 67.5) };
        
        ['w','a','s','d'].forEach(k => {
            if (newKeys[k] !== activeKeys[k]) {
                sendKey('Key' + k.toUpperCase(), newKeys[k] ? 'keydown' : 'keyup');
                activeKeys[k] = newKeys[k];
            }
        });
    }, {passive: false});

    joy.addEventListener('touchend', () => {
        thumb.style.transform = `translate(0px, 0px)`;
        ['w','a','s','d'].forEach(k => { if(activeKeys[k]) sendKey('Key' + k.toUpperCase(), 'keyup'); activeKeys[k] = false; });
    });

    // 6. BOTÓN KICK
    document.getElementById('kick').addEventListener('touchstart', (e) => { e.preventDefault(); sendKey('KeyX', 'keydown'); });
    document.getElementById('kick').addEventListener('touchend', (e) => { e.preventDefault(); sendKey('KeyX', 'keyup'); });
    
    console.log("Modo Vixel Móvil Activado. Disfruta el juego.");
})();
