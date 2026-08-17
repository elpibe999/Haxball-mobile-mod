(function() {
    // 1. Estilos del Overlay
    const style = document.createElement('style');
    style.innerHTML = `
        #mobile-controls { position: absolute; bottom: 20px; left: 20px; z-index: 9999; display: flex; gap: 20px; }
        .control-btn { width: 70px; height: 70px; background: rgba(255,255,255,0.4); border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; user-select: none; }
        .dpad { display: grid; grid-template-columns: 70px 70px 70px; gap: 5px; }
    `;
    document.head.appendChild(style);

    // 2. Crear los botones
    const container = document.createElement('div');
    container.id = 'mobile-controls';
    
    // Función para simular teclas
    const pressKey = (code, type) => {
        const event = new KeyboardEvent(type, { keyCode: code, which: code, bubbles: true });
        document.dispatchEvent(event);
    };

    const createBtn = (label, keyCode) => {
        const btn = document.createElement('div');
        btn.className = 'control-btn';
        btn.innerText = label;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); pressKey(keyCode, 'keydown'); });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); pressKey(keyCode, 'keyup'); });
        return btn;
    };

    // Estructura de botones (D-Pad + Kick)
    const dpad = document.createElement('div');
    dpad.className = 'dpad';
    dpad.appendChild(document.createElement('div')); // espacio
    dpad.appendChild(createBtn('▲', 38)); // Arriba
    dpad.appendChild(document.createElement('div')); // espacio
    dpad.appendChild(createBtn('◀', 37)); // Izquierda
    dpad.appendChild(createBtn('▼', 40)); // Abajo
    dpad.appendChild(createBtn('▶', 39)); // Derecha
    
    const kickBtn = createBtn('KICK', 88); // X (o 32 para espacio)
    
    container.appendChild(dpad);
    container.appendChild(kickBtn);
    document.body.appendChild(container);
    
    console.log("Controles móviles inyectados correctamente.");
})();
