-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS caffeine_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE caffeine_app;

-- 회원 테이블
CREATE TABLE IF NOT EXISTS members (
  member_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  point INT DEFAULT 0,
  profile_photo LONGTEXT NULL COMMENT '프로필 사진 (base64 인코딩)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 회원 카페인 정보 테이블
CREATE TABLE IF NOT EXISTS members_caffeine (
  member_id INT PRIMARY KEY,
  age DATE NOT NULL COMMENT '생년월일',
  weight_kg DECIMAL(5,2) NOT NULL,
  gender ENUM('남자', '여자') NOT NULL,
  current_caffeine INT DEFAULT 0,
  max_caffeine INT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 브랜드 테이블
CREATE TABLE IF NOT EXISTS brand (
  brand_id INT AUTO_INCREMENT PRIMARY KEY,
  brand_name VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 메뉴 테이블
CREATE TABLE IF NOT EXISTS menu (
  menu_id INT AUTO_INCREMENT PRIMARY KEY,
  brand_id INT NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  category ENUM('coffee', 'decaf') NOT NULL,
  size ENUM('small', 'regular', 'large') NOT NULL,
  caffeine_mg INT NOT NULL,
  FOREIGN KEY (brand_id) REFERENCES brand(brand_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 카페인 섭취 기록 테이블
CREATE TABLE IF NOT EXISTS caffeine_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  menu_id INT NULL,
  brand_name VARCHAR(100) NOT NULL,
  menu_name VARCHAR(100) NOT NULL,
  caffeine_mg INT NOT NULL,
  drinked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menu(menu_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 친구 관계 테이블
CREATE TABLE IF NOT EXISTS friends (
  member_id INT NOT NULL,
  friend_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (member_id, friend_id),
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES members(member_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 친구 요청 테이블
CREATE TABLE IF NOT EXISTS friend_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  receiver_id INT NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES members(member_id) ON DELETE CASCADE,
  UNIQUE KEY unique_request (requester_id, receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 채팅방 테이블
CREATE TABLE IF NOT EXISTS chat_rooms (
  room_id INT AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 채팅방 참여자 테이블
CREATE TABLE IF NOT EXISTS room_participants (
  room_id INT NOT NULL,
  member_id INT NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, member_id),
  FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  sender_id INT NOT NULL,
  content TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES members(member_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 브랜드 데이터 삽입
INSERT IGNORE INTO brand (brand_id, brand_name) VALUES
(1, '메가'),
(2, '스타벅스'),
(3, '컴포즈'),
