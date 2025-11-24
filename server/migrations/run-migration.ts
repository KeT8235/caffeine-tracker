import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runMigration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'caffeine_app',
    });

    console.log('✓ Connected to database');

    // Check if column already exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM members LIKE 'profile_photo'"
    );

    if ((columns as any[]).length > 0) {
      console.log('⚠ profile_photo column already exists. Skipping migration.');
      return;
    }

    // Run migration
    console.log('→ Adding profile_photo column...');
    await connection.query(
      "ALTER TABLE members ADD COLUMN profile_photo LONGTEXT NULL COMMENT '프로필 사진 (base64 인코딩)'"
    );

    console.log('✓ Migration completed successfully!');
    console.log('✓ profile_photo column has been added to members table');
    console.log('\n🎉 Please restart your server to use the new feature.');

  } catch (error: any) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
