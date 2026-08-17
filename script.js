/**
 * InjecThor Native Mobile Emulator + Haxball Custom Photo Mod
 * Includes Full Mobile Responsive UI Adaptations (Login, Rooms, Lobby, Chat & Creation)
 */

(function () {
  'use strict';

  // --- 1. MOBILE CSS STYLES INJECTION (RESPONSIVE UI FOR HAXBALL) ---
  function injectMobileUIStyles() {
    if (document.getElementById('hax-mobile-responsive-styles')) return;

    const style = document.createElement('style');
    style.id = 'hax-mobile-responsive-styles';
    style.innerHTML = `
      /* Prevent scrolling on whole viewport while playing */
      html, body {
        overflow: hidden !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
      }

      /* Enable input selection inside inputs/textareas */
      input, textarea {
        user-select: text !important;
        -webkit-user-select: text !important;
        font-size: 14px !important;
      }

      /* --- MOBILE OVERRIDES FOR HAXBALL INTERFACE --- */

      /* Containers scaling & centering */
      .game-frame, .dialog, .box, .window, [class*="game-"], [class*="dialog"] {
        max-width: 98vw !important;
        font-size: 13px !important;
        border-radius: 8px !important;
      }

      /* Nickname / Login Screen */
      .nickname-view, [class*="nickname"] {
        width: 90vw !important;
        max-width: 360px !important;
        margin: auto !important;
        padding: 15px !important;
        box-sizing: border-box !important;
      }

      .nickname-view input, [class*="nickname"] input {
        width: 100% !important;
        height: 42px !important;
        font-size: 16px !important;
        margin-bottom: 10px !important;
        padding: 8px 12px !important;
        box-sizing: border-box !important;
        border-radius: 8px !important;
      }

      .nickname-view button, [class*="nickname"] button {
        width: 100% !important;
        height: 44px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        border-radius: 8px !important;
      }

      /* Room List View */
      .roomlist-view, [class*="roomlist"] {
        width: 96vw !important;
        height: 85vh !important;
        max-height: 90vh !important;
        margin: 5px auto !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 8px !important;
        box-sizing: border-box !important;
      }

      .roomlist-view table, [class*="roomlist"] table {
        width: 100% !important;
        font-size: 12px !important;
      }

      .roomlist-view tr, [class*="roomlist"] tr {
        height: 38px !important;
      }

      .roomlist-view td, [class*="roomlist"] td {
        padding: 6px 4px !important;
      }

      /* Buttons bar in Room List */
      .roomlist-view .button-row, [class*="roomlist"] [class*="buttons"], [class*="roomlist"] [class*="row"] {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 6px !important;
        margin-top: 8px !important;
      }

      .roomlist-view button, [class*="roomlist"] button {
        flex: 1 1 auto !important;
        min-height: 40px !important;
        font-size: 13px !important;
        font-weight: bold !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
      }

      /* Create Room Menu Modal */
      .create-room-view, [class*="create-room"], [class*="createRoom"] {
        width: 90vw !important;
        max-width: 380px !important;
        padding: 12px !important;
        box-sizing: border-box !important;
      }

      .create-room-view input, .create-room-view select,
      [class*="create-room"] input, [class*="create-room"] select {
        height: 36px !important;
        font-size: 14px !important;
        margin-bottom: 8px !important;
        border-radius: 6px !important;
      }

      /* In-Room Lobby View */
      .room-view, [class*="room-view"] {
        width: 98vw !important;
        height: 92vh !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 5px !important;
        box-sizing: border-box !important;
      }

      /* Team Containers Stack Layout for Mobile */
      .room-view .teams-container, [class*="teams-"] {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        gap: 4px !important;
        max-height: 45vh !important;
        overflow-y: auto !important;
      }

      .room-view .team, [class*="team-"] {
        flex: 1 !important;
        min-width: 0 !important;
        padding: 4px !important;
      }

      .room-view .team .player-list, [class*="player-list"] {
        max-height: 120px !important;
        overflow-y: auto !important;
        font-size: 12px !important;
      }

      /* In-Room Chat & Input */
      .chat-box, [class*="chat-"] {
        height: 120px !important;
        font-size: 11px !important;
        border-radius: 6px !important;
      }

      .chat-input-container, [class*="chat-input"] {
        display: flex !important;
        height: 38px !important;
        margin-top: 4px !important;
      }

      .chat-input-container input, [class*="chat-input"] input {
        flex: 1 !important;
        height: 100% !important;
        font-size: 13px !important;
        border-radius: 6px 0 0 6px !important;
      }

      .chat-input-container button, [class*="chat-input"] button {
        width: 60px !important;
        height: 100% !important;
        font-size: 13px !important;
        font-weight: bold !important;
        border-radius: 0 6px 6px 0 !important;
      }

      /* In-Room Action Buttons Grid */
      .room-view .controls, [class*="room-"] [class*="controls"], [class*="bottom-section"] {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)) !important;
        gap: 5px !important;
        margin-top: 6px !important;
      }

      .room-view button, [class*="room-"] button {
        min-height: 38px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
      }

      /* Game Canvas Container */
      canvas {
        max-width: 100vw !important;
        max-height: 100vh !important;
        object-fit: contain !important;
      }
    `;

    document.head.appendChild(style);
  }

  // --- 2. VIXEL MOBILE ADAPTATION & SPOOFING ---
  function applyMobileEmulation(targetWindow) {
    if (!targetWindow) return;

    try {
      const mobileUA = "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
      Object.defineProperty(targetWindow.navigator, 'userAgent', { get: () => mobileUA, configurable: true });
      Object.defineProperty(targetWindow.navigator, 'platform', { get: () => 'Linux armv8l', configurable: true });
      Object.defineProperty(targetWindow.navigator, 'maxTouchPoints', { get: () => 5, configurable: true });
      Object.defineProperty(targetWindow.navigator, 'msMaxTouchPoints', { get: () => 5, configurable: true });
    } catch (e) {}

    if (!('ontouchstart' in targetWindow)) {
      targetWindow.ontouchstart = null;
    }
    if (targetWindow.document && !('ontouchstart' in targetWindow.document)) {
      targetWindow.document.ontouchstart = null;
    }

    const originalMatchMedia = targetWindow.matchMedia;
    targetWindow.matchMedia = function (query) {
      if (typeof query === 'string') {
        const q = query.toLowerCase();
        if (q.includes('(pointer: coarse)') || q.includes('(hover: none)') || q.includes('any-pointer: coarse')) {
          return { matches: true, media: query, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
        }
        if (q.includes('(pointer: fine)') || q.includes('(hover: hover)')) {
          return { matches: false, media: query, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
        }
      }
      return originalMatchMedia ? originalMatchMedia.call(targetWindow, query) : { matches: false, media: query, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {} };
    };
  }

  applyMobileEmulation(window);

  function patchIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        if (iframe.contentWindow) {
          applyMobileEmulation(iframe.contentWindow);
          if (iframe.contentDocument && iframe.contentDocument.head) {
            if (!iframe.contentDocument.getElementById('hax-mobile-responsive-styles')) {
              const style = iframe.contentDocument.createElement('style');
              style.id = 'hax-mobile-responsive-styles';
              style.innerHTML = document.getElementById('hax-mobile-responsive-styles')?.innerHTML || '';
              iframe.contentDocument.head.appendChild(style);
            }
          }
        }
      } catch (e) {}
    });
  }

  setInterval(patchIframes, 1000);

  // Mod state store
  const modState = {
    ballImage: null,
    defaultPlayerImg: null,
    fpsBoost: true
  };

  // --- 3. MULTI-TARGET INPUT DISPATCHER (WASD + Arrows + Space + X) ---
  const activeKeys = new Set();

  function sendKeyEventToTarget(target, type, key, code, keyCode) {
    if (!target) return;
    try {
      const evt = new KeyboardEvent(type, {
        key: key,
        code: code,
        keyCode: keyCode,
        which: keyCode,
        charCode: keyCode,
        bubbles: true,
        cancelable: true,
        composed: true
      });
      target.dispatchEvent(evt);
    } catch (e) {}
  }

  function dispatchKeyCombination(type, code) {
    const targets = [
      window,
      document,
      document.body,
      document.activeElement
    ];

    document.querySelectorAll('canvas').forEach(c => targets.push(c));
    document.querySelectorAll('iframe').forEach(iframe => {
      try {
        if (iframe.contentWindow) {
          targets.push(iframe.contentWindow);
          targets.push(iframe.contentDocument);
          targets.push(iframe.contentDocument.body);
          iframe.contentDocument.querySelectorAll('canvas').forEach(c => targets.push(c));
        }
      } catch (e) {}
    });

    const keyDefinitions = {
      'Up': [
        { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 },
        { key: 'w', code: 'KeyW', keyCode: 87 },
        { key: 'W', code: 'KeyW', keyCode: 87 }
      ],
      'Down': [
        { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 },
        { key: 's', code: 'KeyS', keyCode: 83 },
        { key: 'S', code: 'KeyS', keyCode: 83 }
      ],
      'Left': [
        { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 },
        { key: 'a', code: 'KeyA', keyCode: 65 },
        { key: 'A', code: 'KeyA', keyCode: 65 }
      ],
      'Right': [
        { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 },
        { key: 'd', code: 'KeyD', keyCode: 68 },
        { key: 'D', code: 'KeyD', keyCode: 68 }
      ],
      'Kick': [
        { key: ' ', code: 'Space', keyCode: 32 },
        { key: 'x', code: 'KeyX', keyCode: 88 },
        { key: 'X', code: 'KeyX', keyCode: 88 },
        { key: 'Control', code: 'ControlLeft', keyCode: 17 },
        { key: 'Shift', code: 'ShiftLeft', keyCode: 16 }
      ]
    };

    const keysToDispatch = keyDefinitions[code] || [];

    targets.forEach(target => {
      if (!target) return;
      keysToDispatch.forEach(k => {
        sendKeyEventToTarget(target, type, k.key, k.code, k.keyCode);
      });
    });
  }

  function setMovementState(dir, isPressed) {
    const keyName = 'dir_' + dir;
    if (isPressed) {
      if (!activeKeys.has(keyName)) {
        activeKeys.add(keyName);
        dispatchKeyCombination('keydown', dir);
      }
    } else {
      if (activeKeys.has(keyName)) {
        activeKeys.delete(keyName);
        dispatchKeyCombination('keyup', dir);
      }
    }
  }

  // --- 4. VIRTUAL JOYSTICK & KICK BUTTON ---
  function createVirtualControls() {
    if (document.getElementById('hax-touch-controls')) return;

    const container = document.createElement('div');
    container.id = 'hax-touch-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 12px;
      left: 0;
      right: 0;
      height: 150px;
      pointer-events: none;
      z-index: 999999;
      display: flex;
      justify-content: space-between;
      padding: 0 20px;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    `;

    // Joystick Base
    const joystickBase = document.createElement('div');
    joystickBase.style.cssText = `
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.45);
      border-radius: 50%;
      pointer-events: auto;
      position: relative;
      touch-action: none;
      align-self: flex-end;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;

    const joystickKnob = document.createElement('div');
    joystickKnob.style.cssText = `
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      position: absolute;
      top: 36px;
      left: 36px;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    joystickBase.appendChild(joystickKnob);

    // Kick Button
    const kickBtn = document.createElement('div');
    kickBtn.style.cssText = `
      width: 95px;
      height: 95px;
      background: rgba(239, 68, 68, 0.85);
      border: 3px solid rgba(255, 255, 255, 0.7);
      border-radius: 50%;
      pointer-events: auto;
      touch-action: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-family: system-ui, sans-serif;
      font-size: 18px;
      align-self: flex-end;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
      letter-spacing: 1px;
    `;
    kickBtn.innerText = "KICK";

    container.appendChild(joystickBase);
    container.appendChild(kickBtn);

    function mountControls() {
      if (document.body && !document.getElementById('hax-touch-controls')) {
        document.body.appendChild(container);
      }
    }

    if (document.body) mountControls();
    else window.addEventListener('DOMContentLoaded', mountControls);

    let activeTouchId = null;
    let baseRect = null;

    function processJoystickMove(clientX, clientY) {
      if (!baseRect) return;
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 36;

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const knobX = 36 + Math.cos(angle) * clampedDist;
      const knobY = 36 + Math.sin(angle) * clampedDist;

      joystickKnob.style.left = `${knobX}px`;
      joystickKnob.style.top = `${knobY}px`;

      const threshold = 10;
      setMovementState('Left', dx < -threshold);
      setMovementState('Right', dx > threshold);
      setMovementState('Up', dy < -threshold);
      setMovementState('Down', dy > threshold);
    }

    function resetJoystick() {
      activeTouchId = null;
      joystickKnob.style.left = '36px';
      joystickKnob.style.top = '36px';

      setMovementState('Left', false);
      setMovementState('Right', false);
      setMovementState('Up', false);
      setMovementState('Down', false);
    }

    joystickBase.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      activeTouchId = touch.identifier;
      baseRect = joystickBase.getBoundingClientRect();
      processJoystickMove(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          processJoystickMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    }, { passive: false });

    const endTouchHandler = (e) => {
      if (activeTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          resetJoystick();
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouchHandler);
    window.addEventListener('touchcancel', endTouchHandler);

    joystickBase.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      activeTouchId = e.pointerId;
      baseRect = joystickBase.getBoundingClientRect();
      const onPointerMove = (pe) => processJoystickMove(pe.clientX, pe.clientY);
      const onPointerUp = () => {
        resetJoystick();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      processJoystickMove(e.clientX, e.clientY);
    });

    const pressKick = (e) => {
      if (e) e.preventDefault();
      setMovementState('Kick', true);
      kickBtn.style.transform = 'scale(0.92)';
      kickBtn.style.background = 'rgba(220, 38, 38, 0.95)';
    };

    const releaseKick = (e) => {
      if (e) e.preventDefault();
      setMovementState('Kick', false);
      kickBtn.style.transform = 'scale(1)';
      kickBtn.style.background = 'rgba(239, 68, 68, 0.85)';
    };

    kickBtn.addEventListener('touchstart', pressKick, { passive: false });
    kickBtn.addEventListener('touchend', releaseKick, { passive: false });
    kickBtn.addEventListener('touchcancel', releaseKick, { passive: false });
    kickBtn.addEventListener('pointerdown', pressKick);
    kickBtn.addEventListener('pointerup', releaseKick);
  }

  // --- 5. /MOD MENU CREATION ---
  function createModMenu() {
    if (document.getElementById('hax-mod-menu')) return;

    const menuHtml = `
      <div id="hax-mod-menu" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(15, 23, 42, 0.96);
        color: #fff;
        padding: 20px;
        border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        border: 1px solid #334155;
        font-family: system-ui, -apple-system, sans-serif;
        z-index: 9999999;
        display: none;
        width: 290px;
      ">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h3 style="margin:0; font-size:16px; color:#38bdf8;">🎮 Haxball Mobile Mod</h3>
          <span id="close-mod-menu" style="cursor:pointer; font-weight:bold; color:#94a3b8; font-size:20px; padding:0 4px;">✕</span>
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display:block; font-size:12px; margin-bottom:4px; color:#cbd5e1;">⚽ Ball Image</label>
          <input type="file" id="ball-photo-input" accept="image/*" style="width: 100%; font-size:11px; background:#0f172a; color:#fff; border:1px solid #334155; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 12px;">
          <label style="display:block; font-size:12px; margin-bottom:4px; color:#cbd5e1;">🏃 Player Image</label>
          <input type="file" id="player-photo-input" accept="image/*" style="width: 100%; font-size:11px; background:#0f172a; color:#fff; border:1px solid #334155; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 14px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:12px; color:#cbd5e1;">🕹️ Touch Controls</span>
          <input type="checkbox" id="touch-controls-toggle" checked style="transform:scale(1.3);" />
        </div>

        <button id="reset-textures-btn" style="
          width: 100%;
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 12px;
        ">Reset Textures</button>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = menuHtml;

    function mountMenu() {
      if (document.body && !document.getElementById('hax-mod-menu')) {
        document.body.appendChild(div);

        document.getElementById('close-mod-menu').onclick = () => {
          document.getElementById('hax-mod-menu').style.display = 'none';
        };

        document.getElementById('ball-photo-input').addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.src = event.target.result;
              img.onload = () => { modState.ballImage = img; };
            };
            reader.readAsDataURL(file);
          }
        });

        document.getElementById('player-photo-input').addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const img = new Image();
              img.src = event.target.result;
              img.onload = () => { modState.defaultPlayerImg = img; };
            };
            reader.readAsDataURL(file);
          }
        });

        document.getElementById('touch-controls-toggle').addEventListener('change', (e) => {
          const ctrl = document.getElementById('hax-touch-controls');
          if (ctrl) ctrl.style.display = e.target.checked ? 'flex' : 'none';
        });

        document.getElementById('reset-textures-btn').onclick = () => {
          modState.ballImage = null;
          modState.defaultPlayerImg = null;
          document.getElementById('ball-photo-input').value = '';
          document.getElementById('player-photo-input').value = '';
        };
      }
    }

    if (document.body) mountMenu();
    else window.addEventListener('DOMContentLoaded', mountMenu);
  }

  function toggleMenu() {
    const menu = document.getElementById('hax-mod-menu');
    if (menu) {
      menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
    }
  }

  window.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const input = document.querySelector('input[type="text"]');
      if (input && input.value.trim() === '/mod') {
        e.preventDefault();
        e.stopPropagation();
        input.value = '';
        toggleMenu();
      }
    }
  }, true);

  function createMenuButton() {
    const btn = document.createElement('div');
    btn.innerText = "⚙️ MOD";
    btn.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(15, 23, 42, 0.85);
      color: #38bdf8;
      border: 1px solid #334155;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: bold;
      z-index: 999999;
      pointer-events: auto;
      font-family: sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    `;
    btn.onclick = toggleMenu;

    function mountBtn() {
      if (document.body) document.body.appendChild(btn);
    }
    if (document.body) mountBtn();
    else window.addEventListener('DOMContentLoaded', mountBtn);
  }

  // --- 6. CANVAS RENDERING HOOK FOR CUSTOM TEXTURES ---
  function hookCanvasRendering() {
    const HTMLCanvasElementProto = HTMLCanvasElement.prototype;
    const originalGetContext = HTMLCanvasElementProto.getContext;

    HTMLCanvasElementProto.getContext = function (type, attributes) {
      if (type === '2d') {
        attributes = attributes || {};
        attributes.desynchronized = true;
        attributes.alpha = false;
      }
      const ctx = originalGetContext.call(this, type, attributes);

      if (ctx && !ctx.__isHooked) {
        ctx.__isHooked = true;
        const originalArc = ctx.arc;

        ctx.arc = function (x, y, radius, startAngle, endAngle, counterclockwise) {
          const isBall = radius >= 8 && radius <= 11;
          const isPlayer = radius >= 14 && radius <= 16;

          if (isBall && modState.ballImage) {
            ctx.save();
            ctx.beginPath();
            originalArc.call(this, x, y, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(modState.ballImage, x - radius, y - radius, radius * 2, radius * 2);
            ctx.restore();
            return;
          }

          if (isPlayer && modState.defaultPlayerImg) {
            ctx.save();
            ctx.beginPath();
            originalArc.call(this, x, y, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(modState.defaultPlayerImg, x - radius, y - radius, radius * 2, radius * 2);
            ctx.restore();
            return;
          }

          return originalArc.call(this, x, y, radius, startAngle, endAngle, counterclockwise);
        };
      }
      return ctx;
    };
  }

  // Initialize all features
  injectMobileUIStyles();
  hookCanvasRendering();
  createVirtualControls();
  createModMenu();
  createMenuButton();
})();
