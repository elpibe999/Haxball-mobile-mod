(function () {
    // 1. ANTIDECEPCIÓN: Forzamos la identificación como móvil ANTES de nada
    const forceMobile = () => {
        try {
            Object.defineProperty(navigator, 'maxTouchPoints', { value: 5, writable: false });
            Object.defineProperty(navigator, 'platform', { value: 'Linux armv8l', writable: false });
            Object.defineProperty(navigator, 'userAgent', { 
                value: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', 
                writable: false 
            });
            window.ontouchstart = () => {};
        } catch (e) { console.log("Modo móvil activo"); }
    };
    forceMobile();

    // 2. ESTILOS DE ADAPTACIÓN (HUD Y INTERFAZ)
    const style = document.createElement('style');
    style.innerHTML = `
        #mobile-hud { position: fixed; inset: 0; z-index: 9999999; pointer-events: none; }
        .v-joy { position: fixed; bottom: 20px; left: 20px; width: 120px; height: 120px; border: 2px solid #fff; border-radius: 50%; pointer-events: auto; touch-action: none; background: rgba(255,255,255,0.2); }
        .v-kick { position: fixed; bottom: 30px; right: 30px; width: 80px; height: 80px; border: 3px solid #fff; border-radius: 50%; pointer-events: auto; touch-action: none; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .v-joy-thumb { position: absolute; width: 40%; height: 40%; background: #fff; border-radius: 50%; top: 30%; left: 30%; pointer-events: none; }
    `;
    document.head.appendChild(style);

    // 3. HUD Y BOTONERA
    const hud = document.createElement('div');
    hud.id = 'mobile-hud';
    hud.innerHTML = `<div class="v-joy" id="joy"><div class="v-joy-thumb"></div></div><div class="v-kick" id="kick">KICK</div>`;
    document.body.appendChild(hud);

    // 4. LÓGICA DE EVENTOS (LA CLAVE DEL "VIXEL")
    const sendKey = (code, type) => {
        const frame = document.querySelector('iframe.gameframe');
        const target = frame ? frame.contentWindow : window;
        const ev = new KeyboardEvent(type, { code: code, bubbles: true });
        target.dispatchEvent(ev);
    };

    // Joystick simplificado (Dirección W/A/S/D)
    document.getElementById('joy').addEventListener('touchstart', () => sendKey('KeyW', 'keydown'));
    document.getElementById('joy').addEventListener('touchend', () => sendKey('KeyW', 'keyup'));
    
    document.getElementById('kick').addEventListener('touchstart', () => sendKey('KeyX', 'keydown'));
    document.getElementById('kick').addEventListener('touchend', () => sendKey('KeyX', 'keyup'));

    // 5. OBSERVER PARA EL MODO "EN SALA" (Ocultar botones si no estás jugando)
    setInterval(() => {
        const frame = document.querySelector('iframe.gameframe');
        if (frame && frame.contentDocument.querySelector('canvas')) {
            hud.style.display = 'block';
        } else {
            hud.style.display = 'none';
        }
    }, 1000);
})();
 
