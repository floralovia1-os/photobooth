/* ============================================================
   filters.js — Filter & Frame Logic
   ============================================================ */

let currentFilter = 'normal';
let currentFrame  = 'none';

/* ---------- Filter Setter ---------- */
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn')
          .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ---------- Frame Setter ---------- */
function setFrame(frame, btn) {
  currentFrame = frame;
  document.querySelectorAll('.frame-btn')
          .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ---------- Apply Filter to Canvas Context ---------- */
function applyFilterToContext(fctx, w, h) {
  if (currentFilter === 'normal') return;

  const imgData = fctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i], g = d[i + 1], b = d[i + 2];

    switch (currentFilter) {

      case 'grayscale': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = d[i+1] = d[i+2] = gray;
        break;
      }

      case 'sepia': {
        d[i]   = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        d[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        d[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        break;
      }

      case 'vivid': {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i]   = Math.min(255, gray + (r - gray) * 1.8);
        d[i+1] = Math.min(255, gray + (g - gray) * 1.8);
        d[i+2] = Math.min(255, gray + (b - gray) * 1.8);
        break;
      }

      case 'cool': {
        d[i]   = Math.max(0,   r - 20);
        d[i+1] = Math.min(255, g + 10);
        d[i+2] = Math.min(255, b + 40);
        break;
      }

      case 'warm': {
        d[i]   = Math.min(255, r + 40);
        d[i+1] = Math.min(255, g + 15);
        d[i+2] = Math.max(0,   b - 20);
        break;
      }
    }
  }

  fctx.putImageData(imgData, 0, 0);
}

/* ---------- Draw Frame Overlay ---------- */
function drawFrameOverlay(fctx, w, h, opacity = 1) {
  if (currentFrame === 'none') return;

  fctx.save();
  fctx.globalAlpha = opacity;

  const frames = {

    classic() {
      fctx.strokeStyle = '#C9962A';
      fctx.lineWidth = w * 0.025;
      fctx.strokeRect(w * 0.03, h * 0.03, w * 0.94, h * 0.94);
      fctx.lineWidth = w * 0.008;
      fctx.strokeRect(w * 0.055, h * 0.055, w * 0.89, h * 0.89);
    },

    heart() {
      const emojis = ['💕', '💖', '💗', '💝'];
      fctx.font = ${w * 0.07}px serif;
      const pos = [
        [w * 0.04, h * 0.1],
        [w * 0.85, h * 0.1],
        [w * 0.04, h * 0.93],
        [w * 0.85, h * 0.93],
      ];
      pos.forEach(([x, y], i) => fctx.fillText(emojis[i], x, y));
    },

    stars() {
      fctx.font = ${w * 0.055}px serif;
      const s = ['⭐', '✨', '🌟', '💫'];
      for (let i = 0; i < 8; i++) {
        const x = (i % 4) * (w / 4) + w / 8 - w * 0.03;
        const y = i < 4 ? h * 0.07 : h * 0.96;
        fctx.fillText(s[i % 4], x, y);
      }
    },

    flowers() {
      fctx.font = ${w * 0.065}px serif;
      const f = ['🌸', '🌺', '🌷', '🌻'];
      [
        [w * 0.04, h * 0.1],
        [w * 0.85, h * 0.1],
        [w * 0.04, h * 0.93],
        [w * 0.85, h * 0.93],
      ].forEach(([x, y], i) => fctx.fillText(f[i], x, y));
    },

    retro() {
      // Film strip top & bottom bars
      fctx.fillStyle = 'rgba(0,0,0,0.72)';
      fctx.fillRect(0, 0, w, h * 0.06);
      fctx.fillRect(0, h * 0.94, w, h * 0.06);

      // Sprocket holes
      fctx.fillStyle = 'rgba(255,255,255,0.28)';
      for (let i = 0; i < 8; i++) {
        const x = w * 0.04 + i * (w * 0.12);
        fctx.beginPath();
        if (fctx.roundRect) {
          fctx.roundRect(x, h * 0.008, w * 0.07, h * 0.04, 2);
          fctx.roundRect(x, h * 0.952, w * 0.07, h * 0.04, 2);
        } else {
          fctx.rect(x, h * 0.008, w * 0.07, h * 0.04);
          fctx.rect(x, h * 0.952, w * 0.07, h * 0.04);
        }
        fctx.fill();
      }

      // Label
      fctx.fillStyle = '#C9962A';
      fctx.font = bold ${w * 0.028}px 'DM Sans', sans-serif;
      fctx.textAlign = 'center';
      fctx.fillText('✦ SnapBooth ✦', w / 2, h * 0.043);
      fctx.textAlign = 'left';
    },
  };

  if (frames[currentFrame]) frames[currentFrame]();
  fctx.restore();
}

/* ---------- Live Filter Preview on Canvas ---------- */
function drawFilterPreview() {
  const video = document.getElementById('video');
  const fc    = document.getElementById('filter-canvas');
  if (!video || !video.videoWidth) {
    requestAnimationFrame(drawFilterPreview);
    return;
  }

  fc.width  = video.videoWidth;
  fc.height = video.videoHeight;
  fc.style.display = 'block';

  const fctx = fc.getContext('2d');
  // Mirror (selfie view)
  fctx.save();
  fctx.scale(-1, 1);
  fctx.drawImage(video, -fc.width, 0, fc.width, fc.height);
  fctx.restore();

  applyFilterToContext(fctx, fc.width, fc.height);
  drawFrameOverlay(fctx, fc.width, fc.height, 0.45);

  requestAnimationFrame(drawFilterPreview);
  }
