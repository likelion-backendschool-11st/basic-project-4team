import type { ApiErrorBody, ApiSuccess } from './types';

// 프론트(127.0.0.1)와 API 호스트를 맞춰야 로그인 쿠키가 전달된다. localhost로 바꾸면 쿠키가 안 붙는다.
// 배포(Vercel)에서는 VITE_API_BASE_URL에 백엔드 주소를 꼭 넣는다 — 빌드할 때 값이 박힌다 (docs/deploy.md).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4000/api';
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.error('[RE:PICK] VITE_API_BASE_URL이 설정되지 않아 로컬 API(127.0.0.1:4000)로 요청합니다. 배포 환경변수를 확인하세요.');
}
export const API_ORIGIN = new URL(API_BASE_URL).origin;

/** 서버가 준 업로드 경로(/uploads/...)를 API 서버 주소로 바꾼다. 이미 전체 URL이면 그대로. */
export const toAssetUrl = (url: string): string => (/^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`);

/** 서버가 내려준 에러. 서버에 닿지 못한 경우 status 0, code 'NETWORK_ERROR'. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** 서버 error.details (예: ITEM_ALREADY_EXISTS의 { item }). 없으면 undefined. */
  readonly details: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && 'error' in body;
}

/** 모든 API 호출의 공통 진입점. 성공하면 data만, 실패하면 ApiError를 던진다. */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      // FormData(파일 업로드)는 브라우저가 boundary를 포함한 Content-Type을 직접 붙인다.
      headers: init.body instanceof FormData ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Failed to reach API server');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message, body.error.details);
    }
    throw new ApiError(response.status, 'UNKNOWN_ERROR', `HTTP ${response.status}`);
  }
  return (body as ApiSuccess<T>).data;
}
