(function () {
    if (window.hasInjectedHaxballUltraMod) return;
    window.hasInjectedHaxballUltraMod = true;

    function initMod() {
        const frame = document.querySelector('.gameframe');
        const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
        const targetWin = frame ? frame.contentWindow : window;

        if (!targetDoc || !targetDoc.body) {
            setTimeout(initMod, 150);
            return;
        }

        // ==========================================
        // 1. CONFIGURACIÓN GUARDADA Y ESTILOS HUD
        // ==========================================
        const config = JSON.parse(localStorage.getItem('haxball_mod_cfg')) || {
            joySize: 130, joyX: 25, joyY: 25,
            kickSize: 100, kickX: 30, kickY: 35,
            hudOpacity: 0.8
        };

        const saveConfig = () => localStorage.setItem('haxball_mod_cfg', JSON.stringify(config));

        const style = targetDoc.createElement('style');
        style.id = 'ultra-mod-styles';
        style.innerHTML = `
            /* Maximizador de FPS & Cero Lag */
            * { transform: translateZ(0); backface-visibility: hidden; }
            .header, .rightbar, .file-btn, [data-hook="rec-btn"] { display: none !important; }
            body { touch-action: none !important; user-select: none !important; -webkit-user-select: none; background: #1a2125 !important; overflow: hidden; }
            
            /* HUD - Oculto por defecto */
            #hud-container { display: none; position: fixed; inset: 0; pointer-events: none; z-index: 999999; }
            .in-room #hud-container { display: block; }

            #joystick-base {
                position: fixed;
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 50%; pointer-events: auto; touch-action: none;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }
            #joystick-thumb {
                position: absolute; top: 50%; left: 50%; width: 40%; height: 40%;
                background: rgba(255, 255, 255, 0.85); border-radius: 50%;
                transform: translate(-50%, -50%); pointer-events: none;
            }
            #kick-btn {
                position: fixed;
                background: rgba(255, 255, 255, 0.2);
                border: 3px solid rgba(255, 255, 255, 0.6);
                border-radius: 50%; pointer-events: auto; touch-action: none;
                display: flex; align-items: center; justify-content: center;
                color: #fff; font-weight: bold; font-family: sans-serif;
                box-shadow: 0 0 10px rgba(0,0,0,0.4);
            }
            #kick-btn:active { background: rgba(255, 255, 255, 0.6); }

            /* Menú /mod */
            #mod-menu {
                display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 320px; background: rgba(20, 25, 30, 0.95); border: 2px solid #3b82f6;
                border-radius: 12px; padding: 15px; color: #fff; font-family: sans-serif;
                z-index: 1000000; box-shadow: 0 10px 25px rgba(0,0,0,0.8);
            }
            #mod-menu h3 { margin: 0 0 10px 0; font-size: 16px; text-align: center; color: #60a5fa; }
            .mod-row { margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px; font-size: 12px; }
            .mod-row input { background: #0f172a; border: 1px solid #334155; color: #fff; padding: 6px; border-radius: 6px; }
            .mod-btn-close { background: #ef4444; color: #fff; border: none; padding: 8px; border-radius: 6px; width: 100%; font-weight: bold; margin-top: 5px; }
        `;
        targetDoc.head.appendChild(style);

        // ==========================================
        // 2. CREACIÓN DEL HUD Y CONTROLES
        // ==========================================
        const hudContainer = targetDoc.createElement('div');
        hudContainer.id = 'hud-container';

        const joyBase = targetDoc.createElement('div');
        joyBase.id = 'joystick-base';
        const joyThumb = targetDoc.createElement('div');
        joyThumb.id = 'joystick-thumb';
        joyBase.appendChild(joyThumb);

        const kickBtn = targetDoc.createElement('div');
        kickBtn.id = 'kick-btn';
        kickBtn.innerText = 'KICK';

        hudContainer.appendChild(joyBase);
        hudContainer.appendChild(kickBtn);
        targetDoc.body.appendChild(hudContainer);

        const applyHudStyles = () => {
            joyBase.style.width = `${config.joySize}px`;
            joyBase.style.height = `${config.joySize}px`;
            joyBase.style.left = `${config.joyX}px`;
            joyBase.style.bottom = `${config.joyY}px`;

            kickBtn.style.width = `${config.kickSize}px`;
            kickBtn.style.height = `${config.kickSize}px`;
            kickBtn.style.right = `${config.kickX}px`;
            kickBtn.style.bottom = `${config.kickY}px`;
            kickBtn.style.fontSize = `${config.kickSize * 0.22}px`;

            hudContainer.style.opacity = config.hudOpacity;
        };
        applyHudStyles();

        // ==========================================
        // 3. LOGICA DEL JOYSTICK Y 0-DELAY TECLADO
        // ==========================================
        let activeKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

        const sendKey = (code, type) => {
            const ev = new KeyboardEvent(type, { code: code, key: code.replace('Key', ''), bubbles: true });
            targetDoc.dispatchEvent(ev);
            targetWin.dispatchEvent(ev);
        };

        const updateKeys = (w, a, s, d) => {
            if (activeKeys.KeyW !== w) { sendKey('KeyW', w ? 'keydown' : 'keyup'); activeKeys.KeyW = w; }
            if (activeKeys.KeyA !== a) { sendKey('KeyA', a ? 'keydown' : 'keyup'); activeKeys.KeyA = a; }
            if (activeKeys.KeyS !== s) { sendKey('KeyS', s ? 'keydown' : 'keyup'); activeKeys.KeyS = s; }
            if (activeKeys.KeyD !== d) { sendKey('KeyD', d ? 'keydown' : 'keyup'); activeKeys.KeyD = d; }
        };

        let isTouching = false;
        const handleTouch = (touch) => {
            const rect = joyBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            const angle = Math.atan2(deltaY, deltaX);
            const dist = Math.min(rect.width / 2, Math.hypot(deltaX, deltaY));

            joyThumb.style.transform = `translate(calc(-50% + ${dist * Math.cos(angle)}px), calc(-50% + ${dist * Math.sin(angle)}px))`;

            const sector = Math.round(((angle + 2 * Math.PI) % (2 * Math.PI) * 180 / Math.PI) / 45) % 8;
            switch (sector) {
                case 0: updateKeys(false, false, false, true); break;
                case 1: updateKeys(false, false, true, true); break;
                case 2: updateKeys(false, false, true, false); break;
                case 3: updateKeys(false, true, true, false); break;
                case 4: updateKeys(false, true, false, false); break;
                case 5: updateKeys(true, true, false, false); break;
                case 6: updateKeys(true, false, false, false); break;
                case 7: updateKeys(true, false, false, true); break;
            }
        };

        joyBase.addEventListener('touchstart', (e) => { isTouching = true; handleTouch(e.touches[0]); e.preventDefault(); }, { passive: false });
        joyBase.addEventListener('touchmove', (e) => { if (isTouching) handleTouch(e.touches[0]); e.preventDefault(); }, { passive: false });
        joyBase.addEventListener('touchend', (e) => { isTouching = false; joyThumb.style.transform = 'translate(-50%, -50%)'; updateKeys(false, false, false, false); e.preventDefault(); }, { passive: false });

        kickBtn.addEventListener('touchstart', (e) => { e.preventDefault(); sendKey('KeyX', 'keydown'); }, { passive: false });
        kickBtn.addEventListener('touchend', (e) => { e.preventDefault(); sendKey('KeyX', 'keyup'); }, { passive: false });

        // ==========================================
        // 4. DETECCIÓN DE SALA (MOSTRAR/OCULTAR HUD)
        // ==========================================
        setInterval(() => {
            const inRoom = !!targetDoc.querySelector('.room-view, .game-view, canvas');
            if (inRoom) {
                targetDoc.body.classList.add('in-room');
            } else {
                targetDoc.body.classList.remove('in-room');
            }
        }, 500);

        // ==========================================
        // 5. MENÚ /mod Y PERSONALIZACIÓN DE HUD/AVATAR
        // ==========================================
        const menu = targetDoc.createElement('div');
        menu.id = 'mod-menu';
        menu.innerHTML = `
            <h3>Configuración Haxball Mod</h3>
            <div class="mod-row"><label>Avatar Image/Text:</label><input type="text" id="cfg-avatar" placeholder="Ej: 99 o URL"></div>
            <div class="mod-row"><label>Tamaño Joystick (px):</label><input type="number" id="cfg-joysize" value="${config.joySize}"></div>
            <div class="mod-row"><label>Posición X / Y Joystick:</label>
                <div style="display:flex; gap:5px;"><input type="number" id="cfg-joyx" value="${config.joyX}"><input type="number" id="cfg-joyy" value="${config.joyY}"></div>
            </div>
            <div class="mod-row"><label>Tamaño Botón Kick (px):</label><input type="number" id="cfg-kicksize" value="${config.kickSize}"></div>
            <div class="mod-row"><label>Opacidad HUD (0.1 - 1):</label><input type="number" step="0.1" id="cfg-opacity" value="${config.hudOpacity}"></div>
            <button class="mod-btn-close" id="cfg-close">Guardar y Cerrar</button>
        `;
        targetDoc.body.appendChild(menu);

        const toggleMenu = () => {
            const isVisible = menu.style.display === 'block';
            menu.style.display = isVisible ? 'none' : 'block';
        };

        targetDoc.getElementById('cfg-close').addEventListener('click', () => {
            config.joySize = parseInt(targetDoc.getElementById('cfg-joysize').value) || 130;
            config.joyX = parseInt(targetDoc.getElementById('cfg-joyx').value) || 25;
            config.joyY = parseInt(targetDoc.getElementById('cfg-joyy').value) || 25;
            config.kickSize = parseInt(targetDoc.getElementById('cfg-kicksize').value) || 100;
            config.hudOpacity = parseFloat(targetDoc.getElementById('cfg-opacity').value) || 0.8;
            saveConfig();
            applyHudStyles();
            toggleMenu();
        });

        // Interceptar el chat para activar /mod
        targetDoc.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const chatInput = targetDoc.querySelector('input[data-hook="input"]');
                if (chatInput && chatInput.value.trim() === '/mod') {
                    chatInput.value = '';
                    toggleMenu();
                }
            }
        }, true);
    }

    if (document.readyState === 'complete') initMod();
    else window.addEventListener('load', initMod);
})();
