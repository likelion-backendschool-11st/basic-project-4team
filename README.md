# RE:PICK (리픽)

수집품 리셀 거래 + 실시간 시세 + 커뮤니티 플랫폼.

| 폴더 | 내용 | 주소 |
|---|---|---|
| `frontend/` | React + TypeScript + Vite | http://127.0.0.1:4173 |
| `backend/` | Node.js + Express + MySQL | http://localhost:4000 |

> 명령어는 Mac(터미널)과 Windows(PowerShell) 모두 같다. 다른 곳만 따로 표시했다.

---

## 1. 처음 세팅 (한 번만)

### 1-1. 필요한 프로그램

- **Node.js 20 이상** — `node -v`로 확인
- **MySQL 8.x** — 설치할 때 정한 **root 비밀번호를 기억해 둘 것**
  - Mac: `brew install mysql@8.4`
  - Windows: [MySQL Installer](https://dev.mysql.com/downloads/installer/)로 설치 (Server만 있으면 됨, "Windows Service로 실행" 체크)

### 1-2. MySQL 실행 확인

**Mac**

```bash
brew services list            # mysql@8.4 가 started 이면 OK
brew services start mysql@8.4 # 꺼져 있으면 켜기
```

**Windows (PowerShell)**

```powershell
Get-Service *mysql*           # Status 가 Running 이면 OK (이름 예: MySQL84, MySQL80)
Start-Service MySQL84         # 꺼져 있으면 켜기 — 관리자 권한 PowerShell 필요, 이름은 위에서 본 것으로
```

### 1-3. 백엔드 `.env` 만들기

```bash
cd backend
```

| Mac | Windows |
|---|---|
| `cp .env.example .env` | `copy .env.example .env` |

만든 `backend/.env`를 열어서 **`DB_PASSWORD=` 뒤에 내 MySQL root 비밀번호만 적는다.** 나머지는 그대로 둔다.

### 1-4. 패키지 설치 + DB 만들기

```bash
# backend 폴더에서
npm install
npm run db:init    # repick DB와 테이블 생성 (여러 번 실행해도 안전)
npm run db:seed    # 테스트 계정 test1, test2, test3 생성 (이미 있으면 건너뜀)

# 프론트엔드
cd ../frontend
npm install
```

`✅ DB 'repick' 준비 완료`, `✅ 시드 완료`가 보이면 성공.

---

## 2. 매일 실행

터미널을 **두 개** 열어서 각각 실행한다.

```bash
# 터미널 1 — 백엔드 (코드 저장하면 자동 재시작)
cd backend
npm run dev
```

```bash
# 터미널 2 — 프론트엔드
cd frontend
npm run dev
```

브라우저에서 http://127.0.0.1:4173/login 접속 → **`test1` / `test1234`** 로 로그인.
(테스트 계정: `test1`, `test2`, `test3`, 비밀번호는 모두 `test1234`)

로그인 버튼을 눌렀는데 **"서버에 연결할 수 없습니다"** 가 뜨면 백엔드(터미널 1)가 꺼져 있는 것이다.

> 프론트는 기본으로 `http://127.0.0.1:4000/api`를 호출한다. 바꿔야 할 때만 `frontend/.env`에 `VITE_API_BASE_URL`을 적는다 (`frontend/.env.example` 참고).
> 이때 주소를 `localhost`로 쓰면 로그인 쿠키가 전달되지 않으니 꼭 `127.0.0.1`로 쓴다.

pull 받은 뒤에 `package.json`이나 `db/schema.sql`이 바뀌었으면 `npm install` / `npm run db:init`을 다시 실행한다.

---

## 3. 자주 나는 에러

| 에러 메시지 | 원인 | 해결 |
|---|---|---|
| `❌ MySQL에 연결할 수 없습니다` / `ECONNREFUSED` | MySQL이 꺼져 있음 | [1-2. MySQL 실행 확인](#1-2-mysql-실행-확인) |
| `❌ MySQL 로그인 실패` / `ER_ACCESS_DENIED_ERROR` | `.env`의 비밀번호가 틀림 | `backend/.env`의 `DB_PASSWORD` 확인 (앞뒤 공백·따옴표 없이) |
| `환경변수 DB_USER가 설정되지 않았습니다` 등 | `.env` 파일이 없음 | [1-3](#1-3-백엔드-env-만들기)대로 `backend/.env` 만들기 (`.env.txt`로 저장되지 않았는지도 확인) |
| `❌ 데이터베이스 'repick'가 없습니다` / `테이블이 없습니다` | DB를 아직 안 만듦 | `npm run db:init` |
| 로그인 화면에 "서버에 연결할 수 없습니다" | 백엔드가 꺼져 있음 | `backend`에서 `npm run dev` |
| 로그인 화면에 "로그인 중 문제가 발생했습니다" / API가 `500` | 대부분 DB 연결 문제 | 백엔드 터미널의 에러 로그 확인 → 위 항목 참고 |
| `Error: listen EADDRINUSE: address already in use :::4000` | 백엔드가 이미 다른 터미널에서 실행 중 | 기존 터미널에서 `Ctrl+C` 후 다시 실행 |
| `Port 4173 is in use` | 프론트가 이미 실행 중 | 위와 동일 |
| `Cannot find module 'express'` 등 | 패키지 미설치 | 해당 폴더에서 `npm install` |
| Windows에서 `npm run ...` 실행 시 "스크립트를 실행할 수 없습니다" | PowerShell 실행 정책 | 관리자 PowerShell에서 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## 더 보기

- API 명세: [`backend/docs/api-spec.md`](backend/docs/api-spec.md)
- 코딩 컨벤션: [`backend/docs/convention.md`](backend/docs/convention.md)
- 프로젝트 개요: [`backend/docs/CLAUDE.md`](backend/docs/CLAUDE.md)
