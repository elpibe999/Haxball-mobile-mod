(function () {
    if (window.hasHaxballModInjected) return;
    window.hasHaxballModInjected = true;

    // Configuración guardada en el dispositivo
    const config = JSON.parse(localStorage.getItem('hb_mod_cfg')) || {
        joySize: 120, joyX: 30, joyY: 30,
        kickSize: 90, kickX: 35, kickY: 40,
        opacity: 0.85
    };
    const saveCfg = () => localStorage.setItem('hb_mod_cfg', JSON.stringify(config));

    // Inyección de controles de forma limpia
    function setupOverlay(doc, win) {
        if (doc.getElementById('hb-hud-container')) return;

        // Estilos CSS independientes
        const style = doc.createElement('style');
        style.innerHTML = `
            #hb-hud-container { display: none; position: fixed; inset: 0; pointer-events: none; z-index: 2147483647; }
            body.in-game #hb-hud-container { display: block !important; }

            #hb-joystick {
                position: fixed; background: rgba(255, 255, 255, 0.2);
                border: 2px solid rgba(255, 255, 255, 0.5); border-radius: 50%;
                pointer-events: auto; touch-action: none;
            }
            #hb-thumb {
                position: absolute; top: 50%; left: 50%; width: 40%; height: 40%;
                background: #fff; border-radius: 50%; transform: translate(-50%, -50%);
                pointer-events: none;
            }
            #hb-kick {
                position: fixed; background: rgba(255, 255, 255, 0.25);
                border: 3px solid #fff; border-radius: 50%; pointer-events: auto;
                touch-action: none; display: flex; align-items: center; justify-content: center;
                color: #fff; font-weight: bold; font-family: sans-serif;
            }
            #hb-kick:active { background: rgba(255, 255, 255, 0.6); }

            #hb-menu {
                display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 280px; background: rgba(15, 23, 42, 0.95); border: 2px solid #3b82f6;
                border-radius: 10px; padding: 15px; color: #fff; font-family: sans-serif;
                z-index: 2147483647; pointer-events: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            }
            #hb-menu h4 { margin: 0 0 10px 0; text-align: center; color: #60a5fa; }
            .hb-row { margin-bottom: 8px; font-size: 12px; display: flex; flex-direction: column; gap: 3px; }
            .hb-row input { background: #1e293b; border: 1px solid #475569; color: #fff; padding: 5px; border-radius: 4px; }
            .hb-btn { background: #2563eb; color: #fff; border: none; padding: 8px; border-radius: 5px; width: 100%; font-weight: bold; margin-top: 5px; cursor: pointer; }
        `;
        doc.head.appendChild(style);

        // Contenedores del HUD
        const container = doc.createElement('div');
        container.id = 'hb-hud-container';

        const joy = doc.createElement('div');
        joy.id = 'hb-joystick';
        const thumb = doc.createElement('div');
        thumb.id = 'hb-thumb';
        joy.appendChild(thumb);

        const kick = doc.createElement('div');
        kick.id = 'hb-kick';
        kick.innerText = 'KICK';

        container.appendChild(joy);
        container.appendChild(kick);
        doc.body.appendChild(container);

        const updateHud = () => {
            joy.style.width = `${config.joySize}px`; joy.style.height = `${config.joySize}px`;
            joy.style.left = `${config.joyX}px`; joy.style.bottom = `${config.joyY}px`;

            kick.style.width = `${config.kickSize}px`; kick.style.height = `${config.kickSize}px`;
            kick.style.right = `${config.kickX}px`; kick.style.bottom = `${config.kickY}px`;
            kick.style.fontSize = `${config.kickSize * 0.22}px`;

            container.style.opacity = config.opacity;
        };
        updateHud();

        // Controlador de Teclas WASD & X
        let keys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
        const sendKey = (code, type) => {
            const ev = new KeyboardEvent(type, { code: code, key: code.replace('Key', ''), bubbles: true });
            doc.dispatchEvent(ev);
            win.dispatchEvent(ev);
        };
        const setMovement = (w, a, s, d) => {
            if (keys.KeyW !== w) { sendKey('KeyW', w ? 'keydown' : 'keyup'); keys.KeyW = w; }
            if (keys.KeyA !== a) { sendKey('KeyA', a ? 'keydown' : 'keyup'); keys.KeyA = a; }
            if (keys.KeyS !== s) { sendKey('KeyS', s ? 'keydown' : 'keyup'); keys.KeyS = s; }
            if (keys.KeyD !== d) { sendKey('KeyD', d ? 'keydown' : 'keyup'); keys.KeyD = d; }
        };

        // Movimiento Táctil del Joystick
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
                case 0: setMovement(false, false, false, true); break;
                case 1: setMovement(false, false, true, true); break;
                case 2: setMovement(false, false, true, false); break;
                case 3: setMovement(false, true, true, false); break;
                case 4: setMovement(false, true, false, false); break;
                case 5: setMovement(true, true, false, false); break;
                case 6: setMovement(true, false, false, false); break;
                case 7: setMovement(true, false, false, true); break;
            }
        };

        joy.addEventListener('touchstart', (e) => { isTouching = true; handleTouch(e); e.preventDefault(); }, { passive: false });
        joy.addEventListener('touchmove', (e) => { if (isTouching) handleTouch(e); e.preventDefault(); }, { passive: false });
        joy.addEventListener('touchend', (e) => { isTouching = false; thumb.style.transform = 'translate(-50%, -50%)'; setMovement(false, false, false, false); e.preventDefault(); }, { passive: false });

        kick.addEventListener('touchstart', (e) => { e.preventDefault(); sendKey('KeyX', 'keydown'); }, { passive: false });
        kick.addEventListener('touchend', (e) => { e.preventDefault(); sendKey('KeyX', 'keyup'); }, { passive: false });

        // Menú /mod
        const menu = doc.createElement('div');
        menu.id = 'hb-menu';
        menu.innerHTML = `
            <h4>Controles /mod</h4>
            <div class="hb-row"><label>Tamaño Joystick:</label><input type="number" id="hb-js" value="${config.joySize}"></div>
            <div class="hb-row"><label>Posición X / Y Joystick:</label><div style="display:flex;gap:4px"><input type="number" id="hb-jx" value="${config.joyX}"><input type="number" id="hb-jy" value="${config.joyY}"></div></div>
            <div class="hb-row"><label>Tamaño Botón Kick:</label><input type="number" id="hb-ks" value="${config.kickSize}"></div>
            <div class="hb-row"><label>Opacidad HUD (0.1 - 1):</label><input type="number" step="0.1" id="hb-op" value="${config.opacity}"></div>
            <button class="hb-btn" id="hb-save">Guardar</button>
        `;
        doc.body.appendChild(menu);

        doc.getElementById('hb-save').onclick = () => {
            config.joySize = parseInt(doc.getElementById('hb-js').value) || 120;
            config.joyX = parseInt(doc.getElementById('hb-jx').value) || 30;
            config.joyY = parseInt(doc.getElementById('hb-jy').value) || 30;
            config.kickSize = parseInt(doc.getElementById('hb-ks').value) || 90;
            config.opacity = parseFloat(doc.getElementById('hb-op').value) || 0.85;
            saveCfg(); updateHud();
            menu.style.display = 'none';
        };

        doc.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const chat = doc.querySelector('input[data-hook="input"]');
                if (chat && chat.value.trim() === '/mod') {
                    chat.value = '';
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
            }
        }, true);

        // Activar HUD cuando el canvas del mapa aparezca
        setInterval(() => {
            const canvas = doc.querySelector('canvas');
            if (canvas && canvas.offsetWidth > 100) {
                doc.body.classList.add('in-game');
            } else {
                doc.body.classList.remove('in-game');
            }
        }, 500);
    }

    // Esperar a que la página cargue por completo
    function loop() {
        const frame = document.querySelector('iframe.gameframe');
        const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
        const targetWin = frame ? frame.contentWindow : window;

        if (targetDoc && targetDoc.body && targetDoc.querySelector('div')) {
            setupOverlay(targetDoc, targetWin);
        } else {
            setTimeout(loop, 300);
        }
    }

    loop();
})();
