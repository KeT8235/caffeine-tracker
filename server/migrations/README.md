# 마이그레이션 실행 방법

## ✅ 권장: 자동 마이그레이션 스크립트 사용

### 모든 SQL 파일 실행 (Dump20251119)
```bash
cd server
npm run migrate-all
```

이 명령은 `Dump20251119` 폴더의 모든 `.sql` 파일을 자동으로 실행합니다.

### 단일 마이그레이션 실행
```bash
cd server
npm run migrate
```

---

## 문제 해결

### `require is not defined` 오류
- ✅ **해결됨**: 새로운 `run-all-migrations.mjs` 파일을 사용하세요
- 이전 `.cjs` 파일들은 더 이상 사용되지 않습니다
- `npm run migrate-all` 명령을 사용하세요

---

# 개별 마이그레이션 실행 방법

## 002_add_custom_menu_unique_constraint.sql

### 방법 1: MySQL Workbench 사용
1. MySQL Workbench를 엽니다
2. caffeine_app 데이터베이스에 연결합니다
3. `002_add_custom_menu_unique_constraint.sql` 파일을 열거나 내용을 복사합니다
4. 실행 버튼을 클릭합니다

### 방법 2: 명령줄 (MySQL이 PATH에 있는 경우)
```bash
mysql -u root -p caffeine_app < 002_add_custom_menu_unique_constraint.sql
```

### 방법 3: 직접 SQL 실행
MySQL 클라이언트에서 다음 명령을 실행:

```sql
USE caffeine_app;
ALTER TABLE custom_menu
ADD CONSTRAINT uniq_member_menu UNIQUE KEY (member_id, menu_name);
```

---

# 프로필 사진 마이그레이션 실행 방법

## 방법 1: MySQL Workbench 사용
1. MySQL Workbench를 엽니다
2. caffeine_app 데이터베이스에 연결합니다
3. `add_profile_photo.sql` 파일을 열거나 내용을 복사합니다
4. 실행 버튼을 클릭합니다

## 방법 2: 명령줄 (MySQL이 PATH에 있는 경우)
```bash
mysql -u root -p caffeine_app < add_profile_photo.sql
```

## 방법 3: 직접 SQL 실행
MySQL 클라이언트에서 다음 명령을 실행:

```sql
USE caffeine_app;
ALTER TABLE members ADD COLUMN profile_photo LONGTEXT NULL COMMENT '프로필 사진 (base64 인코딩)';
```

## 확인 방법
```sql
DESCRIBE members;
```

profile_photo 컬럼이 추가되었는지 확인하세요.

---

**참고**: 마이그레이션을 실행하지 않아도 앱은 정상 작동합니다. 
단, 프로필 사진 기능은 마이그레이션 후에만 사용 가능합니다.
