/* ============================================================
   database.js — Database Module (localStorage)
   Menyimpan, membaca, menghapus foto dari localStorage
   ============================================================ */

const DB_KEY = 'snapbooth_db';

const DB = {

  /* ---------- CREATE ---------- */
  save(record) {
    const all = this.getAll();

    // Tambahkan metadata
    record.id         = 'photo_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    record.timestamp  = Date.now();
    record.dateString = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    // Hitung ukuran perkiraan (bytes)
    record.sizeKB = Math.round((record.data.length * 0.75) / 1024);

    // Simpan di awal array (terbaru di atas)
    all.unshift(record);

    try {
      localStorage.setItem(DB_KEY, JSON.stringify(all));
      return record;
    } catch (e) {
      // localStorage penuh
      console.error('Storage penuh:', e);
      showToast('⚠️ Penyimpanan penuh! Hapus beberapa foto.');
      return null;
    }
  },

  /* ---------- READ ALL ---------- */
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY)) || [];
    } catch {
      return [];
    }
  },

  /* ---------- READ SATU ---------- */
  getById(id) {
    return this.getAll().find(r => r.id === id) || null;
  },

  /* ---------- READ BY TYPE ---------- */
  getByType(type) {
    return this.getAll().filter(r => r.type === type);
  },

  /* ---------- DELETE ---------- */
  delete(id) {
    const filtered = this.getAll().filter(r => r.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
  },

  /* ---------- DELETE ALL ---------- */
  clear() {
    localStorage.removeItem(DB_KEY);
  },

  /* ---------- STATISTIK ---------- */
  getStats() {
    const all     = this.getAll();
    const singles = all.filter(r => r.type === 'single').length;
    const strips  = all.filter(r => r.type === 'strip').length;
    const raw     = localStorage.getItem(DB_KEY) || '';
    const sizeKB  = Math.round((raw.length * 2) / 1024);   // 2 bytes per char UTF-16

    return {
      total:   all.length,
      singles,
      strips,
      sizeKB,
      sizeMB:  (sizeKB / 1024).toFixed(2),
    };
  },

  /* ---------- EXPORT JSON ---------- */
  exportJSON() {
    const data = this.getAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'snapbooth_backup_' + Date.now() + '.json';
    link.click();
    URL.revokeObjectURL(url);
  },

  /* ---------- IMPORT JSON ---------- */
  importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = JSON.parse(e.target.result);
          if (!Array.isArray(data)) throw new Error('Format tidak valid');
          localStorage.setItem(DB_KEY, JSON.stringify(data));
          resolve(data.length);
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },
};