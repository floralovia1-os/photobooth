<?php
/* ============================================================
   get_photos.php — Ambil daftar foto dari database MySQL
   ============================================================ */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db_connect.php';

/* ---------- Parameter query ---------- */
$type  = $_GET['type']  ?? 'all';    // 'all' | 'single' | 'strip'
$page  = max(1, (int)($_GET['page']  ?? 1));
$limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

/* ---------- Bangun query ---------- */
$where  = '';
$params = [];

if ($type !== 'all' && in_array($type, ['single','strip'])) {
    $where    = 'WHERE type = :type';
    $params[':type'] = $type;
}

// Hitung total
$countSQL  = "SELECT COUNT(*) FROM photos $where";
$countStmt = $pdo->prepare($countSQL);
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

// Ambil data
$params[':limit']  = $limit;
$params[':offset'] = $offset;

$stmt = $pdo->prepare(
    "SELECT id, type, filename, filter, frame, size_kb, created_at
     FROM photos $where
     ORDER BY created_at DESC
     LIMIT :limit OFFSET :offset"
);

// Bind integer secara eksplisit agar LIMIT/OFFSET tidak dikutip
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
if (!empty($params[':type'])) {
    $stmt->bindValue(':type', $params[':type']);
}

$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

/* ---------- Tambahkan URL gambar ---------- */
$baseUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http')
         . '://' . $_SERVER['HTTP_HOST']
         . dirname(dirname($_SERVER['REQUEST_URI']))
         . '/uploads/';

foreach ($rows as &$row) {
    $row['url'] = $baseUrl . $row['filename'];
    // Format tanggal
    $row['date_formatted'] = date('d M Y, H:i', strtotime($row['created_at']));
}

/* ---------- Response ---------- */
echo json_encode([
    'success' => true,
    'data'    => $rows,
    'meta'    => [
        'total'       => $total,
        'page'        => $page,
        'limit'       => $limit,
        'total_pages' => (int) ceil($total / $limit),
    ],
]);