alert ("camera.js aktif");
async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = stream;

        console.log("Kamera aktif");

    } catch (error) {

        console.log(error);

        alert("Kamera tidak bisa diakses");
    }
}

/* ============================================================
   camera.js — Kamera, Capture, Strip, Timer
   ============================================================ */

let videoEl, canvasEl, ctx;
let currentMode   = 'single';
let timerSeconds  = 0;
let isCapturing   = false;
let stripPhotos   = [];
const STRIP_COUNT = 4;

/* ============================================================
   INIT
   ============================================================ */
window.addEventListener('DOMContentLoaded', () => {
  videoEl  = document.getElementById('video');
  canvasEl = document.getElementById('capture-canvas');
  ctx      = canvasEl.getContext('2d');
  startCamera();
});

/* ============================================================
   KAMERA
   ============================================================ */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false,
    });
    videoEl.srcObject = stream;
    videoEl.style.display = 'block';
    document.getElementById('no-camera').style.display = 'none';

    // Mulai loop preview filter
    requestAnimationFrame(drawFilterPreview);

  } catch (err) {
    console.warn('Kamera tidak tersedia:', err);
    document.getElementById('no-camera').style.display = 'flex';
  }
}

/* ============================================================
   MODE & TIMER SETTER
   ============================================================ */
function setMode(mode, btn) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn')
          .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const progress = document.getElementById('strip-progress');
  const captureBtn = document.getElementById('captureBtn');

  if (mode === 'strip') {
    progress.style.display = 'flex';
    stripPhotos = [];
    updateStripDots();
    hideStripResult();
    captureBtn.textContent = 📷 Mulai Strip (${STRIP_COUNT} Foto);
  } else {
    progress.style.display = 'none';
    hideStripResult();
    captureBtn.textContent = '📸 Ambil Foto';
  }
}

function setTimer(seconds, btn) {
  timerSeconds = seconds;
  document.querySelectorAll('.timer-opt')
          .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ============================================================
   CAPTURE UTAMA
   ============================================================ */
function startCapture() {
  if (isCapturing) return;
  if (!videoEl || !videoEl.srcObject) {
    showToast('⚠️ Aktifkan kamera terlebih dahulu!');
    return;
  }
  currentMode === 'strip' ? startStripCapture() : startSingleCapture();
}

/* ---------- Single ---------- */
function startSingleCapture() {
  if (timerSeconds === 0) {
    capturePhoto(true);
  } else {
    runCountdownAsync(timerSeconds).then(() => capturePhoto(true));
  }
}

/* ---------- Ambil 1 Frame ---------- */
function capturePhoto(saveToDb = true) {
  isCapturing = true;
  setBtnDisabled(true);

  // Flash
  flashEffect();

  // Draw ke canvas
  canvasEl.width  = videoEl.videoWidth  || 1280;
  canvasEl.height = videoEl.videoHeight || 960;
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(videoEl, -canvasEl.width, 0, canvasEl.width, canvasEl.height);
  ctx.restore();

  applyFilterToContext(ctx, canvasEl.width, canvasEl.height);
  drawFrameOverlay(ctx, canvasEl.width, canvasEl.height, 1);

  const dataUrl = canvasEl.toDataURL('image/jpeg', 0.92);

  if (saveToDb) {
    DB.save({ type: 'single', data: dataUrl, filter: currentFilter, frame: currentFrame });
    showToast('📸 Foto tersimpan!');
  }

  isCapturing = false;
  setBtnDisabled(false);
  return dataUrl;
}

/* ============================================================
   STRIP MODE
   ============================================================ */
async function startStripCapture() {
  isCapturing = true;
  setBtnDisabled(true);
  stripPhotos = [];
  updateStripDots();
  hideStripResult();

  for (let i = 0; i < STRIP_COUNT; i++) {
    // Hitung mundur: timer user untuk foto pertama, 3s untuk sisanya
    const countdown = i === 0 ? timerSeconds : 3;
    if (countdown > 0) await runCountdownAsync(countdown);

    const photo = capturePhoto(false);   // jangan simpan satu-satu
    stripPhotos.push(photo);
    updateStripDots();
    await sleep(400);
  }

  isCapturing = false;
  setBtnDisabled(false);
  showStripResult();
}

function updateStripDots() {
  for (let i = 0; i < STRIP_COUNT; i++) {
    const dot = document.getElementById('dot-' + i);
    if (dot) dot.className = 'strip-dot' + (i < stripPhotos.length ? ' filled' : '');
  }
}

function showStripResult() {
  const container = document.getElementById('stripPhotos');
  container.innerHTML = '';
  stripPhotos.forEach(src => {
    const img = document.createElement('img');
    img.src       = src;
    img.className = 'strip-photo-item';
    container.appendChild(img);
  });

  document.getElementById('stripDate').textContent =
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  const result = document.getElementById('strip-result');
  result.classList.add('show');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideStripResult() {
  document.getElementById('strip-result').classList.remove('show');
}

function retakeStrip() {
  stripPhotos = [];
  updateStripDots();
  hideStripResult();
}

/* ---------- Simpan strip ke DB ---------- */
async function saveStrip() {
  const img = await renderStripToImage();
  DB.save({ type: 'strip', data: img, filter: currentFilter, frame: currentFrame });
  showToast('🎞️ Strip tersimpan ke galeri!');
}

/* ---------- Unduh strip ---------- */
async function downloadStrip() {
  const img  = await renderStripToImage();
  const link = document.createElement('a');
  link.download = 'snapbooth_strip_' + Date.now() + '.jpg';
  link.href = img;
  link.click();
  showToast('⬇️ Strip diunduh!');
}

/* ---------- Render strip ke satu gambar ---------- */
async function renderStripToImage() {
  const W      = 400;
  const photoH = Math.round(W * 0.75);
  const gap    = 8;
  const headerH = 60;
  const footerH = 40;
  const totalH = headerH + stripPhotos.length * (photoH + gap) + footerH;

  const sc   = document.createElement('canvas');
  sc.width   = W;
  sc.height  = totalH;
  const sctx = sc.getContext('2d');

  // Latar film
  sctx.fillStyle = '#E8D5B0';
  sctx.fillRect(0, 0, W, totalH);

  // Strip bar atas & bawah
  sctx.fillStyle = '#C9B79A';
  sctx.fillRect(0, 0, W, 22);
  sctx.fillRect(0, totalH - 22, W, 22);

  // Sprocket holes
  sctx.fillStyle = '#2E2416';
  for (let i = 0; i < 7; i++) {
    const x = 16 + i * 54;
    sctx.beginPath();
    if (sctx.roundRect) {
      sctx.roundRect(x, 4,  38, 14, 2);
      sctx.roundRect(x, totalH - 18, 38, 14, 2);
    } else {
      sctx.rect(x, 4, 38, 14);
      sctx.rect(x, totalH - 18, 38, 14);
    }
    sctx.fill();
  }

  // Judul
  sctx.fillStyle   = '#2E2416';
  sctx.font        = 'bold 18px serif';
  sctx.textAlign   = 'center';
  sctx.fillText('✦ SnapBooth ✦', W / 2, 46);

  // Foto
  let y = headerH;
  for (const src of stripPhotos) {
    await new Promise(res => {
      const img  = new Image();
      img.onload = () => { sctx.drawImage(img, 12, y, W - 24, photoH); res(); };
      img.src    = src;
    });
    y += photoH + gap;
  }

  // Tanggal
  sctx.fillStyle  = '#7A6A50';
  sctx.font       = '13px sans-serif';
  sctx.textAlign  = 'center';
  sctx.fillText(
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    W / 2, totalH - 28
  );

  return sc.toDataURL('image/jpeg', 0.92);
}

/* ============================================================
   COUNTDOWN
   ============================================================ */
function runCountdownAsync(seconds) {
  if (!seconds || seconds <= 0) return Promise.resolve();
  return new Promise(resolve => {
    const el = document.getElementById('countdown');
    let t = seconds;
    el.textContent = t;
    el.classList.add('show');
    const timer = setInterval(() => {
      t--;
      if (t <= 0) {
        clearInterval(timer);
        el.classList.remove('show');
        resolve();
      } else {
        el.textContent = t;
      }
    }, 1000);
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
function flashEffect() {
  const flash = document.getElementById('flash');
  flash.classList.add('show');
  setTimeout(() => flash.classList.remove('show'), 120);
}

function setBtnDisabled(state) {
  const btn = document.getElementById('captureBtn');
  if (btn) btn.disabled = state;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}
