// 모든 SQL 파일을 실행하는 마이그레이션 스크립트 (ES Module)
// 실행: node migrations/run-all-migrations.mjs

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Dump20251119 폴더 경로
const dumpDir = path.join(__dirname, '../../Dump20251119');

// Dump 폴더 존재 여부 확인
if (!fs.existsSync(dumpDir)) {
  console.error(`[오류] ${dumpDir} 폴더를 찾을 수 없습니다.`);
  process.exit(1);
}

const files = fs.readdirSync(dumpDir).filter(f => f.endsWith('.sql'));

if (files.length === 0) {
  console.log('[알림] Dump20251119 폴더에 .sql 파일이 없습니다.');
  process.exit(0);
}

const MYSQL_USER = process.env.DB_USER;
const MYSQL_PASS = process.env.DB_PASSWORD;
const MYSQL_DB = process.env.DB_NAME;
const MYSQL_HOST = process.env.DB_HOST || 'localhost';

if (!MYSQL_USER || !MYSQL_PASS || !MYSQL_DB) {
  console.error('[오류] .env 파일에 DB_USER, DB_PASSWORD, DB_NAME을 모두 입력하세요.');
  process.exit(1);
}

async function runMigration() {
  let connection;
  
  try {
    console.log('--- 마이그레이션 시작 ---');
    console.log(`총 ${files.length}개 파일 처리 예정`);
    
    // DB 연결
    connection = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASS,
      database: MYSQL_DB,
      multipleStatements: true,
    });
    console.log('✓ 데이터베이스 연결 성공');
    
    // 각 SQL 파일 실행
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dumpDir, file);
      console.log(`[${i + 1}/${files.length}] ${file} 실행 중...`);
      
      try {
        const sqlContent = fs.readFileSync(filePath, 'utf8');
        await connection.query(sqlContent);
        console.log(`✓ ${file} 완료`);
      } catch (err) {
        console.error(`✗ [오류] ${file} 실행 중 오류 발생`);
        console.error(err.message);
        // 에러가 발생해도 계속 진행
        console.log('→ 다음 파일로 계속 진행합니다...');
      }
    }
    
    console.log('--- 마이그레이션 완료 ---');
  } catch (error) {
    console.error('✗ [오류] 마이그레이션 실패:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
