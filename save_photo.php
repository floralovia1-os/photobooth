<?php
/* ============================================================
   save_photo.php — Simpan foto ke server & database MySQL
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once 'db_connect.php';

/* ---------- Validasi request ---------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Metode tidak diizinkan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['data'])) {
    echo json_encode(['success' => false, 'message' => 'Data foto tidak ditemukan']);
    exit;
}

/* ---------- Ambil & bersihkan input ---------- */
$type   = in_array($input['type'] ?? '', ['single','strip']) ? $input['type'] : 'single';
$filter = htmlspecialchars($input['filter'] ?? 'normal', ENT_QUOTES);
$frame  = htmlspecialchars($input['frame']  ?? 'none',   ENT_QUOTES);
$data   = $input['data'];   // base64 data URL

/* ---------- Decode base64 dan simpan file ---------- */
// Format: "data:image/jpeg;base64,XXXX..."
if (!preg_match('/^data:image\/(jpeg|png|webp);base64,/', $data, $match)) {
    echo json_encode(['success' => false, 'message' => 'Format gambar tidak valid']);
    exit;
}

$ext       = $match[1] === 'jpeg' ? 'jpg' : $match[1];
$base64    = preg_replace('/^data:image\/\w+;base64,/', '', $data);
$decoded   = base64_decode($base64);
$sizeKB    = (int) round(strlen($decoded) / 1024);

// Buat nama file unik
$filename  = 'photo_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$uploadDir = _DIR_ . '/../uploads/';
$filePath  = $uploadDir . $filename;

// Pastikan folder uploads ada
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Simpan file
if (file_put_contents($filePath, $decoded) === false) {
    echo json_encode(['success' => false, 'message' => 'Gagal menyimpan file']);
    exit;
}

/* ---------- Simpan ke database ---------- */
$stmt = $pdo->prepare(
    "INSERT INTO photos (type, filename, filter, frame, size_kb)
     VALUES (:type, :filename, :filter, :frame, :size_kb)"
);

$stmt->execute([
    ':type'     => $type,
    ':filename' => $filename,
    ':filter'   => $filter,
    ':frame'    => $frame,
    ':size_kb'  => $sizeKB,
]);

$newId = $pdo->lastInsertId();

echo json_encode([
    'success'  => true,
    'message'  => 'Foto berhasil disimpan',
    'id'       => $newId,
    'filename' => $filename,
    'size_kb'  => $sizeKB,
]);