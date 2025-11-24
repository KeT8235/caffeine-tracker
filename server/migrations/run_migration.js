// WSL/리눅스 환경에서 실행 가능한 add_profile_photo.sql 마이그레이션 스크립트 (ESM)
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WSL 환경에서는 .env 경로를 상위 폴더로 지정하는 것이 일반적
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
  let connection;
  try {
    // DB 연결
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'caffeine_app',
      multipleStatements: true,
    });
    console.log('✓ [WSL] Connected to database');

    // SQL 파일 읽기 (경로 슬래시 변환)
    const sqlPath = path.join(__dirname, 'add_profile_photo.sql').replace(/\\/g, '/');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // SQL 실행
    await connection.query(sql);
    console.log('✓ [WSL] Migration completed successfully!');
  } catch (error) {
    console.error('✗ [WSL] Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runMigration();
