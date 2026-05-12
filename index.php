<?php
  include 'php/db_connect.php';
?>

<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapBooth — Photobooth Online</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>
  <h1>Snap<span>Booth</span></h1>
  <p>Photobooth Online &bull; Capture Your Moments</p>
</header>

<nav>
  <button class="active" onclick="showPage('booth')">📷 Booth</button>
  <button onclick="window.location.href='gallery.php'">🖼️ Galeri</button>
</nav>

<main>
  <div class="booth-layout">

    <!-- Kiri: Kamera -->
    <div>
      <div class="camera-wrap">
        <video id="video" autoplay playsinline ></video>
        <canvas id="filter-canvas"></canvas>
        <div class="camera-overlay"></div>
        <div id="countdown"></div>
        <div id="flash"></div>
        <div id="no-camera">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8
                     a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <p>Kamera tidak aktif</p>
          <button onclick="startCamera()">Aktifkan Kamera</button>
        </div>
      </div>

      <!-- Indikator strip -->
      <div class="strip-progress" id="strip-progress" style="display:none">
        <div class="strip-dot" id="dot-0"></div>
        <div class="strip-dot" id="dot-1"></div>
        <div class="strip-dot" id="dot-2"></div>
        <div class="strip-dot" id="dot-3"></div>
      </div>
    </div>

    <!-- Kanan: Kontrol -->
    <div class="controls-panel">

      <!-- Mode -->
      <div class="panel-card">
        <div class="panel-title">Mode Foto</div>
        <div class="mode-toggle">
          <button class="mode-btn active" onclick="setMode('single', this)">📷 Tunggal</button>
          <button class="mode-btn" onclick="setMode('strip', this)">🎞️ Strip</button>
        </div>
      </div>

      <!-- Timer -->
      <div class="panel-card">
        <div class="panel-title">Timer Hitung Mundur</div>
        <div class="timer-opts">
          <button class="timer-opt active" onclick="setTimer(0, this)">0s</button>
          <button class="timer-opt" onclick="setTimer(3, this)">3s</button>
          <button class="timer-opt" onclick="setTimer(5, this)">5s</button>
          <button class="timer-opt" onclick="setTimer(10, this)">10s</button>
        </div>
      </div>

      <!-- Filter -->
      <div class="panel-card">
        <div class="panel-title">Filter</div>
        <div class="filter-grid">
          <button class="filter-btn active" onclick="setFilter('normal', this)">
            <div class="filter-preview fp-normal"></div>
            <span>Normal</span>
          </button>
          <button class="filter-btn" onclick="setFilter('grayscale', this)">
            <div class="filter-preview fp-grayscale"></div>
            <span>B&W</span>
          </button>
          <button class="filter-btn" onclick="setFilter('sepia', this)">
            <div class="filter-preview fp-sepia"></div>
            <span>Sepia</span>
          </button>
          <button class="filter-btn" onclick="setFilter('vivid', this)">
            <div class="filter-preview fp-vivid"></div>
            <span>Vivid</span>
          </button>
          <button class="filter-btn" onclick="setFilter('cool', this)">
            <div class="filter-preview fp-cool"></div>
            <span>Cool</span>
          </button>
          <button class="filter-btn" onclick="setFilter('warm', this)">
            <div class="filter-preview fp-warm"></div>
            <span>Warm</span>
          </button>
        </div>
      </div>

      <!-- Frame -->
      <div class="panel-card">
        <div class="panel-title">Bingkai</div>
        <div class="frame-grid">
          <button class="frame-btn active" onclick="setFrame('none', this)">
            <span class="frame-icon">✕</span><span>Tanpa</span>
          </button>
          <button class="frame-btn" onclick="setFrame('classic', this)">
            <span class="frame-icon">🌟</span><span>Klasik</span>
          </button>
          <button class="frame-btn" onclick="setFrame('heart', this)">
            <span class="frame-icon">💕</span><span>Hati</span>
          </button>
          <button class="frame-btn" onclick="setFrame('stars', this)">
            <span class="frame-icon">⭐</span><span>Bintang</span>
          </button>
          <button class="frame-btn" onclick="setFrame('flowers', this)">
            <span class="frame-icon">🌸</span><span>Bunga</span>
          </button>
          <button class="frame-btn" onclick="setFrame('retro', this)">
            <span class="frame-icon">📽️</span><span>Retro</span>
          </button>
        </div>
      </div>

      <!-- Tombol Ambil Foto -->
      <button class="capture-btn" id="captureBtn" onclick="startCapture()">
        📸 Ambil Foto
      </button>

    </div>
  </div>

  <!-- Hasil Strip -->
  <div id="strip-result">
    <h3>Strip Selesai!</h3>
    <div class="strip-container" id="stripContainer">
      <div class="filmstrip-edge">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
      <div class="strip-header">✦ SnapBooth ✦</div>
      <div class="strip-photos" id="stripPhotos"></div>
      <div class="strip-footer" id="stripDate"></div>
      <div class="filmstrip-edge">
        <span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span>
      </div>
    </div>
    <div class="strip-actions">
      <button class="action-btn" onclick="retakeStrip()">🔄 Ulangi</button>
      <button class="action-btn primary" onclick="saveStrip()">💾 Simpan</button>
      <button class="action-btn primary" onclick="downloadStrip()">⬇️ Unduh</button>
    </div>
  </div>
</main>

<div id="toast"></div>
<canvas id="capture-canvas" style="display:none"></canvas>

<!-- Load JavaScript -->
<script src="js/filters.js"></script>
<script src="js/camera.js"></script>
<script src="js/database.js"></script>

</body>
</html>