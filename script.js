(function () {
    if (window.hasVixelMobileMod) return;
    window.hasVixelMobileMod = true;

    // Configuración guardada en el dispositivo
    const config = JSON.parse(localStorage.getItem('vixel_mod_cfg')) || {
        joySize: 120, joyX: 30, joyY: 30,
        kickSize: 90, kickX: 35, kickY: 40,
        opacity: 0.85
    };
    const saveCfg = () => localStorage.setItem('vixel_mod_cfg', JSON.stringify(config));

    // Estilos limpios (No alteran el Login oficial)
    const style = document.createElement('style');
    style.innerHTML = `
        #mobile-hud { display: none; position: fixed; inset: 0; pointer-events: none; z-index: 9999999; }
        body.in-room #mobile-hud { display: block !important; }

        #vixel-joystick {
            position: fixed; background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.5); border-radius: 50%;
            pointer-events: auto; touch-action: none;
        }
        #vixel-thumb {
            position: absolute; top: 50%; left: 50%; width: 40%; height: 40%;
            background: #fff; border-radius: 50%; transform: translate(-50%, -50%);
            pointer-events: none;
        }
        #vixel-kick {
            position: fixed; background: rgba(255, 255, 255, 0.25);
            border: 3px solid #fff; border-radius: 50%; pointer-events: auto;
            touch-action: none; display: flex; align-items: center; justify-content: center;
            color: #fff; font-weight: bold; font-family: sans-serif;
        }
        #vixel-kick:active { background: rgba(255, 255, 255, 0.6); }

        #vixel-menu {
            display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 280px; background: rgba(15, 23, 42, 0.95); border: 2px solid #3b82f6;
            border-radius: 10px; padding: 15px; color: #fff; font-family: sans-serif;
            z-index: 10000000; pointer-events: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        }
        #vixel-menu h4 { margin: 0 0 10px 0; text-align: center; color: #60a5fa; }
        .vx-row { margin-bottom: 8px; font-size: 12px; display: flex; flex-direction: column; gap: 3px; }
        .vx-row input { background: #1e293b; border: 1px solid #475569; color: #fff; padding: 5px; border-radius: 4px; }
        .vx-btn { background: #2563eb; color: #fff; border: none; padding: 8px; border-radius: 5px; width: 100%; font-weight: bold; margin-top: 5px; cursor: pointer; }
    `;
    document.head.appendChild(style);

    // Inicializar HUD de Controles
    const hud = document.createElement('div');
    hud.id = 'mobile-hud';

    const joy = document.createElement('div');
    joy.id = 'vixel-joystick';
    const thumb = document.createElement('div');
    thumb.id = 'vixel-thumb';
    joy.appendChild(thumb);

    const kick = document.createElement('div');
    kick.id = 'vixel-kick';
    kick.innerText = 'KICK';

    hud.appendChild(joy);
    hud.appendChild(kick);
    document.body.appendChild(hud);

    const updateHud = () => {
        joy.style.width = `${config.joySize}px`; joy.style.height = `${config.joySize}px`;
        joy.style.left = `${config.joyX}px`; joy.style.bottom = `${config.joyY}px`;

        kick.style.width = `${config.kickSize}px`; kick.style.height = `${config.kickSize}px`;
        kick.style.right = `${config.kickX}px`; kick.style.bottom = `${config.kickY}px`;
        kick.style.fontSize = `${config.kickSize * 0.22}px`;

        hud.style.opacity = config.opacity;
    };
    updateHud();

    // Sistema de Envío Directo de Teclas al Lienzo del Juego
    let activeKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
    const sendKey = (code, type) => {
        const frame = document.querySelector('iframe.gameframe');
        const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
        const targetWin = frame ? frame.contentWindow : window;

        const ev = new KeyboardEvent(type, { code: code, key: code.replace('Key', ''), bubbles: true });
        targetDoc.dispatchEvent(ev);
        targetWin.dispatchEvent(ev);
    };

    const updateWASD = (w, a, s, d) => {
        if (activeKeys.KeyW !== w) { sendKey('KeyW', w ? 'keydown' : 'keyup'); activeKeys.KeyW = w; }
        if (activeKeys.KeyA !== a) { sendKey('KeyA', a ? 'keydown' : 'keyup'); activeKeys.KeyA = a; }
        if (activeKeys.KeyS !== s) { sendKey('KeyS', s ? 'keydown' : 'keyup'); activeKeys.KeyS = s; }
        if (activeKeys.KeyD !== d) { sendKey('KeyD', d ? 'keydown' : 'keyup'); activeKeys.KeyD = d; }
    };

    // Lógica Táctil Joystick Analógico
    let isTouching = false;
    const handleTouch = (e) => {
        const touch = e.touches[0];
        const rect = joy.getBoundingClientRect();
        const cX = rect.left + rect.width / 2;
        const cY = rect.top + rect.height / 2;
        const dX = touch.clientX - cX;
        const dY = touch.clientY - cY;
        const angle = Math.atan2(dY, dX);
        const dist = Math.min(rect.width / 2, Math.hypot(dX, dY));

        thumb.style.transform = `translate(calc(-50% + ${dist * Math.cos(angle)}px), calc(-50% + ${dist * Math.sin(angle)}px))`;

        const sector = Math.round(((angle + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI) / 45) % 8;
        switch (sector) {
            case 0: updateWASD(false, false, false, true); break;
            case 1: updateWASD(false, false, true, true); break;
            case 2: updateWASD(false, false, true, false); break;
            case 3: updateWASD(false, true, true, false); break;
            case 4: updateWASD(false, true, false, false); break;
            case 5: updateWASD(true, true, false, false); break;
            case 6: updateWASD(true, false, false, false); break;
            case 7: updateWASD(true, false, false, true); break;
        }
    };

    joy.addEventListener('touchstart', (e) => { isTouching = true; handleTouch(e); e.preventDefault(); }, { passive: false });
    joy.addEventListener('touchmove', (e) => { if (isTouching) handleTouch(e); e.preventDefault(); }, { passive: false });
    joy.addEventListener('touchend', (e) => { isTouching = false; thumb.style.transform = 'translate(-50%, -50%)'; updateWASD(false, false, false, false); e.preventDefault(); }, { passive: false });

    kick.addEventListener('touchstart', (e) => { e.preventDefault(); sendKey('KeyX', 'keydown'); }, { passive: false });
    kick.addEventListener('touchend', (e) => { e.preventDefault(); sendKey('KeyX', 'keyup'); }, { passive: false });

    // Menú de Ajustes /mod
    const menu = document.createElement('div');
    menu.id = 'vixel-menu';
    menu.innerHTML = `
        <h4>Ajustes Haxball Mobile</h4>
        <div class="vx-row"><label>Tamaño Joystick:</label><input type="number" id="vx-js" value="${config.joySize}"></div>
        <div class="vx-row"><label>Posición X / Y Joystick:</label><div style="display:flex;gap:4px"><input type="number" id="vx-jx" value="${config.joyX}"><input type="number" id="vx-jy" value="${config.joyY}"></div></div>
        <div class="vx-row"><label>Tamaño Botón Kick:</label><input type="number" id="vx-ks" value="${config.kickSize}"></div>
        <div class="vx-row"><label>Opacidad HUD (0.1 - 1):</label><input type="number" step="0.1" id="vx-op" value="${config.opacity}"></div>
        <button class="vx-btn" id="vx-save">Guardar</button>
    `;
    document.body.appendChild(menu);

    document.getElementById('vx-save').onclick = () => {
        config.joySize = parseInt(document.getElementById('vx-js').value) || 120;
        config.joyX = parseInt(document.getElementById('vx-jx').value) || 30;
        config.joyY = parseInt(document.getElementById('vx-jy').value) || 30;
        config.kickSize = parseInt(document.getElementById('vx-ks').value) || 90;
        config.opacity = parseFloat(document.getElementById('vx-op').value) || 0.85;
        saveCfg(); updateHud();
        menu.style.display = 'none';
    };

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const frame = document.querySelector('iframe.gameframe');
            const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
            const chat = targetDoc.querySelector('input[data-hook="input"]');
            if (chat && chat.value.trim() === '/mod') {
                chat.value = '';
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }
        }
    }, true);

    // Detector de Sala (No tapa la pantalla de Login/Nickname)
    setInterval(() => {
        const frame = document.querySelector('iframe.gameframe');
        const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
        const canvas = targetDoc.querySelector('canvas');

        if (canvas && canvas.offsetWidth > 100) {
            document.body.classList.add('in-room');
        } else {
            document.body.classList.remove('in-room');
        }
    }, 500);
})();
