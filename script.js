/**
 * InjecThor Native Mobile Emulator + Haxball Custom Photo Mod
 * Mobile UI Centering, Native Menu Centering, Settings > Input HUD Integration
 * Author: Kartt
 */

(function () {
  'use strict';

  // --- 1. PERSISTENT SETTINGS (Keybinds & HUD Customization) ---
  const DEFAULT_SETTINGS = {
    keyUp: 'KeyW',
    keyDown: 'KeyS',
    keyLeft: 'KeyA',
    keyRight: 'KeyD',
    keyKick: 'Space',
    joystickX: 30,
    joystickY: 30,
    joystickSize: 120,
    kickX: 30,
    kickY: 30,
    kickSize: 95
  };

  function loadSettings() {
    try {
      const saved = localStorage.getItem('hax_mobile_settings');
      return saved ? Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved)) : Object.assign({}, DEFAULT_SETTINGS);
    } catch (e) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem('hax_mobile_settings', JSON.stringify(settings));
    } catch (e) {}
  }

  const userSettings = loadSettings();

  // Mod state store
  const modState = {
    ballImage: null,
    defaultPlayerImg: null,
    fpsBoost: true,
    isHudEditMode: false
  };

  // --- 2. GLOBAL CSS STYLES (FULLSCREEN BACKGROUND, CENTERING & CAPTCHA FIX) ---
  function injectMobileUIStyles() {
    if (document.getElementById('hax-mobile-responsive-styles')) return;

    const style = document.createElement('style');
    style.id = 'hax-mobile-responsive-styles';
    style.innerHTML = `
      /* Dark Gray Fullscreen Background */
      html, body {
        background-color: #1a1d24 !important;
        color: #e2e8f0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        touch-action: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        width: 100vw !important;
        height: 100vh !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        font-family: system-ui, -apple-system, sans-serif !important;
      }

      /* Enable text selection inside input fields */
      input, textarea, select {
        user-select: text !important;
        -webkit-user-select: text !important;
        font-size: 14px !important;
      }

      /* Main container wrapper sizing */
      body > div, .game-frame, .dialog, .box, .window, [class*="game-"], [class*="dialog"], [class*="view"] {
        box-sizing: border-box !important;
      }

      /* --- HAXBALL NATIVE MENU & HEADER CENTERING FIX --- */
      .header, .nav, .menu, .top-bar, [class*="header"], [class*="nav"], [class*="menu"], [class*="top-bar"] {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin-left: auto !important;
        margin-right: auto !important;
        text-align: center !important;
      }

      /* Native Menu Action Buttons Centering */
      .header button, .nav button, .menu button, [class*="header"] button, [class*="nav"] button, [class*="menu"] button {
        margin: 0 4px !important;
        align-self: center !important;
      }

      /* --- NICKNAME / LOGIN SCREEN --- */
      .nickname-view, [class*="nickname"] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 90vw !important;
        max-width: 360px !important;
        padding: 24px !important;
        background: #242832 !important;
        border: 1px solid #333947 !important;
        border-radius: 14px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.7) !important;
        z-index: 1000 !important;
      }

      .nickname-view input, [class*="nickname"] input {
        width: 100% !important;
        height: 44px !important;
        font-size: 16px !important;
        margin-bottom: 12px !important;
        padding: 8px 14px !important;
        border-radius: 8px !important;
        background: #14161d !important;
        color: #fff !important;
        border: 1px solid #3b4252 !important;
      }

      .nickname-view button, [class*="nickname"] button {
        width: 100% !important;
        height: 46px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        border-radius: 8px !important;
        background: #3b82f6 !important;
        color: white !important;
        border: none !important;
      }

      /* --- ROOM LIST / SERVER MENU --- */
      .roomlist-view, [class*="roomlist"] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 94vw !important;
        height: 85vh !important;
        max-width: 720px !important;
        background: #242832 !important;
        border: 1px solid #333947 !important;
        border-radius: 12px !important;
        padding: 12px !important;
        display: flex !important;
        flex-direction: column !important;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6) !important;
        z-index: 1000 !important;
      }

      .roomlist-view table, [class*="roomlist"] table {
        width: 100% !important;
        font-size: 13px !important;
      }

      .roomlist-view button, [class*="roomlist"] button {
        min-height: 40px !important;
        font-size: 13px !important;
        font-weight: bold !important;
        border-radius: 8px !important;
      }

      /* --- CREATE ROOM MODAL --- */
      .create-room-view, [class*="create-room"], [class*="createRoom"] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 90vw !important;
        max-width: 380px !important;
        background: #242832 !important;
        padding: 16px !important;
        border: 1px solid #333947 !important;
        border-radius: 12px !important;
        z-index: 1001 !important;
      }

      /* --- RECAPTCHA / CAPTCHA DIALOG CENTERING FIX --- */
      iframe[src*="recaptcha"], .g-recaptcha, [class*="recaptcha"], [class*="captcha"], .dialog[class*="captcha"] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        margin: auto !important;
        z-index: 99999999 !important;
        max-width: 95vw !important;
      }

      div:has(> iframe[src*="recaptcha"]), div:has(> .g-recaptcha) {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        z-index: 99999999 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      /* --- IN-ROOM LOBBY & GAME VIEW --- */
      .room-view, [class*="room-view"] {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 96vw !important;
        height: 92vh !important;
        max-width: 900px !important;
        background: #242832 !important;
        border: 1px solid #333947 !important;
        border-radius: 12px !important;
        padding: 8px !important;
        display: flex !important;
        flex-direction: column !important;
        z-index: 500 !important;
      }

      /* --- GAME CANVAS CONTAINER --- */
      .game-view, [class*="game-view"] {
        position: fixed !important;
        inset: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 10 !important;
        background: transparent !important;
      }

      canvas {
        display: block !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        object-fit: contain !important;
        margin: auto !important;
        visibility: visible !important;
        opacity: 1 !important;
      }

      /* --- CREDITS TAG (HIDDEN DURING LOGIN) --- */
      .kartt-credit-tag {
        position: fixed !important;
        bottom: 8px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        color: #94a3b8 !important;
        font-size: 12px !important;
        font-weight: 800 !important;
        letter-spacing: 0.8px !important;
        z-index: 9999999 !important;
        pointer-events: none !important;
        text-shadow: 0 2px 4px rgba(0,0,0,0.9) !important;
        text-transform: uppercase !important;
        background: rgba(15, 23, 42, 0.6) !important;
        padding: 3px 10px !important;
        border-radius: 12px !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
    `;

    document.head.appendChild(style);
  }

  // Persistent credits text (Hidden during login screen)
  function injectAlwaysVisibleCredits() {
    if (document.getElementById('kartt-global-credit')) return;
    const credit = document.createElement('div');
    credit.id = 'kartt-global-credit';
    credit.className = 'kartt-credit-tag';
    credit.innerText = "Haxball Mobile By Kartt";

    function mountCredit() {
      if (document.body && !document.getElementById('kartt-global-credit')) {
        document.body.appendChild(credit);
      }
    }
    if (document.body) mountCredit();
    else window.addEventListener('DOMContentLoaded', mountCredit);
  }

  // Visibility manager for credits tag (Hides when on login screen)
  function updateCreditsVisibility() {
    const creditEl = document.getElementById('kartt-global-credit');
    if (!creditEl) return;

    const isLoginScreen = !!(document.querySelector('.nickname-view') || document.querySelector('[class*="nickname"]'));
    if (isLoginScreen) {
      creditEl.style.display = 'none';
    } else {
      creditEl.style.display = 'block';
    }
  }

  setInterval(updateCreditsVisibility, 300);

  // --- 3. VIXEL MOBILE SPOOFING ---
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

  // --- 4. MULTI-TARGET INPUT DISPATCHER ---
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

  function dispatchKeyAction(type, action) {
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

    let targetCode = userSettings.keyKick;
    if (action === 'Up') targetCode = userSettings.keyUp;
    if (action === 'Down') targetCode = userSettings.keyDown;
    if (action === 'Left') targetCode = userSettings.keyLeft;
    if (action === 'Right') targetCode = userSettings.keyRight;

    let keyChar = targetCode.replace('Key', '').replace('Digit', '');
    if (targetCode === 'Space') keyChar = ' ';
    if (targetCode.startsWith('Arrow')) keyChar = targetCode;

    targets.forEach(target => {
      if (!target) return;
      sendKeyEventToTarget(target, type, keyChar, targetCode, 0);
      if (action === 'Up') sendKeyEventToTarget(target, type, 'ArrowUp', 'ArrowUp', 38);
      if (action === 'Down') sendKeyEventToTarget(target, type, 'ArrowDown', 'ArrowDown', 40);
      if (action === 'Left') sendKeyEventToTarget(target, type, 'ArrowLeft', 'ArrowLeft', 37);
      if (action === 'Right') sendKeyEventToTarget(target, type, 'ArrowRight', 'ArrowRight', 39);
      if (action === 'Kick') sendKeyEventToTarget(target, type, ' ', 'Space', 32);
    });
  }

  function setMovementState(dir, isPressed) {
    const keyName = 'dir_' + dir;
    if (isPressed) {
      if (!activeKeys.has(keyName)) {
        activeKeys.add(keyName);
        dispatchKeyAction('keydown', dir);
      }
    } else {
      if (activeKeys.has(keyName)) {
        activeKeys.delete(keyName);
        dispatchKeyAction('keyup', dir);
      }
    }
  }

  // --- 5. VIRTUAL JOYSTICK & KICK BUTTON ---
  function createVirtualControls() {
    if (document.getElementById('hax-touch-controls')) return;

    const container = document.createElement('div');
    container.id = 'hax-touch-controls';
    container.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 999990;
      display: none;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    `;

    // Joystick Base
    const joystickBase = document.createElement('div');
    joystickBase.id = 'hax-joystick-base';
    joystickBase.style.cssText = `
      position: absolute;
      left: ${userSettings.joystickX}px;
      bottom: ${userSettings.joystickY}px;
      width: ${userSettings.joystickSize}px;
      height: ${userSettings.joystickSize}px;
      background: rgba(255, 255, 255, 0.2);
      border: 3px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      pointer-events: auto;
      touch-action: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    `;

    const knobSize = Math.round(userSettings.joystickSize * 0.4);
    const knobPos = Math.round((userSettings.joystickSize - knobSize) / 2);

    const joystickKnob = document.createElement('div');
    joystickKnob.id = 'hax-joystick-knob';
    joystickKnob.style.cssText = `
      width: ${knobSize}px;
      height: ${knobSize}px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 50%;
      position: absolute;
      top: ${knobPos}px;
      left: ${knobPos}px;
      pointer-events: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    `;
    joystickBase.appendChild(joystickKnob);

    // Kick Button
    const kickBtn = document.createElement('div');
    kickBtn.id = 'hax-kick-btn';
    kickBtn.style.cssText = `
      position: absolute;
      right: ${userSettings.kickX}px;
      bottom: ${userSettings.kickY}px;
      width: ${userSettings.kickSize}px;
      height: ${userSettings.kickSize}px;
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
      font-size: ${Math.round(userSettings.kickSize * 0.2)}px;
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
      if (!baseRect || modState.isHudEditMode) return;
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const dist = Math.hypot(dx, dy);
      const maxRadius = userSettings.joystickSize * 0.32;

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const defaultPos = (userSettings.joystickSize - (userSettings.joystickSize * 0.4)) / 2;
      const knobX = defaultPos + Math.cos(angle) * clampedDist;
      const knobY = defaultPos + Math.sin(angle) * clampedDist;

      joystickKnob.style.left = `${knobX}px`;
      joystickKnob.style.top = `${knobY}px`;

      const threshold = 8;
      setMovementState('Left', dx < -threshold);
      setMovementState('Right', dx > threshold);
      setMovementState('Up', dy < -threshold);
      setMovementState('Down', dy > threshold);
    }

    function resetJoystick() {
      activeTouchId = null;
      const defaultPos = (userSettings.joystickSize - (userSettings.joystickSize * 0.4)) / 2;
      joystickKnob.style.left = `${defaultPos}px`;
      joystickKnob.style.top = `${defaultPos}px`;

      setMovementState('Left', false);
      setMovementState('Right', false);
      setMovementState('Up', false);
      setMovementState('Down', false);
    }

    joystickBase.addEventListener('touchstart', (e) => {
      if (modState.isHudEditMode) return;
      e.preventDefault();
      const touch = e.changedTouches[0];
      activeTouchId = touch.identifier;
      baseRect = joystickBase.getBoundingClientRect();
      processJoystickMove(touch.clientX, touch.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (activeTouchId === null || modState.isHudEditMode) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          processJoystickMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    }, { passive: false });

    const endTouchHandler = (e) => {
      if (activeTouchId === null || modState.isHudEditMode) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          resetJoystick();
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouchHandler);
    window.addEventListener('touchcancel', endTouchHandler);

    const pressKick = (e) => {
      if (modState.isHudEditMode) return;
      if (e) e.preventDefault();
      setMovementState('Kick', true);
      kickBtn.style.transform = 'scale(0.92)';
      kickBtn.style.background = 'rgba(220, 38, 38, 0.95)';
    };

    const releaseKick = (e) => {
      if (modState.isHudEditMode) return;
      if (e) e.preventDefault();
      setMovementState('Kick', false);
      kickBtn.style.transform = 'scale(1)';
      kickBtn.style.background = 'rgba(239, 68, 68, 0.85)';
    };

    kickBtn.addEventListener('touchstart', pressKick, { passive: false });
    kickBtn.addEventListener('touchend', releaseKick, { passive: false });
    kickBtn.addEventListener('touchcancel', releaseKick, { passive: false });

    setupHudDrag(joystickBase, 'joystick');
    setupHudDrag(kickBtn, 'kick');
  }

  function setupHudDrag(element, type) {
    let isDragging = false;
    let startX, startY, origX, origY;

    element.addEventListener('touchstart', (e) => {
      if (!modState.isHudEditMode) return;
      e.preventDefault();
      isDragging = true;
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      origX = type === 'joystick' ? userSettings.joystickX : userSettings.kickX;
      origY = type === 'joystick' ? userSettings.joystickY : userSettings.kickY;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || !modState.isHudEditMode) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (type === 'joystick') {
        userSettings.joystickX = Math.max(0, origX + dx);
        userSettings.joystickY = Math.max(0, origY - dy);
        element.style.left = `${userSettings.joystickX}px`;
        element.style.bottom = `${userSettings.joystickY}px`;
      } else {
        userSettings.kickX = Math.max(0, origX - dx);
        userSettings.kickY = Math.max(0, origY - dy);
        element.style.right = `${userSettings.kickX}px`;
        element.style.bottom = `${userSettings.kickY}px`;
      }
    });

    const stopDrag = () => {
      if (isDragging) {
        isDragging = false;
        saveSettings(userSettings);
      }
    };

    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchcancel', stopDrag);
  }

  function updateHudVisibility() {
    const controls = document.getElementById('hax-touch-controls');
    if (!controls) return;

    const inRoom = !!(document.querySelector('.room-view') || document.querySelector('[class*="room-view"]') || document.querySelector('canvas'));
    const isLogin = !!(document.querySelector('.nickname-view') || document.querySelector('[class*="nickname"]'));
    const isRoomList = !!(document.querySelector('.roomlist-view') || document.querySelector('[class*="roomlist"]'));

    if (modState.isHudEditMode || (inRoom && !isLogin && !isRoomList)) {
      controls.style.display = 'block';
    } else {
      controls.style.display = 'none';
    }
  }

  setInterval(updateHudVisibility, 500);

  // --- 6. INJECT MOBILE HUD CONTROLS SETTINGS INTO HAXBALL'S SETTINGS > INPUT ---
  function injectHudIntoNativeSettings() {
    const settingsViews = document.querySelectorAll('.settings-view, [class*="settings-view"], [class*="input-tab"]');
    settingsViews.forEach(view => {
      if (view.querySelector('#hax-mobile-hud-panel')) return;

      const hudPanel = document.createElement('div');
      hudPanel.id = 'hax-mobile-hud-panel';
      hudPanel.style.cssText = `
        margin-top: 15px;
        padding: 12px;
        background: #14161d;
        border: 1px solid #333947;
        border-radius: 8px;
        color: #fff;
        font-family: system-ui, sans-serif;
      `;

      hudPanel.innerHTML = `
        <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #38bdf8;">📱 Mobile HUD & Touch Settings</h4>
        
        <button id="toggle-edit-hud-btn" style="
          width: 100%;
          background: #0284c7;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 12px;
          margin-bottom: 10px;
          cursor: pointer;
        ">Move HUD Buttons (Drag Mode)</button>

        <div style="display:flex; justify-space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; color:#cbd5e1;">Joystick Size</span>
          <input type="range" id="joystick-size-slider" min="80" max="180" value="${userSettings.joystickSize}" style="width:120px;" />
        </div>

        <div style="display:flex; justify-space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; color:#cbd5e1;">Kick Button Size</span>
          <input type="range" id="kick-size-slider" min="60" max="140" value="${userSettings.kickSize}" style="width:120px;" />
        </div>

        <div style="border-top:1px solid #2d3342; padding-top:8px; margin-top:8px;">
          <span style="font-size:12px; font-weight:bold; color:#cbd5e1; display:block; margin-bottom:6px;">⌨️ Key Overrides</span>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px;">
            <div>
              <span style="color:#a1a1aa;">Kick Key:</span>
              <input type="text" id="key-kick-input" value="${userSettings.keyKick}" style="width:100%; background:#1e222b; color:#fff; border:1px solid #333947; padding:4px; border-radius:4px;" />
            </div>
            <div>
              <span style="color:#a1a1aa;">Up Key:</span>
              <input type="text" id="key-up-input" value="${userSettings.keyUp}" style="width:100%; background:#1e222b; color:#fff; border:1px solid #333947; padding:4px; border-radius:4px;" />
            </div>
            <div>
              <span style="color:#a1a1aa;">Down Key:</span>
              <input type="text" id="key-down-input" value="${userSettings.keyDown}" style="width:100%; background:#1e222b; color:#fff; border:1px solid #333947; padding:4px; border-radius:4px;" />
            </div>
            <div>
              <span style="color:#a1a1aa;">Left Key:</span>
              <input type="text" id="key-left-input" value="${userSettings.keyLeft}" style="width:100%; background:#1e222b; color:#fff; border:1px solid #333947; padding:4px; border-radius:4px;" />
            </div>
            <div>
              <span style="color:#a1a1aa;">Right Key:</span>
              <input type="text" id="key-right-input" value="${userSettings.keyRight}" style="width:100%; background:#1e222b; color:#fff; border:1px solid #333947; padding:4px; border-radius:4px;" />
            </div>
          </div>
        </div>
      `;

      view.appendChild(hudPanel);

      const editBtn = hudPanel.querySelector('#toggle-edit-hud-btn');
      editBtn.onclick = () => {
        modState.isHudEditMode = !modState.isHudEditMode;
        editBtn.innerText = modState.isHudEditMode ? "Save Dragged Buttons" : "Move HUD Buttons (Drag Mode)";
        editBtn.style.background = modState.isHudEditMode ? "#22c55e" : "#0284c7";
        updateHudVisibility();
      };

      hudPanel.querySelector('#joystick-size-slider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        userSettings.joystickSize = val;
        const base = document.getElementById('hax-joystick-base');
        const knob = document.getElementById('hax-joystick-knob');
        if (base && knob) {
          base.style.width = `${val}px`;
          base.style.height = `${val}px`;
          const kSize = Math.round(val * 0.4);
          const kPos = Math.round((val - kSize) / 2);
          knob.style.width = `${kSize}px`;
          knob.style.height = `${kSize}px`;
          knob.style.left = `${kPos}px`;
          knob.style.top = `${kPos}px`;
        }
        saveSettings(userSettings);
      });

      hudPanel.querySelector('#kick-size-slider').addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        userSettings.kickSize = val;
        const btn = document.getElementById('hax-kick-btn');
        if (btn) {
          btn.style.width = `${val}px`;
          btn.style.height = `${val}px`;
          btn.style.fontSize = `${Math.round(val * 0.2)}px`;
        }
        saveSettings(userSettings);
      });

      const bindInput = (id, keyName) => {
        const el = hudPanel.querySelector('#' + id);
        if (el) {
          el.addEventListener('change', (e) => {
            userSettings[keyName] = e.target.value.trim();
            saveSettings(userSettings);
          });
        }
      };

      bindInput('key-kick-input', 'keyKick');
      bindInput('key-up-input', 'keyUp');
      bindInput('key-down-input', 'keyDown');
      bindInput('key-left-input', 'keyLeft');
      bindInput('key-right-input', 'keyRight');
    });
  }

  setInterval(injectHudIntoNativeSettings, 500);

  // --- 7. CLEAN /MOD MENU (IMAGE UPLOADS ONLY) ---
  function createModMenu() {
    if (document.getElementById('hax-mod-menu')) return;

    const menuHtml = `
      <div id="hax-mod-menu" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e222b;
        color: #fff;
        padding: 20px;
        border-radius: 14px;
        box-shadow: 0 10px 35px rgba(0,0,0,0.8);
        border: 1px solid #333947;
        font-family: system-ui, -apple-system, sans-serif;
        z-index: 9999999;
        display: none;
        width: 290px;
      ">
        <div style="display:flex; justify-space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid #2d3342; padding-bottom:8px;">
          <h3 style="margin:0; font-size:16px; color:#3b82f6;">🖼️ Custom Photo Customizer</h3>
          <span id="close-mod-menu" style="cursor:pointer; font-weight:bold; color:#94a3b8; font-size:20px;">✕</span>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display:block; font-size:12px; margin-bottom:6px; color:#cbd5e1; font-weight:bold;">⚽ Custom Ball Photo</label>
          <input type="file" id="ball-photo-input" accept="image/*" style="width: 100%; font-size:11px; background:#14161d; color:#fff; border:1px solid #333947; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 16px;">
          <label style="display:block; font-size:12px; margin-bottom:6px; color:#cbd5e1; font-weight:bold;">🏃 Custom Player Photo</label>
          <input type="file" id="player-photo-input" accept="image/*" style="width: 100%; font-size:11px; background:#14161d; color:#fff; border:1px solid #333947; padding:6px; border-radius:6px;" />
        </div>

        <button id="reset-textures-btn" style="
          width: 100%;
          background: #ef4444;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
        ">Reset Default Photos</button>
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

  // TOP-CENTER FLOATING MOD BUTTON
  function createMenuButton() {
    const btn = document.createElement('div');
    btn.innerText = "⚙️ MOD";
    btn.style.cssText = `
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(30, 34, 43, 0.9);
      color: #38bdf8;
      border: 1px solid #333947;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      z-index: 9999999;
      pointer-events: auto;
      font-family: sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      cursor: pointer;
    `;
    btn.onclick = toggleMenu;

    function mountBtn() {
      if (document.body) document.body.appendChild(btn);
    }
    if (document.body) mountBtn();
    else window.addEventListener('DOMContentLoaded', mountBtn);
  }

  // --- 8. CLEAN CANVAS RENDERING HOOK FOR PLAYER & BALL IMAGE OVERLAY ---
  function hookCanvasRendering() {
    const HTMLCanvasElementProto = HTMLCanvasElement.prototype;
    const originalGetContext = HTMLCanvasElementProto.getContext;

    HTMLCanvasElementProto.getContext = function (type, attributes) {
      const ctx = originalGetContext.call(this, type, attributes);

      if (ctx && !ctx.__isHooked) {
        ctx.__isHooked = true;
        const originalArc = ctx.arc;

        ctx.arc = function (x, y, radius, startAngle, endAngle, counterclockwise) {
          const result = originalArc.call(this, x, y, radius, startAngle, endAngle, counterclockwise);

          const isBall = radius >= 7 && radius <= 12;
          const isPlayer = radius >= 13 && radius <= 17;

          if (isBall && modState.ballImage) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(modState.ballImage, x - radius, y - radius, radius * 2, radius * 2);
            ctx.restore();
          }

          if (isPlayer && modState.defaultPlayerImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(modState.defaultPlayerImg, x - radius, y - radius, radius * 2, radius * 2);
            ctx.restore();
          }

          return result;
        };
      }
      return ctx;
    };
  }

  // Initialize all features
  injectMobileUIStyles();
  injectAlwaysVisibleCredits();
  hookCanvasRendering();
  createVirtualControls();
  createModMenu();
  createMenuButton();
})();
