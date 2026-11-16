/**
 * 토론글 작성자 배지 기준 (REQ-BOARD-012). 품목(글의 itemId) 단위로 판매글(listings)에서 계산한다.
 * 저장된 배지가 없으므로 판매글 상태가 바뀌면(예: #53 거래완료 처리) 다음 조회부터 바로 반영된다.
 *
 * - trade 거래 인증: 이 품목 거래완료(status = sold) 판매글의 판매자 또는 구매자로 TRADE_MIN_COUNT건 이상
 * - owner 보유자:    이 품목의 판매중·예약중 판매글이 있거나, 거래완료 판매글의 구매자
 * 삭제된 판매글은 세지 않는다.
 */
const BADGE = Object.freeze({ OWNER: 'owner', TRADE: 'trade' });

/** 응답 author.badges 순서. */
const BADGE_ORDER = [BADGE.OWNER, BADGE.TRADE];

/** 거래 인증에 필요한 이 품목 거래완료 건수. */
const TRADE_MIN_COUNT = 1;

module.exports = { BADGE, BADGE_ORDER, TRADE_MIN_COUNT };
