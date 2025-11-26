# Docker를 이용한 VM 배포 안내

안녕하세요! 터미널 인코딩 문제로 이전 메시지가 깨져서 표시된 것 같습니다. 죄송합니다.

동일한 내용을 아래 파일에 저장해두었으니, 이 파일을 확인해주세요.

---

모든 파일의 Docker 이미지화를 완료했으며, VM에서 즉시 사용할 수 있도록 `docker-compose.yml` 파일을 구성했습니다.

### 변경사항

1.  **`server/Dockerfile` 개선**:
    *   프로덕션 환경에 최적화된 경량 이미지를 생성하기 위해 멀티-스테이지 빌드를 적용했습니다. 개발에만 필요한 파일과 의존성은 최종 이미지에서 제외하여 이미지 크기를 줄이고 보안을 강화했습니다.

2.  **`docker-compose.yml` 수정**:
    *   기존에 하드코딩된 Docker Hub 이미지 이름(`ket8235/...`) 대신, 로컬 소스 코드로부터 직접 `frontend`와 `backend` 이미지를 빌드하도록 `build` 설정을 추가했습니다.
    *   데이터베이스 초기화를 위해 사용되는 SQL 파일들의 경로를 `./Dump`에서 `./server/Dump`로 올바르게 수정했습니다.
    *   백엔드 서비스가 Docker 네트워크 내에서 `db`라는 서비스 이름으로 데이터베이스를 찾도록 `DB_HOST` 환경 변수를 `db`로 설정했습니다.

### VM 배포 및 실행 방법

이제 다음 단계를 따라 VM에서 애플리케이션을 실행할 수 있습니다.

**1. `.env` 파일 생성**

프로젝트의 루트 디렉터리(가장 상위 폴더)에 `.env`라는 이름의 파일을 하나 생성하고, 아래 내용을 복사하여 붙여넣으세요. `your_..._here` 부분은 실제 값으로 채워야 합니다.

```env
# server/.env.example에서 가져온 변수들
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=caffeine_app
DB_PORT=3306
PORT=3002
JWT_SECRET=your_jwt_secret_key_here

# docker-compose.yml에서 사용되는 변수
CLIENT_URL=http://localhost

# .env.example에서 가져온 변수
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```
**참고:** `VITE_OPENROUTER_API_KEY`와 `OPENROUTER_API_KEY`는 동일한 값으로 설정해주세요. 전자는 프론트엔드 빌드 시점에, 후자는 백엔드 컨테이너의 환경 변수로 사용됩니다.

**2. 프로젝트 파일 전송**

수정된 파일을 포함한 프로젝트 전체를 VM으로 전송합니다.

**3. Docker Compose 실행**

VM의 프로젝트 디렉터리에서 아래 명령어를 실행하여 모든 서비스를 빌드하고 실행합니다.

```shell
docker compose up --build -d
```

*   `--build`: Docker 이미지를 새로 빌드합니다. 소스 코드가 변경될 때마다 이 옵션을 사용하세요.
*   `-d`: 컨테이너들을 백그라운드에서 실행합니다.

이제 웹 브라우저에서 VM의 IP 주소로 접속하면 애플리케이션이 실행되는 것을 확인할 수 있습니다.
