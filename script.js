(function () {
    if (window.hasInjectedMobileMod) return;
    window.hasInjectedMobileMod = true;

    function initMod() {
        const frame = document.querySelector('.gameframe');
        const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
        const targetWin = frame ? frame.contentWindow : window;

        if (!targetDoc || !targetDoc.body) {
            setTimeout(initMod, 300);
            return;
        }

        // ==========================================
        // 1. ADAPTACIÓN DE INTERFAZ Y CSS A MÓVIL
        // ==========================================
        const mobileStyles = targetDoc.createElement('style');
        mobileStyles.innerHTML = `
            /* Ocultar elementos innecesarios */
            .header, .rightbar, .file-btn, [data-hook="rec-btn"] { display: none !important; }
            body { touch-action: none; user-select: none; -webkit-user-select: none; background: #1a2125 !important; height: 100vh; margin: 0; overflow: hidden; }
            
            /* Reorganizar ventanas del juego */
            .room-view, .roomlist-view { height: 100% !important; margin-top: 0 !important; }
            .dialog { max-width: 95% !important; width: 450px; }
            .chatbox-view { position: absolute; left: 10px; top: 10px; width: 40%; z-index: 100; pointer-events: none; }
            .chatbox-view-contents { pointer-events: auto; }

            /* Estilos del Joystick y Botón Kick */
            #joystick-base {
                position: fixed; bottom: 25px; left: 25px;
                width: 130px; height: 130px;
                background: rgba(255, 255, 255, 0.15);
                border: 2px solid rgba(255, 255, 255, 0.4);
                border-radius: 50%; z-index: 999999;
                touch-action: none; box-shadow: 0 0 15px rgba(0,0,0,0.3);
            }
            #joystick-thumb {
                position: absolute; top: 50%; left: 50%;
                width: 50px; height: 50px;
                background: rgba(236, 240, 243, 0.85);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                transition: transform 0.05s ease-out;
            }
            #kick-btn {
                position: fixed; bottom: 35px; right: 30px;
                width: 100px; height: 100px;
                background: rgba(255, 255, 255, 0.2);
                border: 3px solid rgba(255, 255, 255, 0.6);
                border-radius: 50%; z-index: 999999;
                display: flex; align-items: center; justify-content: center;
                color: white; font-weight: bold; font-family: sans-serif; font-size: 20px;
                touch-action: none; box-shadow: 0 0 15px rgba(0,0,0,0.3);
            }
            #kick-btn:active { background: rgba(255, 255, 255, 0.5); transform: scale(0.95); }
        `;
        targetDoc.head.appendChild(mobileStyles);

        // Meta tag Viewport para bloquear zoom y forzar pantalla completa
        let meta = targetDoc.querySelector("meta[name=viewport]");
        if (!meta) {
            meta = targetDoc.createElement('meta');
            meta.name = 'viewport';
            targetDoc.head.appendChild(meta);
        }
        meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0');

        // ==========================================
        // 2. SIMULADOR DE EVENTOS DE TECLADO
        // ==========================================
        let activeKeys = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

        const sendKeyEvent = (code, type) => {
            const event = new KeyboardEvent(type, { code: code, key: code.replace('Key', ''), bubbles: true });
            targetDoc.dispatchEvent(event);
            targetWin.dispatchEvent(event);
        };

        const updateDirectionKeys = (w, a, s, d) => {
            if (activeKeys.KeyW !== w) { sendKeyEvent('KeyW', w ? 'keydown' : 'keyup'); activeKeys.KeyW = w; }
            if (activeKeys.KeyA !== a) { sendKeyEvent('KeyA', a ? 'keydown' : 'keyup'); activeKeys.KeyA = a; }
            if (activeKeys.KeyS !== s) { sendKeyEvent('KeyS', s ? 'keydown' : 'keyup'); activeKeys.KeyS = s; }
            if (activeKeys.KeyD !== d) { sendKeyEvent('KeyD', d ? 'keydown' : 'keyup'); activeKeys.KeyD = d; }
        };

        // ==========================================
        // 3. LOGICA DEL JOYSTICK DINÁMICO
        // ==========================================
        const joyBase = targetDoc.createElement('div');
        joyBase.id = 'joystick-base';
        const joyThumb = targetDoc.createElement('div');
        joyThumb.id = 'joystick-thumb';
        joyBase.appendChild(joyThumb);

        let isTouching = false;

        const handleTouch = (touch) => {
            const rect = joyBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = touch.clientX - centerX;
            const deltaY = touch.clientY - centerY;
            const angle = Math.atan2(deltaY, deltaX);
            const maxDistance = rect.width / 2;
            const distance = Math.min(maxDistance, Math.hypot(deltaX, deltaY));

            // Mover visualmente el thumb
            const thumbX = distance * Math.cos(angle);
            const thumbY = distance * Math.sin(angle);
            joyThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

            // Calcular los 8 ángulos direccionales (WASD)
            const normalizedAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
            const sector = Math.round((normalizedAngle * 180 / Math.PI) / 45) % 8;

            switch (sector) {
                case 0: updateDirectionKeys(false, false, false, true); break;  // D
                case 1: updateDirectionKeys(false, false, true, true); break;   // SD
                case 2: updateDirectionKeys(false, false, true, false); break;  // S
                case 3: updateDirectionKeys(false, true, true, false); break;   // SA
                case 4: updateDirectionKeys(false, true, false, false); break;  // A
                case 5: updateDirectionKeys(true, true, false, false); break;   // WA
                case 6: updateDirectionKeys(true, false, false, false); break;  // W
                case 7: updateDirectionKeys(true, false, false, true); break;   // WD
            }
        };

        const resetJoystick = () => {
            joyThumb.style.transform = 'translate(-50%, -50%)';
            updateDirectionKeys(false, false, false, false);
        };

        joyBase.addEventListener('touchstart', (e) => { isTouching = true; handleTouch(e.touches[0]); e.preventDefault(); }, { passive: false });
        joyBase.addEventListener('touchmove', (e) => { if (isTouching) handleTouch(e.touches[0]); e.preventDefault(); }, { passive: false });
        joyBase.addEventListener('touchend', (e) => { isTouching = false; resetJoystick(); e.preventDefault(); }, { passive: false });

        // ==========================================
        // 4. BOTÓN DE KICK (PATEAR / X)
        // ==========================================
        const kickBtn = targetDoc.createElement('div');
        kickBtn.id = 'kick-btn';
        kickBtn.innerText = 'KICK';

        kickBtn.addEventListener('touchstart', (e) => { e.preventDefault(); sendKeyEvent('KeyX', 'keydown'); }, { passive: false });
        kickBtn.addEventListener('touchend', (e) => { e.preventDefault(); sendKeyEvent('KeyX', 'keyup'); }, { passive: false });

        targetDoc.body.appendChild(joyBase);
        targetDoc.body.appendChild(kickBtn);
    }

    if (document.readyState === 'complete') initMod();
    else window.addEventListener('load', initMod);
})();
