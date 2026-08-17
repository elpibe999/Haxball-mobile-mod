(function () {
    // Evitar ejecuciones duplicadas
    if (window.hasInjectedMobileControls) return;
    window.hasInjectedMobileControls = true;

    // Función principal para inyectar controles
    function initOverlay() {
        // Buscar el iframe del juego o usar el documento actual
        const frame = document.querySelector('.gameframe');
        const targetDoc = frame ? (frame.contentDocument || frame.contentWindow.document) : document;
        const targetWin = frame ? frame.contentWindow : window;

        if (!targetDoc || !targetDoc.body) {
            setTimeout(initOverlay, 500);
            return;
        }

        // Estilos de la botonera
        const style = targetDoc.createElement('style');
        style.innerHTML = `
            #mobile-controls {
                position: fixed;
                bottom: 20px;
                left: 20px;
                right: 20px;
                z-index: 999999;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                pointer-events: none;
            }
            .control-btn {
                width: 65px;
                height: 65px;
                background: rgba(255, 255, 255, 0.35);
                border-radius: 50%;
                border: 2px solid #fff;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-weight: bold;
                font-family: sans-serif;
                font-size: 18px;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
                pointer-events: auto;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            }
            .control-btn:active {
                background: rgba(255, 255, 255, 0.7);
                transform: scale(0.95);
            }
            .dpad {
                display: grid;
                grid-template-columns: repeat(3, 65px);
                gap: 5px;
            }
        `;
        targetDoc.head.appendChild(style);

        // Disparar eventos de teclado dirigidos a la ventana del juego
        const sendKey = (code, keyName, type) => {
            const event = new KeyboardEvent(type, {
                key: keyName,
                code: keyName,
                keyCode: code,
                which: code,
                bubbles: true,
                cancelable: true
            });
            targetDoc.dispatchEvent(event);
            targetWin.dispatchEvent(event);
        };

        const createBtn = (label, code, keyName) => {
            const btn = targetDoc.createElement('div');
            btn.className = 'control-btn';
            btn.innerText = label;

            const start = (e) => { e.preventDefault(); sendKey(code, keyName, 'keydown'); };
            const end = (e) => { e.preventDefault(); sendKey(code, keyName, 'keyup'); };

            btn.addEventListener('touchstart', start, { passive: false });
            btn.addEventListener('touchend', end, { passive: false });
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);

            return btn;
        };

        // Crear contenedor
        const container = targetDoc.createElement('div');
        container.id = 'mobile-controls';

        // Cruceta D-Pad (Flechas)
        const dpad = targetDoc.createElement('div');
        dpad.className = 'dpad';
        dpad.appendChild(targetDoc.createElement('div'));
        dpad.appendChild(createBtn('▲', 38, 'ArrowUp'));
        dpad.appendChild(targetDoc.createElement('div'));
        dpad.appendChild(createBtn('◀', 37, 'ArrowLeft'));
        dpad.appendChild(createBtn('▼', 40, 'ArrowDown'));
        dpad.appendChild(createBtn('▶', 39, 'ArrowRight'));

        // Botón de Kick (Espacio / KeyX)
        const kickBtn = createBtn('KICK', 88, 'KeyX');

        container.appendChild(dpad);
        container.appendChild(kickBtn);
        targetDoc.body.appendChild(container);
    }

    if (document.readyState === 'complete') {
        initOverlay();
    } else {
        window.addEventListener('load', initOverlay);
    }
})();
