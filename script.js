/**
 * InjecThor Native Mobile Emulator + Haxball Custom Photo Mod
 * Optimized specifically for Android InjecThor WebView
 */

(function () {
  'use strict';

  // --- 1. FORCE MOBILE TOUCH CAPABILITIES FOR INJECTHOR WEBVIEW ---
  function forceMobileWebView() {
    // 1. Fake Touch Events if absent in WebView
    if (!('ontouchstart' in window)) {
      window.ontouchstart = null;
    }
    
    // 2. Override navigator touch points
    try {
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5, configurable: true });
      Object.defineProperty(navigator, 'msMaxTouchPoints', { get: () => 5, configurable: true });
    } catch (e) {}

    // 3. Emulate TouchEvent constructor if missing or restricted
    if (typeof window.TouchEvent === 'undefined') {
      window.TouchEvent = function TouchEvent(type, dict) {
        const evt = document.createEvent('UIEvent');
        evt.initUIEvent(type, dict.bubbles || true, dict.cancelable || true, window, 1);
        evt.touches = dict.touches || [];
        evt.targetTouches = dict.targetTouches || [];
        evt.changedTouches = dict.changedTouches || [];
        return evt;
      };
    }
  }

  forceMobileWebView();

  // Mod state store
  const modState = {
    ballImage: null,
    defaultPlayerImg: null,
    fpsBoost: true
  };

  // --- 2. VIRTUAL MOBILE JOYSTICK & KICK BUTTON ---
  function createVirtualControls() {
    if (document.getElementById('hax-touch-controls')) return;

    const container = document.createElement('div');
    container.id = 'hax-touch-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 15px;
      left: 0;
      right: 0;
      height: 150px;
      pointer-events: none;
      z-index: 999999;
      display: flex;
      justify-content: space-between;
      padding: 0 25px;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
    `;

    // Joystick Base
    const joystickBase = document.createElement('div');
    joystickBase.style.cssText = `
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      pointer-events: auto;
      position: relative;
      touch-action: none;
      align-self: flex-end;
    `;

    const joystickKnob = document.createElement('div');
    joystickKnob.style.cssText = `
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      position: absolute;
      top: 36px;
      left: 36px;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    `;
    joystickBase.appendChild(joystickKnob);

    // Kick Button
    const kickBtn = document.createElement('div');
    kickBtn.style.cssText = `
      width: 95px;
      height: 95px;
      background: rgba(239, 68, 68, 0.75);
      border: 3px solid rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      pointer-events: auto;
      touch-action: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-family: sans-serif;
      font-size: 18px;
      align-self: flex-end;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
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

    // Touch/Pointer handlers for Movement & Kick
    let activePointerId = null;
    let baseRect = null;

    function handlePointerMove(e) {
      if (e.pointerId !== activePointerId) return;
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 36;

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const knobX = 36 + Math.cos(angle) * clampedDist;
      const knobY = 36 + Math.sin(angle) * clampedDist;

      joystickKnob.style.left = `${knobX}px`;
      joystickKnob.style.top = `${knobY}px`;

      triggerKeyEvent('ArrowLeft', dx < -12);
      triggerKeyEvent('ArrowRight', dx > 12);
      triggerKeyEvent('ArrowUp', dy < -12);
      triggerKeyEvent('ArrowDown', dy > 12);
    }

    function handlePointerUp(e) {
      if (e.pointerId === activePointerId) {
        activePointerId = null;
        joystickKnob.style.left = '36px';
        joystickKnob.style.top = '36px';

        triggerKeyEvent('ArrowLeft', false);
        triggerKeyEvent('ArrowRight', false);
        triggerKeyEvent('ArrowUp', false);
        triggerKeyEvent('ArrowDown', false);

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
      }
    }

    joystickBase.addEventListener('pointerdown', (e) => {
      activePointerId = e.pointerId;
      baseRect = joystickBase.getBoundingClientRect();
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      handlePointerMove(e);
    });

    kickBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      triggerKeyEvent('Space', true);
      kickBtn.style.transform = 'scale(0.92)';
      kickBtn.style.background = 'rgba(220, 38, 38, 0.9)';
    });

    const releaseKick = (e) => {
      e.preventDefault();
      triggerKeyEvent('Space', false);
      kickBtn.style.transform = 'scale(1)';
      kickBtn.style.background = 'rgba(239, 68, 68, 0.75)';
    };

    kickBtn.addEventListener('pointerup', releaseKick);
    kickBtn.addEventListener('pointercancel', releaseKick);
  }

  function triggerKeyEvent(code, isPressed) {
    const keyMap = {
      'ArrowLeft': { key: 'ArrowLeft', keyCode: 37 },
      'ArrowRight': { key: 'ArrowRight', keyCode: 39 },
      'ArrowUp': { key: 'ArrowUp', keyCode: 38 },
      'ArrowDown': { key: 'ArrowDown', keyCode: 40 },
      'Space': { key: ' ', keyCode: 32 }
    };

    const details = keyMap[code];
    if (!details) return;

    const event = new KeyboardEvent(isPressed ? 'keydown' : 'keyup', {
      key: details.key,
      code: code,
      keyCode: details.keyCode,
      which: details.keyCode,
      bubbles: true,
      cancelable: true
    });

    window.dispatchEvent(event);
    document.dispatchEvent(event);
  }

  // --- 3. /MOD MENU CREATION ---
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

  // --- 4. CANVAS RENDERING HOOK FOR CUSTOM TEXTURES ---
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
