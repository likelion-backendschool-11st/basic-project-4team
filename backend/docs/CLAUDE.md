# RE:PICK (리픽)

> 다시 고르고, 다시 판다 — 수집품 리셀 거래 + 실시간 시세 + 커뮤니티 플랫폼

트레이딩 카드(포켓몬·원피스·유희왕 등), 한정판 스니커즈, 명품/시계 같은 수집품을
**사고팔고(마켓)**, **체결가 기반 시세를 확인하고(시세 대시보드)**, **품목별로 토론하는(커뮤니티)** 웹 서비스.
에스크로 안심거래, 실물 인증 사진, 시세 대비 사기 의심가 경고가 핵심 차별점이다.

## 현재 상태 (2026-11 기준)

- `frontend/` : 화면 UI는 대부분 구현됨. **모든 데이터는 `src/data/*.ts`의 목(mock) 데이터** — 실제 API 호출 없음.
- `backend/` : Express 5만 설치된 빈 상태. 서버 코드·DB 연결은 아직 없음.
- 다음 단계: 백엔드 API 구현 → 프론트 목 데이터를 API 호출로 교체.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Frontend | React 18 + **TypeScript** 5 + Vite 5, React Router 6, Tailwind CSS 3 (forms, container-queries) |
| Backend | Node.js + Express 5 (CommonJS) |
| DB | MySQL (드라이버/ORM 미정 → 정해지면 여기 갱신) |
| 폰트·아이콘 | Hanken Grotesk, Pretendard, Material Symbols Outlined (`index.html`에서 CDN 로드) |

## 명령어

```bash
# 프론트엔드 (http://127.0.0.1:4173)
cd frontend
npm install
npm run dev          # 개발 서버 — 포트 4173 고정 (5173은 Windows 예약 포트라 사용 안 함)
npm run build        # tsc 타입체크 + 빌드
npm run typecheck    # 타입체크만
npm run validate -- src/components/xxx/Foo.tsx   # 컴포넌트 규칙 검사 (Props 인터페이스, hex 색상 금지)

# 백엔드
cd backend
npm install
# 실행 스크립트 아직 없음 — 서버 진입 파일 만들면 여기에 추가
```

## 폴더 구조

```
frontend/src/
  pages/          라우트 단위 페이지 (XxxPage.tsx)
  components/     기능별 폴더 (home, search, listing, listing-form, market, community, auth, layout, common)
  hooks/          기능별 폴더, 상태·로직은 여기로 (useXxx.ts)
  data/           기능별 목 데이터 + 화면 문구(copy) + 타입 정의, layout.ts에 ROUTES
backend/          (구현 예정)
docs/             컨벤션, API 정의서
```

## 라우트 ↔ 화면 ID

| 경로 | 화면 | 페이지 |
|---|---|---|
| `/login` | P-000 로그인 | LoginPage |
| `/` | P-001 메인 | HomePage |
| `/search?q=` | P-009 검색 결과 | SearchResultsPage |
| `/listings/:id` | P-010 상품 상세(구매자) | ListingDetailPage |
| `/my/listings/:id` | P-013 내 판매글 상세(판매자) | MyListingDetailPage |
| `/sell` | P-014 판매글 등록 | ListingCreatePage |
| `/my/listings/:id/edit` | P-015 판매글 수정 | ListingEditPage |
| `/market` | 시세 대시보드 | MarketDashboardPage |
| `/community` | P-017 커뮤니티 피드 | CommunityFeedPage |
| `/community/items/:id` | P-018 품목별 토론방 | ItemDiscussionPage |

## 반드시 지킬 것

- 작업 전 `docs/convention.md`의 규칙을 따른다. API를 만들거나 호출할 때는 `docs/api-spec.md`가 기준이다. 스펙과 다르게 구현해야 하면 **스펙 문서부터 수정**한다.
- 색상은 `tailwind.config.js`의 디자인 토큰(`text-primary`, `bg-canvas` 등)만 쓴다. `className`에 hex 값을 넣지 않는다.
- 컴포넌트는 `XxxProps` 인터페이스(readonly)를 선언한다.
- 화면 문구·목 데이터는 컴포넌트에 하드코딩하지 않고 `src/data/`에 둔다.
- `.env`는 커밋하지 않는다. 새 환경변수가 생기면 `.env.example`에 키를 추가한다.
- `main` 브랜치에 직접 push하지 않는다. 기능 브랜치 → PR → 리뷰 후 병합.

## 참고 문서

@docs/convention.md
@docs/api-spec.md
