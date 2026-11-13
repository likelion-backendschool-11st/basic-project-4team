# 코딩 컨벤션

> 프론트엔드 규칙은 **현재 코드에서 이미 쓰고 있는 방식**을 정리한 것이다.
> 백엔드·Git 규칙은 제안안이다. `(제안)` 표시된 항목은 팀 회의에서 확정한 뒤 표시를 지운다.

---

## 1. 공통

- 들여쓰기 2칸, 세미콜론 사용, 문자열은 작은따옴표 `'`, 여러 줄 객체·배열·인자에는 마지막 쉼표.
- 인코딩 UTF-8, 줄바꿈 LF.
- 변수·함수는 `camelCase`, 상수는 `UPPER_SNAKE_CASE` (예: `MAX_PHOTOS`), 타입·컴포넌트는 `PascalCase`.
- 주석은 "왜"를 설명할 때만 쓴다. 공개 함수·컴포넌트 위에는 한 줄짜리 `/** ... */` 설명을 단다.
- 사용하지 않는 변수·import를 남기지 않는다 (`tsconfig`의 `noUnusedLocals`로 강제됨).

## 2. 프론트엔드 (React + TypeScript)

### 파일·폴더

| 종류 | 위치 | 파일명 |
|---|---|---|
| 페이지 | `src/pages/` | `XxxPage.tsx` |
| 컴포넌트 | `src/components/<기능>/` | `PascalCase.tsx` |
| 훅 | `src/hooks/<기능>/` | `useXxx.ts` |
| 목 데이터·문구·타입 | `src/data/<기능>.ts` | `camelCase.ts` |
| 여러 기능에서 쓰는 컴포넌트 | `src/components/common/` | |

기능 폴더 이름: `home`, `search`, `listing`, `listing-form`, `market`, `community`, `auth`, `layout`.

### 컴포넌트

```tsx
import React from 'react';
import { Icon } from '../common/Icon';

interface PriceTagProps {
  readonly price: number;
  readonly currency: string;
  readonly className?: string;
}

/** 가격 + 통화 단위 표시. */
export const PriceTag: React.FC<PriceTagProps> = ({ price, currency, className = '' }) => (
  <span className={`font-stat-value text-stat-value text-ink ${className}`}>
    {price.toLocaleString('ko-KR')}
    <span className="font-ui-sm text-ui-sm ml-0.5">{currency}</span>
  </span>
);

export default PriceTag;
```

- 함수형 컴포넌트 + `React.FC<XxxProps>`.
- Props는 `interface XxxProps`로 선언하고 모든 필드에 `readonly`를 붙인다. (`npm run validate`가 검사함)
- **named export + default export**를 둘 다 둔다. import할 때는 named import를 쓴다.
- 이벤트 핸들러 prop은 `onXxx`, 내부 함수는 `handleXxx`.
- 상태·로직이 3줄 이상이면 컴포넌트에 두지 말고 `hooks/`의 커스텀 훅으로 뺀다. 훅은 객체를 반환한다.
- 배열·객체 타입은 `readonly`를 붙여 읽기 전용으로 쓴다 (`readonly Listing[]`).

### 스타일

- Tailwind 유틸리티 클래스만 쓴다. 별도 CSS 파일·인라인 `style`은 쓰지 않는다.
  - 예외: 카카오·네이버 같은 외부 브랜드 색상 (`data/auth.ts` 참고).
- 색상·간격·글꼴은 `tailwind.config.js`의 토큰을 쓴다.
  - ✅ `text-primary`, `bg-surface-container-low`, `px-gutter-desktop`, `font-heading-2 text-heading-2`
  - ❌ `text-[#006641]`, `bg-[#f8f9ff]`
- 아이콘은 `<Icon name="favorite" />` (Material Symbols)를 쓴다.

### 데이터·문구

- 화면에 보이는 한글 문구는 `src/data/<기능>.ts`에 모아두고 컴포넌트는 props로 받는다.
- 라우트 경로는 문자열로 쓰지 않고 `ROUTES` 상수를 쓴다: `ROUTES.listingDetail(id)`.
- 가격은 `number`로 다루고, 화면에 보여줄 때 `toLocaleString('ko-KR')`로 포맷한다.
- 날짜는 ISO 문자열로 받아서 "3일 전" 같은 상대 시간으로 바꿔 표시한다.

### API 연동 (제안)

- API 호출 함수는 `src/api/<기능>.ts`에 모은다 (예: `src/api/listings.ts` → `getListings`, `createListing`).
- 컴포넌트에서 `fetch`를 직접 부르지 않고 훅에서 `src/api` 함수를 호출한다.
- API 기본 주소는 환경변수 `VITE_API_BASE_URL`로 받는다.
- 응답 타입은 `docs/api-spec.md`와 똑같이 맞춘 TS 타입을 `src/api/types.ts`에 정의한다.

## 3. 백엔드 (Express + MySQL) — (제안)

### 폴더 구조

```
backend/
  src/
    app.js              Express 앱 생성, 미들웨어, 라우터 연결
    server.js           포트 열기 (진입점)
    config/             env, DB 연결 풀
    routes/             URL ↔ 컨트롤러 연결만 (listings.routes.js)
    controllers/        req/res 처리, 입력 검증 (listings.controller.js)
    services/           비즈니스 로직 (listings.service.js)
    repositories/       SQL 쿼리 (listings.repository.js)
    middlewares/        auth, errorHandler, upload
    utils/
  .env.example
```

- 계층 흐름: `routes → controllers → services → repositories`. 컨트롤러에서 SQL을 직접 쓰지 않는다.
- 파일명은 `기능.역할.js` (예: `auth.service.js`).
- 모듈 방식은 현재 `package.json` 설정대로 **CommonJS** (`require` / `module.exports`).
- 비동기는 `async/await`. 에러는 `throw`하고 공통 `errorHandler` 미들웨어에서 응답 형식을 맞춘다.
- 비밀번호는 bcrypt로 해시. DB 접속 정보·JWT 비밀키는 `.env`에서만 읽는다.

### SQL / DB

- 테이블·컬럼 이름: `snake_case`, 테이블은 복수형 (`users`, `listings`, `listing_images`).
- 모든 테이블에 `id BIGINT AUTO_INCREMENT PK`, `created_at`, `updated_at`.
- 삭제는 소프트 삭제(`deleted_at`)를 기본으로 한다.
- 쿼리는 반드시 **플레이스홀더(`?`)**를 써서 SQL 인젝션을 막는다. 문자열 이어붙이기 금지.
- DB 컬럼은 snake_case이고 API 응답은 camelCase다. 변환은 repository 계층에서 한다.

## 4. Git 규칙 (제안)

### 브랜치

```
main                 배포 가능한 상태만 유지, 직접 push 금지
develop              개발 통합 브랜치
feat/<이슈번호>-<짧은설명>     예) feat/12-listing-api
fix/<이슈번호>-<짧은설명>
docs/..., refactor/..., chore/...
```

### 커밋 메시지

```
<타입>: <요약 (50자 이내, 한글 가능)>

<본문 — 무엇을, 왜 (선택)>
```

| 타입 | 용도 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 구조 개선 |
| `style` | 포맷, 세미콜론 등 (동작 무관) |
| `docs` | 문서 |
| `test` | 테스트 |
| `chore` | 빌드·설정·패키지 |

예: `feat: 판매글 목록 조회 API 추가`

### PR
- PR을 꼭 허락받고 날린다.
- PR 하나에 기능 하나. 제목은 커밋 메시지 형식을 따른다.
- 본문에 `작업 내용 / 확인 방법 / 스크린샷(UI 변경 시)`을 적는다.
- 1명 이상 승인 후 Squash merge.
- 머지 전 `npm run build`(프론트) 통과 확인.
