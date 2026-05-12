<?php
/* ============================================================
   delete_photo.php — Hapus foto dari server & database MySQL
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST');

require_once 'db_connect.php';

/* ---------- Validasi metode ---------- */
if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan']);
    exit;
}

/* ---------- Ambil ID ---------- */
$input = json_decode(file_get_contents('php://input'), true);
$id    = (int)($input['id'] ?? $_POST['id'] ?? 0);

if ($id <= 0) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit;
}

/* ---------- Cari record di database ---------- */
$stmt = $pdo->prepare("SELECT filename FROM photos WHERE id = :id");
$stmt->execute([':id' => $id]);
$record = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$record) {
    echo json_encode(['success' => false, 'message' => 'Foto tidak ditemukan']);
    exit;
}

/* ---------- Hapus file dari server ---------- */
$filePath = _DIR_ . '/../uploads/' . $record['filename'];
if (file_exists($filePath)) {
    unlink($filePath);
}

/* ---------- Hapus dari database ---------- */
$del = $pdo->prepare("DELETE FROM photos WHERE id = :id");
$del->execute([':id' => $id]);

echo json_encode([
    'success'  => true,
    'message'  => 'Foto berhasil dihapus',
    'deleted_id' => $id,
]);