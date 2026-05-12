-- ============================================================
-- SNAPBOOTH — Struktur Database MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS snapbooth_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE snapbooth_db;

-- Tabel utama foto
CREATE TABLE IF NOT EXISTS photos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('single','strip') NOT NULL DEFAULT 'single',
  filename    VARCHAR(255)           NOT NULL,
  filter      VARCHAR(20)            NOT NULL DEFAULT 'normal',
  frame       VARCHAR(20)            NOT NULL DEFAULT 'none',
  size_kb     INT                    DEFAULT 0,
  created_at  DATETIME               DEFAULT CURRENT_TIMESTAMP
);

-- Tabel pengaturan aplikasi
CREATE TABLE IF NOT EXISTS settings (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(50)  UNIQUE NOT NULL,
  value       VARCHAR(255) NOT NULL,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data default pengaturan
INSERT IGNORE INTO settings (setting_key, value) VALUES
  ('app_name',    'SnapBooth'),
  ('max_photos',  '500'),
  ('timer_default', '3'),
  ('filter_default', 'normal');

-- Index untuk performa query
CREATE INDEX idx_created_at ON photos(created_at);
CREATE INDEX idx_type       ON photos(type);