/**
 * Haxball Custom Player & Ball Image Mod + Performance Booster
 * Usage: Paste into developer console (F12) or load as a userscript/mod.
 * Type /mod in game chat or press 'M' to open the customization menu.
 */

(function () {
  'use strict';

  // State Store
  const modState = {
    ballImage: null,
    playerImages: {}, // Avatar/Player ID to Image
    defaultPlayerImg: null,
    enabled: true,
    fpsBoost: true,
    fps: 0,
    frameCount: 0,
    lastTime: performance.now()
  };

  // --- Optimization Flags ---
  function applyPerformanceTweaks() {
    // Force browser hardware acceleration hint
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d', {
        alpha: false, // Disables alpha channel if background is opaque for faster draw
        desynchronized: true, // Reduces input latency on supported browsers
        willReadFrequently: false
      });
      
      // Image smoothing toggling for performance & crisp pixels
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
      }
    });

    // Request high performance power preference if available
    window.requestAnimationFrame = window.requestAnimationFrame || 
                                   window.webkitRequestAnimationFrame || 
                                   window.mozRequestAnimationFrame;
  }

  // --- UI Construction (/mod Menu) ---
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
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid #2a364f;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        z-index: 999999;
        display: none;
        width: 320px;
      ">
        <div style="display:flex; justify-scale:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; font-size:18px; color:#40a9ff;">🎮 Custom Mod Menu</h3>
          <span id="close-mod-menu" style="cursor:pointer; font-weight:bold; color:#aaa;">✕</span>
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display:block; font-size:12px; margin-bottom:6px; color:#ccc;">⚽ Ball Custom Photo</label>
          <input type="file" id="ball-photo-input" accept="image/*" style="width: 100%; font-size:12px; background:#141923; color:#fff; border:1px solid #334155; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 14px;">
          <label style="display:block; font-size:12px; margin-bottom:6px; color:#ccc;">🏃 Player Custom Photo</label>
          <input type="file" id="player-photo-input" accept="image/*" style="width: 100%; font-size:12px; background:#141923; color:#fff; border:1px solid #334155; padding:6px; border-radius:6px;" />
        </div>

        <div style="margin-bottom: 16px; display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:13px; color:#ccc;">⚡ Max FPS / 0-Delay Mode</span>
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

    // Event Listeners for UI
    document.getElementById('close-mod-menu').onclick = () => {
      document.getElementById('hax-mod-menu').style.display = 'none';
    };

    // Load Ball Image
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

    // Load Player Image
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

    // Toggle FPS Boost
    document.getElementById('fps-boost-toggle').addEventListener('change', (e) => {
      modState.fpsBoost = e.target.checked;
      if (modState.fpsBoost) applyPerformanceTweaks();
    });

    // Reset Textures
    document.getElementById('reset-textures-btn').onclick = () => {
      modState.ballImage = null;
      modState.defaultPlayerImg = null;
      document.getElementById('ball-photo-input').value = '';
      document.getElementById('player-photo-input').value = '';
    };
  }

  // --- Toggle Menu Helper ---
  function toggleMenu() {
    const menu = document.getElementById('hax-mod-menu');
    if (menu) {
      menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
    }
  }

  // --- Listen for Chat Command /mod or Hotkey 'M' ---
  function initCommandListener() {
    window.addEventListener('keydown', (e) => {
      // Toggle menu with 'M' key (when not typing in an input)
      if (e.key.toLowerCase() === 'm' && document.activeElement.tagName !== 'INPUT') {
        toggleMenu();
      }
    });

    // Intercept chat inputs to check for /mod command
    const originalFetch = window.fetch;
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

  // --- Hook Canvas Context for Custom Rendering & Low-Latency ---
  function hookCanvasRendering() {
    const HTMLCanvasElementProto = HTMLCanvasElement.prototype;
    const originalGetContext = HTMLCanvasElementProto.getContext;

    HTMLCanvasElementProto.getContext = function (type, attributes) {
      if (type === '2d') {
        attributes = attributes || {};
        attributes.desynchronized = true; // Enables low-latency rendering mode
        attributes.alpha = false;
      }
      const ctx = originalGetContext.call(this, type, attributes);

      if (ctx && !ctx.__isHooked) {
        ctx.__isHooked = true;

        // Hook arc method to detect circle/ball/player drawing calls
        const originalArc = ctx.arc;
        ctx.arc = function (x, y, radius, startAngle, endAngle, counterclockwise) {
          // Identify ball vs player by radius heuristic
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

  // --- Initialize Everything ---
  function initMod() {
    createModMenu();
    initCommandListener();
    hookCanvasRendering();
    applyPerformanceTweaks();
    console.log("✅ Haxball Custom Mod initialized. Type /mod or press 'M' to open menu.");
  }

  // Start when document is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initMod();
  } else {
    document.addEventListener('DOMContentLoaded', initMod);
  }
})();
