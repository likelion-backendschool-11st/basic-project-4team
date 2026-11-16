import type { CSSProperties } from 'react';
import { ROUTES } from './layout';

export interface AuthLink {
  readonly label: string;
  readonly to: string;
  readonly icon?: string;
  readonly strong?: boolean;
}

export const authHeader = {
  logoAriaLabel: '메인 페이지로 이동',
  links: [
    { label: '고객센터', to: '/help', icon: 'help' },
    { label: '서비스 소개', to: '/about' },
  ] as readonly AuthLink[],
};

export const loginCopy = {
  title: '로그인',
  idLabel: '아이디',
  idPlaceholder: '아이디를 입력해 주세요',
  idError: '아이디를 입력해 주세요.',
  passwordLabel: '비밀번호',
  passwordPlaceholder: '비밀번호를 입력해 주세요',
  passwordError: '비밀번호를 입력해 주세요.',
  passwordToggleLabel: '비밀번호 표시 전환',
  rememberId: '아이디 저장',
  secureBadge: '보안 접속',
  submit: '로그인',
  submitting: '로그인 중...',
  missingFields: '아이디와 비밀번호를 모두 입력해 주세요.',
  networkError: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해 주세요.',
  unknownError: '로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  success: '로그인 성공!',
  successDetail: '메인 페이지로 이동합니다.',
  socialPending: (provider: string) => `${provider} 간편 로그인 인증 창으로 연결 중입니다.`,
  redirectTo: ROUTES.home,
};

export const utilityLinks: readonly AuthLink[] = [
  { label: '아이디 찾기', to: ROUTES.findId },
  { label: '비밀번호 찾기', to: ROUTES.findPassword },
  { label: '회원가입', to: ROUTES.signup, strong: true },
];

/** 회원가입·비밀번호 규칙 — 백엔드 auth.controller.js와 같은 값 (api-spec POST /auth/signup). */
export const AUTH_RULES = {
  loginIdPattern: /^[a-z0-9_]{4,30}$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  passwordMin: 8,
  passwordMaxBytes: 72,
  nicknameMax: 30,
  resetCodePattern: /^\d{6}$/,
} as const;

/** 공통 에러 문구 (회원가입·찾기 화면). */
export const authErrorCopy = {
  network: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해 주세요.',
  unknown: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

/** 다른 화면에서 로그인 화면으로 보낼 때 함께 넘기는 안내 (location.state). */
export interface LoginRedirectState {
  readonly loginId?: string;
  readonly noticeTitle: string;
  readonly noticeMessage: string;
}

export const signupCopy = {
  title: '회원가입',
  description: '아이디·비밀번호 찾기는 가입한 이메일로 진행됩니다.',
  loginIdLabel: '아이디',
  loginIdPlaceholder: '영문 소문자·숫자·밑줄(_) 4~30자',
  loginIdError: '아이디는 영문 소문자·숫자·밑줄(_) 4~30자로 입력해 주세요.',
  passwordLabel: '비밀번호',
  passwordPlaceholder: '8자 이상',
  passwordError: '비밀번호는 8자 이상으로 입력해 주세요. (최대 72바이트)',
  passwordConfirmLabel: '비밀번호 확인',
  passwordConfirmPlaceholder: '비밀번호를 한 번 더 입력해 주세요',
  passwordConfirmError: '비밀번호가 일치하지 않습니다.',
  passwordToggleLabel: '비밀번호 표시 전환',
  nicknameLabel: '닉네임',
  nicknamePlaceholder: '커뮤니티·거래에 표시되는 이름 (30자 이내)',
  nicknameError: '닉네임은 1~30자로 입력해 주세요.',
  emailLabel: '이메일',
  emailPlaceholder: 'example@repick.dev',
  emailError: '올바른 이메일 주소를 입력해 주세요.',
  submit: '가입하기',
  submitting: '가입 중...',
  invalidFields: '입력한 내용을 다시 확인해 주세요.',
  loginPrompt: '이미 계정이 있으신가요?',
  loginLink: '로그인',
  /** 가입 성공 후 로그인 화면에 보여줄 안내. */
  doneTitle: '가입이 완료되었습니다!',
  doneMessage: '가입한 아이디로 로그인해 주세요.',
};

export const findIdCopy = {
  title: '아이디 찾기',
  description: '가입할 때 등록한 이메일을 입력하면 해당 메일로 아이디를 보내드립니다.',
  emailLabel: '이메일',
  emailPlaceholder: 'example@repick.dev',
  emailError: '올바른 이메일 주소를 입력해 주세요.',
  submit: '확인',
  submitting: '확인 중...',
  cancel: '취소',
  sentTitle: '메일을 확인해 주세요',
  sentMessage: (email: string) =>
    `${email} 으로 가입된 계정이 있다면 아이디를 보내드렸습니다. 메일이 오지 않으면 스팸함을 확인하거나 이메일 주소를 다시 확인해 주세요.`,
  toLogin: '로그인하러 가기',
  toFindPassword: '비밀번호 찾기',
  retry: '다른 이메일로 찾기',
};

export const findPasswordCopy = {
  title: '비밀번호 찾기',
  requestDescription: '아이디와 가입한 이메일을 입력하면 비밀번호 재설정 인증코드를 메일로 보내드립니다.',
  confirmDescription: (email: string) =>
    `${email} 으로 보낸 6자리 인증코드와 새 비밀번호를 입력해 주세요. 인증코드는 10분 동안 유효합니다.`,
  loginIdLabel: '아이디',
  loginIdPlaceholder: '아이디를 입력해 주세요',
  loginIdError: '아이디를 입력해 주세요.',
  emailLabel: '이메일',
  emailPlaceholder: 'example@repick.dev',
  emailError: '올바른 이메일 주소를 입력해 주세요.',
  requestSubmit: '인증코드 받기',
  requestSubmitting: '요청 중...',
  cancel: '취소',
  codeLabel: '인증코드',
  codePlaceholder: '숫자 6자리',
  codeError: '메일로 받은 6자리 숫자를 입력해 주세요.',
  newPasswordLabel: '새 비밀번호',
  newPasswordPlaceholder: '8자 이상',
  newPasswordError: '비밀번호는 8자 이상으로 입력해 주세요. (최대 72바이트)',
  newPasswordConfirmLabel: '새 비밀번호 확인',
  newPasswordConfirmPlaceholder: '새 비밀번호를 한 번 더 입력해 주세요',
  newPasswordConfirmError: '비밀번호가 일치하지 않습니다.',
  passwordToggleLabel: '비밀번호 표시 전환',
  confirmSubmit: '비밀번호 변경',
  confirmSubmitting: '변경 중...',
  resend: '인증코드 다시 받기',
  resendWait: (seconds: number) => `${seconds}초 후 다시 받기`,
  resent: '인증코드를 다시 보냈습니다. 가장 최근 메일의 코드만 사용할 수 있습니다.',
  sentNotice: '입력한 정보와 일치하는 계정이 있다면 인증코드를 보냈습니다. 메일이 오지 않으면 아이디와 이메일을 다시 확인해 주세요.',
  invalidFields: '입력한 내용을 다시 확인해 주세요.',
  back: '아이디·이메일 다시 입력',
  /** 변경 성공 후 로그인 화면에 보여줄 안내. */
  doneTitle: '비밀번호가 변경되었습니다!',
  doneMessage: '새 비밀번호로 로그인해 주세요.',
};

export type SocialProviderId = 'kakao' | 'naver' | 'google';

export interface SocialProvider {
  readonly id: SocialProviderId;
  readonly label: string;
  readonly title: string;
  /** Third-party brand colours (Kakao yellow / Naver green) — exception to the token-only rule. */
  readonly style?: CSSProperties;
}

export const socialLogin = {
  dividerLabel: '간편 로그인',
  providers: [
    { id: 'kakao', label: '카카오', title: '카카오 로그인', style: { backgroundColor: '#FEE500', color: '#191919' } },
    { id: 'naver', label: '네이버', title: '네이버 로그인', style: { backgroundColor: '#03C75A', color: '#FFFFFF' } },
    { id: 'google', label: '구글', title: '구글 로그인' },
  ] as readonly SocialProvider[],
};

/** Google "G" mark paths (official brand fills). */
export const googleLogoPaths: readonly { readonly d: string; readonly fill: string }[] = [
  { d: 'M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z', fill: '#4285F4' },
  { d: 'M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.35 24 12 24z', fill: '#34A853' },
  { d: 'M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2 0 10.05 0 12s.46 3.8 1.27 5.42l4.01-3.15z', fill: '#FBBC05' },
  { d: 'M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z', fill: '#EA4335' },
];

export const testAccountNotice = {
  title: '테스트 계정 안내:',
  body: '아이디 test1 / 비밀번호 test1234 로 로그인할 수 있습니다. (test2, test3도 동일)',
};

export const authFooter = {
  links: [
    { label: '이용약관', to: '/terms', strong: true },
    { label: '개인정보처리방침', to: '/privacy', strong: true },
    { label: '보안센터', to: '/security' },
    { label: '인증서 지원', to: '/certificates' },
  ] as readonly AuthLink[],
  securityNote: '금융보안 규격 256-bit SSL 암호화 기술로 보호되고 있습니다.',
  copyright: '© 2025 Finance Corporation. All rights reserved. (P-000 Wireframe Implementation)',
};
