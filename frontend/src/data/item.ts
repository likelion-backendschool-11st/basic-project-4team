import type { ItemRequestStatus } from '../api/types';
import { languageOptions, rarityOptions, type SelectOption } from './listingForm';

/* 마이페이지 품목 등록 요청 탭 (#34) — 요청 작성 팝업 문구는 listingForm.ts의 itemRequestCopy */

/** 요청 상태 뱃지 — "품목 요청" 탭·"품목 요청 관리" 탭 공통. */
export const itemRequestStatusCopy: Readonly<Record<ItemRequestStatus, string>> = {
  pending: '검토 중',
  approved: '등록됨',
  rejected: '반려',
};

/** 마이페이지 "품목 요청" 탭 (모든 회원). */
export const myItemRequestsCopy = {
  requestedAt: (time: string) => `${time} 요청`,
  processedAt: (time: string) => `${time} 처리`,
  pendingHint: '관리자가 확인하고 있어요.',
  approvedHint: (name: string) => `공식 품목 '${name}'(으)로 등록되었어요. 판매글 등록에서 검색해 선택할 수 있어요.`,
  rejectedLabel: '반려 사유',
  referenceLink: '참고 링크',
  emptyTitle: '보낸 품목 요청이 없어요',
  emptyBody: '판매글 등록에서 찾는 품목이 없으면 관리자에게 등록을 요청할 수 있어요.',
  emptyAction: '판매글 등록하기',
};

const NONE: SelectOption = { value: '', label: '선택 안 함' };

/** 관리자 마이페이지 "품목 요청 관리" 탭. */
export const adminItemRequestsCopy = {
  filters: [
    { value: 'pending', label: '검토 중' },
    { value: 'approved', label: '등록됨' },
    { value: 'rejected', label: '반려' },
    { value: null, label: '전체' },
  ] as readonly { readonly value: ItemRequestStatus | null; readonly label: string }[],
  filterAria: '요청 상태 필터',
  requester: (nickname: string | null) => `요청자 ${nickname ?? '탈퇴한 회원'}`,
  linkedItem: (name: string, id: number) => `공식 품목 #${id} ${name}`,
  approve: '승인',
  reject: '반려',
  cancel: '취소',
  submitting: '처리 중...',
  modeAria: '승인 방법',
  modes: { create: '새 품목으로 등록', link: '기존 품목에 연결' },
  createHint: '요청 글을 보고 실제 품목 정보를 입력하세요. 등록하면 바로 품목 검색에 나옵니다.',
  nameLabel: '품목명 (필수)',
  setNameLabel: '세트명',
  setNamePlaceholder: '예) 포켓몬 151 (SV2a)',
  cardNoLabel: '카드 번호',
  cardNoPlaceholder: '예) 201/165',
  languageLabel: '언어',
  rarityLabel: '희귀도',
  imageUrlLabel: '이미지 URL',
  imageUrlPlaceholder: 'https://...',
  languageOptions: [NONE, ...languageOptions] as readonly SelectOption[],
  rarityOptions: [NONE, ...rarityOptions] as readonly SelectOption[],
  linkHint: '이미 있는 품목이면 검색해서 고르세요.',
  linkPlaceholder: '품목명 · 세트명 · 카드번호',
  linkSearch: '검색',
  linkSearching: '검색 중...',
  linkEmpty: '검색 결과가 없습니다.',
  linkSelectRequired: '연결할 품목을 골라주세요.',
  rejectLabel: '반려 사유 (필수, 요청자에게 보여요)',
  rejectPlaceholder: '예) 공식 발매되지 않은 카드입니다.',
  submitApprove: '승인하기',
  submitReject: '반려하기',
  conflict: (name: string) => `이미 '${name}' 품목이 있어요.`,
  linkConflict: '이 품목에 연결해서 승인',
  approvedCreated: (name: string) => `'${name}'을(를) 공식 품목으로 등록했습니다. 이제 품목 검색에 나옵니다.`,
  approvedLinked: (name: string) => `'${name}' 요청을 기존 품목에 연결했습니다.`,
  approvedTogether: (count: number) => ` (같은 제목 요청 ${count}건 함께 승인)`,
  rejected: (name: string) => `'${name}' 요청을 반려했습니다.`,
  errors: {
    nameRequired: '품목명을 입력해주세요.',
    reasonRequired: '반려 사유를 입력해주세요.',
    forbidden: '관리자만 처리할 수 있습니다. 다시 로그인해 주세요.',
    failed: '처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
  },
  emptyTitle: '해당하는 요청이 없어요',
  emptyBody: '회원이 품목 등록을 요청하면 여기에 표시됩니다.',
  emptyAction: '판매글 등록 화면 보기',
};

/** 입력 길이 제한 — 백엔드 itemrequest.controller.js와 같다. */
export const ITEM_LIMITS = { name: 100, setName: 100, cardNo: 30, imageUrl: 500, rejectReason: 500 } as const;
