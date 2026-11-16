import type { MyListingStatus, PostBoard } from '../api/types';

/** 마이페이지 탭. URL ?tab= 값과 같다. */
export type MyPageTab = 'sales' | 'purchases' | 'wishes' | 'posts' | 'comments' | 'settings';

export const MY_PAGE_TABS: readonly MyPageTab[] = ['sales', 'purchases', 'wishes', 'posts', 'comments', 'settings'];

export const DEFAULT_MY_PAGE_TAB: MyPageTab = 'sales';

export const myPageCopy = {
  title: '마이페이지',
  loading: '내 정보를 불러오는 중...',
  loadError: '내 정보를 불러오지 못했습니다.',
  retry: '다시 시도',
  loginRequiredTitle: '로그인이 필요합니다.',
  loginRequiredMessage: '로그인하면 마이페이지로 돌아갑니다.',
  tabs: {
    sales: { label: '판매 내역', icon: 'sell' },
    purchases: { label: '구매 내역', icon: 'shopping_bag' },
    wishes: { label: '찜한 상품', icon: 'favorite' },
    posts: { label: '내 토론글', icon: 'forum' },
    comments: { label: '내 댓글', icon: 'chat_bubble' },
    settings: { label: '계정 설정', icon: 'manage_accounts' },
  } as Readonly<Record<MyPageTab, { readonly label: string; readonly icon: string }>>,
  tabsAria: '마이페이지 메뉴',
};

export const myProfileCopy = {
  joinedAt: (date: string) => `${date} 가입`,
  noEmail: '이메일 미등록',
  editProfile: '회원정보 수정',
  sell: '판매하기',
};

export const myStatsCopy = {
  selling: '판매중',
  reserved: '예약중',
  sold: '거래완료',
  purchased: '구매',
  soldAmountLabel: '누적 판매 금액',
  won: (amount: string) => `${amount}원`,
  count: (n: number) => n.toLocaleString('ko-KR'),
};

export const myListCopy = {
  pageSize: 10,
  windowSize: 5,
  loading: '불러오는 중...',
  error: '목록을 불러오지 못했습니다.',
  retry: '다시 시도',
  total: (n: number) => `총 ${n.toLocaleString('ko-KR')}개`,
  navAria: '페이지 이동',
  prevAria: '이전 페이지',
  nextAria: '다음 페이지',
  won: (amount: string) => `${amount}원`,
  statuses: { selling: '판매중', reserved: '예약중', sold: '거래완료' } as Readonly<Record<MyListingStatus, string>>,
};

export const mySalesCopy = {
  filters: [
    { value: null, label: '전체' },
    { value: 'selling', label: '판매중' },
    { value: 'reserved', label: '예약중' },
    { value: 'sold', label: '거래완료' },
  ] as readonly { readonly value: MyListingStatus | null; readonly label: string }[],
  filterAria: '판매 상태 필터',
  views: (n: number) => `조회 ${n.toLocaleString('ko-KR')}`,
  wishes: (n: number) => `찜 ${n.toLocaleString('ko-KR')}`,
  soldPrice: (amount: string) => `${amount}원에 판매`,
  createdAt: (date: string) => `${date} 등록`,
  emptyTitle: '등록한 판매글이 없어요',
  emptyBody: '갖고 있는 수집품을 올려 보세요.',
  emptyAction: '판매글 등록하기',
};

export const myPurchasesCopy = {
  soldAt: (date: string) => `${date} 구매`,
  seller: (nickname: string) => `판매자 ${nickname}`,
  withdrawnSeller: '탈퇴한 회원',
  deleted: '삭제된 판매글',
  emptyTitle: '구매한 상품이 없어요',
  emptyBody: '시세를 확인하고 안전하게 거래해 보세요.',
  emptyAction: '상품 둘러보기',
};

export const myWishesCopy = {
  wishedAt: (timeAgo: string) => `${timeAgo} 찜`,
  removeLabel: (title: string) => `${title} 찜 해제`,
  removeError: '찜을 해제하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  emptyTitle: '찜한 상품이 없어요',
  emptyBody: '마음에 드는 판매글의 하트를 눌러 모아 보세요.',
  emptyAction: '상품 둘러보기',
};

export const myPostsCopy = {
  boards: {
    pokemon: '포켓몬 카드',
    sneakers: '나이키 조던',
    onepiece: '원피스 카드',
    watch: '명품/시계',
    free: '자유',
  } as Readonly<Record<PostBoard, string>>,
  reactions: (n: number) => `반응 ${n}`,
  comments: (n: number) => `댓글 ${n}`,
  emptyTitle: '작성한 토론글이 없어요',
  emptyBody: '커뮤니티에서 시세와 정보를 나눠 보세요.',
  emptyAction: '커뮤니티 가기',
};

export const myCommentsCopy = {
  reply: '답글',
  likes: (n: number) => `좋아요 ${n}`,
  onPost: (title: string) => `${title}`,
  emptyTitle: '작성한 댓글이 없어요',
  emptyBody: '토론글에 의견을 남겨 보세요.',
  emptyAction: '커뮤니티 가기',
};

export const mySettingsCopy = {
  accountTitle: '계정 정보',
  loginIdLabel: '아이디',
  emailLabel: '이메일',
  joinedLabel: '가입일',
  nicknameTitle: '닉네임 변경',
  nicknameDescription: '닉네임은 30일에 한 번 바꿀 수 있습니다.',
  nicknameLabel: '새 닉네임',
  nicknamePlaceholder: '1~30자',
  nicknameError: '닉네임은 1~30자, 연속 공백 없이 입력해 주세요.',
  nicknameSame: '지금 쓰고 있는 닉네임과 같습니다.',
  nicknameLocked: (date: string) => `${date} 이후에 다시 바꿀 수 있습니다.`,
  nicknameSubmit: '닉네임 변경',
  nicknameSubmitting: '변경 중...',
  nicknameDone: '닉네임을 변경했습니다.',
  passwordTitle: '비밀번호 변경',
  passwordDescription: '현재 비밀번호를 확인한 뒤 새 비밀번호로 바꿉니다.',
  currentPasswordLabel: '현재 비밀번호',
  currentPasswordPlaceholder: '현재 비밀번호',
  currentPasswordError: '현재 비밀번호를 입력해 주세요.',
  newPasswordLabel: '새 비밀번호',
  newPasswordPlaceholder: '8자 이상',
  newPasswordError: '비밀번호는 8자 이상으로 입력해 주세요. (최대 72바이트)',
  newPasswordConfirmLabel: '새 비밀번호 확인',
  newPasswordConfirmPlaceholder: '새 비밀번호를 한 번 더 입력해 주세요',
  newPasswordConfirmError: '비밀번호가 일치하지 않습니다.',
  passwordToggleLabel: '비밀번호 표시 전환',
  passwordSubmit: '비밀번호 변경',
  passwordSubmitting: '변경 중...',
  passwordDone: '비밀번호를 변경했습니다.',
  forgotPassword: '현재 비밀번호를 잊으셨나요?',
};
