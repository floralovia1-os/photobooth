/* ============================================================
   gallery.js — Logika Halaman Galeri
   ============================================================ */

let activeFilter = 'all';

/* ---------- Init ---------- */
window.addEventListener('DOMContentLoaded', () => {
  renderGallery();
});

/* ============================================================
   RENDER GALERI
   ============================================================ */
function renderGallery() {
  const grid  = document.getElementById('galleryGrid');
  const stats = document.getElementById('galleryStats');

  // Ambil data sesuai filter aktif
  let records = DB.getAll();
  if (activeFilter !== 'all') {
    records = records.filter(r => r.type === activeFilter);
  }

  // Update statistik
  const dbStats = DB.getStats();
  stats.textContent =
    ${dbStats.total} foto · ${dbStats.singles} tunggal · ${dbStats.strips} strip · ${dbStats.sizeKB} KB;

  // Kosong
  if (records.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty">
        <h3>Galeri Kosong</h3>
        <p style="font-size:0.85rem;color:var(--muted)">
          ${activeFilter === 'all'
            ? 'Belum ada foto tersimpan. Pergi ke Booth dan ambil foto!'
            : Belum ada foto ${activeFilter}.}
        </p>
      </div>`;
    return;
  }

  // Render items
  grid.innerHTML = '';
  records.forEach(record => {
    const item = buildGalleryItem(record);
    grid.appendChild(item);
  });
}

/* ---------- Build satu card ---------- */
function buildGalleryItem(record) {
  const item = document.createElement('div');
  item.className = 'gallery-item' + (record.type === 'strip' ? ' strip-thumb' : '');
  item.dataset.id = record.id;

  // Tanggal singkat
  const date = record.dateString
    ? record.dateString.slice(0, 16)
    : new Date(record.timestamp).toLocaleDateString('id-ID');

  item.innerHTML = `
    <img src="${record.data}"
         alt="Foto ${record.type}"
         onclick="openLightbox('${record.id}')">

    <div class="gallery-item-actions">
      <button class="icon-btn"
              onclick="downloadPhoto('${record.id}')"
              title="Unduh">⬇️</button>
      <button class="icon-btn danger"
              onclick="deletePhoto('${record.id}')"
              title="Hapus">🗑️</button>
    </div>

    <div class="gallery-item-info">
      <span class="gallery-item-date">${date}</span>
      <span class="gallery-item-type">
        ${record.type === 'strip' ? 'Strip' : record.filter || 'normal'}
      </span>
    </div>`;

  return item;
}

/* ============================================================
   FILTER (type)
   ============================================================ */
function filterGallery(type) {
  activeFilter = type;

  // Update tombol aktif
  ['all', 'single', 'strip'].forEach(t => {
    const btn = document.getElementById('f-' + t);
    if (btn) btn.classList.toggle('primary', t === type);
  });

  renderGallery();
}

/* ============================================================
   AKSI FOTO
   ============================================================ */
function downloadPhoto(id) {
  const record = DB.getById(id);
  if (!record) return;
  const link    = document.createElement('a');
  link.download = snapbooth_${record.type}_${id}.jpg;
  link.href     = record.data;
  link.click();
  showToast('⬇️ Foto diunduh!');
}

function deletePhoto(id) {
  if (!confirm('Hapus foto ini?')) return;
  DB.delete(id);
  renderGallery();
  showToast('🗑️ Foto dihapus.');
}

function clearGallery() {
  const count = DB.getAll().length;
  if (count === 0) { showToast('Galeri sudah kosong.'); return; }
  if (!confirm(Hapus semua ${count} foto dari galeri?)) return;
  DB.clear();
  renderGallery();
  showToast('🗑️ Galeri dikosongkan.');
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
function openLightbox(id) {
  const record = DB.getById(id);
  if (!record) return;

  document.getElementById('lightbox-img').src = record.data;
  document.getElementById('lightbox-info').textContent =
    ${record.type === 'strip' ? 'Strip' : 'Tunggal'} · Filter: ${record.filter} · ${record.dateString};
  document.getElementById('lightbox').classList.add('show');
}

function closeLightbox(e) {
  const lb = document.getElementById('lightbox');
  if (!e || e.target === lb || e.currentTarget?.id === 'lightbox-close') {
    lb.classList.remove('show');
    document.getElementById('lightbox-img').src = '';
  }
}

/* ============================================================
   TOAST (dibutuhkan di gallery.html)
   ============================================================ */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}