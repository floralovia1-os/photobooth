<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Galeri — SnapBooth</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<header>
  <h1>Snap<span>Booth</span></h1>
  <p>Photobooth Online &bull; Capture Your Moments</p>
</header>

<nav>
  <button onclick="window.location.href='index.php'">📷 Booth</button>
  <button class="active">🖼️ Galeri</button>
</nav>

<main>

  <!-- Header Galeri -->
  <div class="gallery-header">
    <div>
      <h2 class="gallery-title">Galeri Foto</h2>
      <div class="gallery-stats" id="galleryStats">Memuat...</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="action-btn" onclick="filterGallery('all')" id="f-all">Semua</button>
      <button class="action-btn" onclick="filterGallery('single')" id="f-single">Tunggal</button>
      <button class="action-btn" onclick="filterGallery('strip')" id="f-strip">Strip</button>
      <button class="action-btn danger" onclick="clearGallery()">🗑️ Hapus Semua</button>
    </div>
  </div>

  <!-- Grid Galeri -->
  <div class="gallery-grid" id="galleryGrid">
    <p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:3rem;">
      Memuat foto...
    </p>
  </div>

</main>

<!-- Lightbox -->
<div id="lightbox" onclick="closeLightbox(event)">
  <button id="lightbox-close" onclick="closeLightbox()">✕</button>
  <div id="lightbox-inner">
    <img id="lightbox-img" src="" alt="Preview">
    <div id="lightbox-info"></div>
  </div>
</div>

<div id="toast"></div>

<script src="js/database.js"></script>
<script src="js/gallery.js"></script>

</body>
</html>