-- 커스텀 음료 테이블 생성
CREATE TABLE IF NOT EXISTS custom_menu (
  custom_menu_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  caffeine_mg INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  INDEX idx_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
