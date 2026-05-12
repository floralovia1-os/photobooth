<?php
/* ============================================================
   db_connect.php — Koneksi ke MySQL menggunakan PDO
   !! Ubah kredensial sesuai server Anda !!
   ============================================================ */

define('DB_HOST', 'localhost');
define('DB_NAME', 'snapbooth_db');
define('DB_USER', 'root');          // Ganti dengan user MySQL Anda
define('DB_PASS', '');              // Ganti dengan password MySQL Anda
define('DB_PORT', '3306');
define('DB_CHARSET', 'utf8mb4');

$dsn = sprintf(
    'mysql:host=%s;port=%s;dbname=%s;charset=%s',
    DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
);

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $e->getMessage(),
    ]);
    exit;
}