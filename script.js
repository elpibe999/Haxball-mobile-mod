/**
 * InjecThor Native Mobile Emulator + Haxball Custom Photo Mod
 * Includes Vixel-style Mobile Adaptation & Multi-Target Input Injection
 */

(function () {
  'use strict';

  // --- 1. VIXEL MOBILE ADAPTATION & SPOOFING ---
  function applyMobileEmulation(targetWindow) {
    if (!targetWindow) return;

    try {
      // 1. Spoof Navigator Properties
      const mobileUA = "Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
      Object.defineProperty(targetWindow.navigator, 'userAgent', { get: () => mobileUA, configurable: true });
      Object.defineProperty(targetWindow.navigator, 'platform', { get: () => 'Linux armv8l', configurable: true });
      Object.defineProperty(targetWindow.navigator, 'maxTouchPoints', { get: () => 5, configurable: true });
      Object.defineProperty(targetWindow.navigator, 'msMaxTouchPoints', { get: () => 5, configurable: true });
    } catch (e) {}

    // 2. Add ontouchstart to window/document if missing
    if (!('ontouchstart' in targetWindow)) {
      targetWindow.ontouchstart = null;
    }
    if (targetWindow.document && !('ontouchstart' in targetWindow.document)) {
      targetWindow.document.ontouchstart = null;
    }

    // 3. Override matchMedia for Touch/Pointer Queries (Critical for Haxball mobile detection)
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

  // Apply to top window immediately
  applyMobileEmulation(window);

  // Monitor and patch any game iframes
  function patchIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        if (iframe.contentWindow) {
          applyMobileEmulation(iframe.contentWindow);
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

  // --- 2. MULTI-TARGET INPUT DISPATCHER (WASD + Arrows + Space + X) ---
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

    // Include canvas elements and iframe targets
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

    // Keys definitions for Arrow + WASD + Kick combinations
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

  // --- 3. VIRTUAL JOYSTICK & KICK BUTTON ---
  function createVirtualControls() {
    if (document.getElementById('hax-touch-controls')) return;

    const container = document.createElement('div');
    container.id = 'hax-touch-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 15px;
      left: 0;
      right: 0;
      height: 160px;
      pointer-events: none;
      z-index: 999999;
      display: flex;
      justify-content: space-between;
      padding: 0 25px;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    `;

    // Joystick Base
    const joystickBase = document.createElement('div');
    joystickBase.style.cssText = `
      width: 125px;
      height: 125px;
      background: rgba(255, 255, 255, 0.18);
      border: 3px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      pointer-events: auto;
      position: relative;
      touch-action: none;
      align-self: flex-end;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;

    const joystickKnob = document.createElement('div');
    joystickKnob.style.cssText = `
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      position: absolute;
      top: 37.5px;
      left: 37.5px;
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.5);
    `;
    joystickBase.appendChild(joystickKnob);

    // Kick Button
    const kickBtn = document.createElement('div');
    kickBtn.style.cssText = `
      width: 100px;
      height: 100px;
      background: rgba(239, 68, 68, 0.8);
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
      font-size: 20px;
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

    // Joystick Touch Logic
    let activeTouchId = null;
    let baseRect = null;

    function processJoystickMove(clientX, clientY) {
      if (!baseRect) return;
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 38;

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const knobX = 37.5 + Math.cos(angle) * clampedDist;
      const knobY = 37.5 + Math.sin(angle) * clampedDist;

      joystickKnob.style.left = `${knobX}px`;
      joystickKnob.style.top = `${knobY}px`;

      // Sensitivity thresholds
      const threshold = 12;
      setMovementState('Left', dx < -threshold);
      setMovementState('Right', dx > threshold);
      setMovementState('Up', dy < -threshold);
      setMovementState('Down', dy > threshold);
    }

    function resetJoystick() {
      activeTouchId = null;
      joystickKnob.style.left = '37.5px';
      joystickKnob.style.top = '37.5px';

      setMovementState('Left', false);
      setMovementState('Right', false);
      setMovementState('Up', false);
      setMovementState('Down', false);
    }

    // Touch events for Joystick
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

    // Fallback Pointer events for desktop testing
    joystickBase.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // Handled by touch events
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

    // Kick Button Handlers
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
      kickBtn.style.background = 'rgba(239, 68, 68, 0.8)';
    };

    kickBtn.addEventListener('touchstart', pressKick, { passive: false });
    kickBtn.addEventListener('touchend', releaseKick, { passive: false });
    kickBtn.addEventListener('touchcancel', releaseKick, { passive: false });
    kickBtn.addEventListener('pointerdown', pressKick);
    kickBtn.addEventListener('pointerup', releaseKick);
  }

  // --- 4. /MOD MENU CREATION ---
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

  // Intercept Chat for /mod Command
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

  // Floating trigger button in top left to open menu on mobile easily
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

  // --- 5. CANVAS RENDERING HOOK FOR CUSTOM TEXTURES ---
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

  // Initialize
  hookCanvasRendering();
  createVirtualControls();
  createModMenu();
  createMenuButton();
})();
