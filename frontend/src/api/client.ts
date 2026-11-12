import type { ApiErrorBody, ApiSuccess } from './types';

// 프론트(127.0.0.1)와 API 호스트를 맞춰야 로그인 쿠키가 전달된다. localhost로 바꾸면 쿠키가 안 붙는다.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4000/api';

/** 서버가 내려준 에러. 서버에 닿지 못한 경우 status 0, code 'NETWORK_ERROR'. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
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
      headers: { 'Content-Type': 'application/json', ...init.headers },
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
      throw new ApiError(response.status, body.error.code, body.error.message);
    }
    throw new ApiError(response.status, 'UNKNOWN_ERROR', `HTTP ${response.status}`);
  }
  return (body as ApiSuccess<T>).data;
}
