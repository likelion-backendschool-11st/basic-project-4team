# 배포 가이드 (#66)

> 프론트엔드는 **Vercel**, 백엔드는 **WebSocket·디스크를 지원하는 서버**(Render·Railway 등), DB는 **클라우드 MySQL 8**.
> Vercel 서버리스는 실시간 채팅(WebSocket), 업로드 사진 저장(서버 디스크), 하루 1번 사진 정리 타이머를 지원하지 않아 백엔드는 따로 올린다.

```
[Vercel]  frontend (React SPA, frontend/)
    │  https 요청 + 로그인 쿠키 (SameSite=None; Secure)
    │  wss 채팅
    ▼
[Render / Railway]  backend (Express + WebSocket, backend/)
    ├─ UPLOAD_DIR  영구 디스크(볼륨) — 판매글·토론글·채팅 사진, 시드 사진
    └─ MySQL 8 (Aiven · Railway MySQL · AWS RDS 등)
```

## 순서 요약

1. MySQL 만들기 → 접속 정보 확보
2. 백엔드 배포 (환경변수 + 영구 디스크) → **서버 셸에서** `npm run db:init`, `npm run db:seed`
3. 프론트 Vercel 배포 (`VITE_API_BASE_URL` = 백엔드 주소)
4. 백엔드 `CORS_ORIGIN`에 Vercel 주소를 넣고 재시작
5. 체크리스트로 확인

---

## 1. MySQL

- **MySQL 8.0.16 이상** (스키마가 `CHECK`·`ngram FULLTEXT`를 쓴다).
- 접속 정보(host, port, user, password, DB 이름)를 받아 둔다.
- TLS가 필수인 서비스(Aiven 등)는 백엔드에 `DB_SSL=true`. CA 인증서를 주면 `DB_SSL_CA`에 PEM 내용을 넣는다(줄바꿈은 `\n` 두 글자로 한 줄로).
- DB 이름은 `npm run db:init`이 없으면 만들어 준다. 계정에 `CREATE DATABASE` 권한이 없으면 서비스 화면에서 DB를 먼저 만들고 그 이름을 `DB_NAME`에 넣는다.

## 2. 백엔드 (Render / Railway)

| 설정 | 값 |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Node | 20 이상 (`package.json` engines) |
| Health Check Path | `/api/health` |
| 영구 디스크(볼륨) | 예: `/var/data/uploads`에 마운트 → `UPLOAD_DIR`에 같은 경로 |

> **영구 디스크가 없으면** 재배포·재시작 때 업로드한 사진이 모두 사라진다. Render는 유료 플랜에서 Disk를, Railway는 Volume을 붙인다.

### 환경변수

| 키 | 값 (예시) | 설명 |
|---|---|---|
| `NODE_ENV` | `production` | 쿠키 Secure + SameSite=None, 프록시 신뢰 |
| `PORT` | (비워둠) | 대부분 플랫폼이 자동으로 넣는다 |
| `CORS_ORIGIN` | `https://repick.vercel.app` | **Vercel 프론트 주소**, 끝에 `/` 없이. 여러 개면 쉼표 |
| `PUBLIC_BASE_URL` | `https://repick-api.onrender.com` | **백엔드 자신의 주소** (업로드 이미지 URL) |
| `UPLOAD_DIR` | `/var/data/uploads` | 영구 디스크 경로 |
| `DB_HOST` · `DB_PORT` · `DB_USER` · `DB_PASSWORD` · `DB_NAME` | 클라우드 MySQL 정보 | |
| `DB_SSL` · `DB_SSL_CA` | `true` · PEM | TLS 필수일 때 |
| `JWT_SECRET` | **길고 랜덤한 값** | 예: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `1h` | |
| `SMTP_*` · `MAIL_FROM` | Gmail 앱 비밀번호 등 | 비우면 메일 대신 서버 로그에 출력 (아이디·비밀번호 찾기) |

> `CORS_ORIGIN`은 Vercel 배포가 끝나 주소가 나온 뒤에 넣어도 된다(4단계). 그전에는 임시 값으로 둔다.

### DB 초기화 — 서버 셸에서 실행

```bash
npm run db:init    # 테이블 생성 (반복 실행 안전)
npm run db:seed    # 팀 공용 더미 데이터 + 시드 사진을 UPLOAD_DIR/seed로 복사 (⚠️ 모든 데이터 삭제 후 다시 넣음)
```

- **반드시 백엔드 서버 안(Render Shell, `railway run` 등)에서 실행한다.** 내 컴퓨터에서 실행하면 DB는 채워지지만 시드 사진은 내 컴퓨터에 복사돼 서버에서 사진이 깨진다.
- 실서비스로 쓸 거라면 `db:seed`는 처음 한 번만. 다시 실행하면 사용자 데이터가 모두 지워진다.
- 시드 계정: `test1`~`test3` 등 / `test1234`, `test2`는 관리자.

## 3. 프론트엔드 (Vercel)

1. Vercel → **Add New Project** → 이 저장소 선택
2. **Root Directory: `frontend`** (빌드 설정은 `frontend/vercel.json`에 있다: Vite, `npm run build`, `dist`)
3. **Environment Variables**: `VITE_API_BASE_URL` = `https://<백엔드 도메인>/api`
4. Deploy

- `vercel.json`의 rewrites로 `/listings/12`, `/my?tab=...` 같은 주소를 새로고침해도 404가 나지 않는다(SPA).
- `VITE_API_BASE_URL`은 **빌드할 때 박힌다.** 바꾸면 Vercel에서 다시 배포해야 한다.
- 채팅 WebSocket 주소는 이 값에서 자동으로 만든다(`https` → `wss`).

## 4. CORS_ORIGIN 연결

Vercel 주소(예: `https://repick.vercel.app`)를 백엔드 `CORS_ORIGIN`에 넣고 재시작한다.

- 미리보기 배포(`https://repick-git-브랜치-팀.vercel.app`)에서도 쓰려면 쉼표로 추가한다. 목록에 없는 주소에서는 API 요청과 채팅 연결이 거부된다.
- 커스텀 도메인을 연결했다면 그 주소를 넣는다.

## 5. 배포 확인 체크리스트

- [ ] `https://<백엔드>/api/health` → `{"data":{"status":"ok"}}`
- [ ] 프론트 메인·검색·판매글 상세에서 **사진이 보인다** (안 보이면 `PUBLIC_BASE_URL`·`UPLOAD_DIR`·시드 위치 확인)
- [ ] 로그인 후 **새로고침해도 로그인 유지** (안 되면 아래 "로그인이 풀린다")
- [ ] 판매글 등록에서 사진 업로드 → 재배포 후에도 사진 유지 (영구 디스크 확인)
- [ ] 두 계정으로 채팅 → 상대 화면에 실시간 표시 (WebSocket)
- [ ] `/listings/1`에서 새로고침 → 404 아님 (SPA rewrites)
- [ ] test2로 `/my?tab=itemReview` → 관리자 탭 동작

## 문제 해결

| 증상 | 원인 · 해결 |
|---|---|
| 브라우저 콘솔에 CORS 에러 | `CORS_ORIGIN`이 프론트 주소와 정확히 같은지 (https, 끝 `/` 없음, 미리보기 주소 포함 여부) |
| 로그인이 풀린다 / 로그인 후에도 401 | 백엔드 `NODE_ENV=production`인지(쿠키 SameSite=None·Secure). **Safari·일부 브라우저는 다른 사이트 쿠키(`vercel.app` ↔ `onrender.com`)를 막는다** → 프론트·백엔드를 같은 상위 도메인의 커스텀 도메인으로 연결하면 해결 (예: `repick.kr` + `api.repick.kr`) |
| 콘솔에 `VITE_API_BASE_URL이 설정되지 않아…` | Vercel 환경변수 추가 후 **다시 배포** |
| 채팅이 실시간으로 안 온다 | 백엔드가 WebSocket을 지원하는 플랫폼인지, `CORS_ORIGIN`에 프론트 주소가 있는지 (다르면 4403으로 끊김) |
| 사진이 깨진다 | `PUBLIC_BASE_URL`이 백엔드 https 주소인지, `db:seed`를 서버에서 실행했는지, 영구 디스크가 `UPLOAD_DIR`에 붙어 있는지 |
| DB 접속 실패 (`ECONNREFUSED`, TLS 에러) | DB 방화벽에서 백엔드 서버 IP 허용, `DB_SSL=true`·`DB_SSL_CA` 확인 |
