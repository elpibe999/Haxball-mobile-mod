/**
 * Haxball Mobile Emulation + Custom Player/Ball Photo Mod + Low Latency
 * Features:
 * - Mobile device & Touch API spoofing (bypasses PC detection)
 * - Virtual Joystick & Kick button for touchscreen/mouse play
 * - Type /mod or press 'M' to open the customization menu
 * - Upload custom Ball and Player photos
 * - Low latency canvas optimizations
 */

(function () {
  'use strict';

  // --- 1. SPOOF MOBILE ENVIRONMENT (Bypass PC Detection) ---
  function spoofMobileEnvironment() {
    // Override navigator properties to simulate a mobile device
    const mobileUserAgent = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
    const mobilePlatform = "Linux armv8l";

    try {
      Object.defineProperty(navigator, 'userAgent', { get: () => mobileUserAgent, configurable: true });
      Object.defineProperty(navigator, 'platform', { get: () => mobilePlatform, configurable: true });
      Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5, configurable: true });
      Object.defineProperty(navigator, 'ontouchstart', { get: () => function () {}, configurable: true });
    } catch (e) {
      console.warn("Some navigator properties could not be overridden:", e);
    }

    // Force TouchEvent support detection
    if (!window.TouchEvent) {
      window.TouchEvent = function TouchEvent() {};
    }
  }

  spoofMobileEnvironment();

  // --- 2. STATE STORE ---
  const modState = {
    ballImage: null,
    defaultPlayerImg: null,
    fpsBoost: true,
    virtualControlsEnabled: true
  };

  // --- 3. VIRTUAL CONTROLS (Joystick & Kick Button) ---
  function createVirtualControls() {
    if (document.getElementById('hax-touch-controls')) return;

    const container = document.createElement('div');
    container.id = 'hax-touch-controls';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 0;
      right: 0;
      height: 180px;
      pointer-events: none;
      z-index: 999990;
      display: flex;
      justify-content: space-between;
      padding: 0 30px;
      box-sizing: border-box;
    `;

    // Joystick Base & Knob
    const joystickBase = document.createElement('div');
    joystickBase.style.cssText = `
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.15);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: auto;
      position: relative;
      touch-action: none;
      user-select: none;
      align-self: flex-end;
    `;

    const joystickKnob = document.createElement('div');
    joystickKnob.style.cssText = `
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      position: absolute;
      top: 35px;
      left: 35px;
      pointer-events: none;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
    `;
    joystickBase.appendChild(joystickKnob);

    // Kick Button
    const kickBtn = document.createElement('div');
    kickBtn.style.cssText = `
      width: 100px;
      height: 100px;
      background: rgba(239, 68, 68, 0.6);
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      pointer-events: auto;
      touch-action: none;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-family: sans-serif;
      font-size: 18px;
      align-self: flex-end;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    kickBtn.innerText = "KICK";

    container.appendChild(joystickBase);
    container.appendChild(kickBtn);
    document.body.appendChild(container);

    // --- Control Event Handlers ---
    let activePointerId = null;
    let baseRect = null;

    function handlePointerMove(e) {
      if (e.pointerId !== activePointerId) return;
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = 35;

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const knobX = 35 + Math.cos(angle) * clampedDist;
      const knobY = 35 + Math.sin(angle) * clampedDist;

      joystickKnob.style.left = `${knobX}px`;
      joystickKnob.style.top = `${knobY}px`;

      // Dispatch Arrow Key events for compatibility
      triggerKeyEvent('ArrowLeft', dx < -15);
      triggerKeyEvent('ArrowRight', dx > 15);
      triggerKeyEvent('ArrowUp', dy < -15);
      triggerKeyEvent('ArrowDown', dy > 15);
    }

    function handlePointerUp(e) {
      if (e.pointerId === activePointerId) {
        activePointerId = null;
        joystickKnob.style.left = '35px';
        joystickKnob.style.top = '35px';

        triggerKeyEvent('ArrowLeft', false);
        triggerKeyEvent('ArrowRight', false);
        triggerKeyEvent('ArrowUp', false);
        triggerKeyEvent('ArrowDown', false);

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      }
    }

    joystickBase.addEventListener('pointerdown', (e) => {
      activePointerId = e.pointerId;
      baseRect = joystickBase.getBoundingClientRect();
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      handlePointerMove(e);
    });

    // Kick button handler (Space key or X)
    kickBtn.addEventListener('pointerdown', () => {
      triggerKeyEvent('Space', true);
      kickBtn.style.transform = 'scale(0.9)';
      kickBtn.style.background = 'rgba(220, 38, 38, 0.8)';
    });

    kickBtn.addEventListener('pointerup', () => {
      triggerKeyEvent('Space', false);
      kickBtn.style.transform = 'scale(1)';
      kickBtn.style.background = 'rgba(239, 68, 68, 0.6)';
    });
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

  // --- 4. PERFORMANCE TUNING (0-Delay & High FPS) ---
  function applyPerformanceTweaks() {
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d', {
        alpha: false,
        desynchronized: true,
        willReadFrequently: false
      });
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
    });
  }

  // --- 5. MOD MENU UI (/mod) ---
  function createModMenu() {
    if (document.getElementById('hax-mod-menu')) return;

    const menuHtml = `
      <div id="hax-mod-menu" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(18, 24, 38, 0.95);
        color: #fff;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        border: 1px solid #2a364f;
        font-family: system-ui, -apple-system, sans-serif;
        z-index: 999999;
        display: none;
        width: 320px;
      ">
        <div style="display:flex; justify-space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; font-size:18px; color:#40a9ff;">📱 Mobile + Custom Photo Mod</h3>
          <span id="close-mod-menu" style="cursor:pointer; font-weight:bold; color:#aaa; font-size:18px;">✕</span>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display:block; font-size:12px; margin-bottom:6px; color:#ccc;">⚽ Ball Custom Photo</label>
          <input type="file" id="ball-photo-input" accept="image/*" style="width: 100%; font-size:12px; background:#141923; color:#fff; border:1px solid #334155; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display:block; font-size:12px; margin-bottom:6px; color:#ccc;">🏃 Player Custom Photo</label>
          <input type="file" id="player-photo-input" accept="image/*" style="width: 100%; font-size:12px; background:#141923; color:#fff; border:1px solid #334155; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 14px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:13px; color:#ccc;">🕹️ Virtual Touch Controls</span>
          <input type="checkbox" id="touch-controls-toggle" checked style="cursor:pointer; transform:scale(1.2);" />
        </div>

        <div style="margin-bottom: 16px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:13px; color:#ccc;">⚡ Max FPS / Low-Latency</span>
          <input type="checkbox" id="fps-boost-toggle" checked style="cursor:pointer; transform:scale(1.2);" />
        </div>

        <button id="reset-textures-btn" style="
          width: 100%;
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          font-size: 12px;
        ">Reset Default Textures</button>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = menuHtml;
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

    document.getElementById('fps-boost-toggle').addEventListener('change', (e) => {
      modState.fpsBoost = e.target.checked;
      if (modState.fpsBoost) applyPerformanceTweaks();
    });

    document.getElementById('reset-textures-btn').onclick = () => {
      modState.ballImage = null;
      modState.defaultPlayerImg = null;
      document.getElementById('ball-photo-input').value = '';
      document.getElementById('player-photo-input').value = '';
    };
  }

  function toggleMenu() {
    const menu = document.getElementById('hax-mod-menu');
    if (menu) {
      menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
    }
  }

  // --- 6. COMMAND & HOTKEY LISTENER ---
  function initCommandListener() {
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'm' && document.activeElement.tagName !== 'INPUT') {
        toggleMenu();
      }
    });

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
  }

  // --- 7. HOOK CANVAS FOR CUSTOM TEXTURES ---
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

  // --- 8. INITIALIZATION ---
  function initMod() {
    createModMenu();
    createVirtualControls();
    initCommandListener();
    hookCanvasRendering();
    applyPerformanceTweaks();
    console.log("✅ Mobile Emulator & Custom Photo Mod Loaded! Type /mod or press 'M' for settings.");
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initMod();
  } else {
    document.addEventListener('DOMContentLoaded', initMod);
  }
})();
