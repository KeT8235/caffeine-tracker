-- Add profile_photo column to members table
USE caffeine_app;

ALTER TABLE members 
ADD COLUMN profile_photo LONGTEXT NULL COMMENT '프로필 사진 (base64 인코딩)';
