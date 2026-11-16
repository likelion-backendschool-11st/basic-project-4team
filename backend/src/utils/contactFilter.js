/**
 * 채팅 연락처 필터 (CHAT-04, 채팅창 안내 "전화번호, 외부 메신저 유도는 자동 필터링됩니다").
 * 안전거래(에스크로) 밖으로 거래를 빼는 사기를 막기 위해 전화번호와 외부 메신저 유도를 `*`로 가린다.
 * 계좌번호는 직거래 송금에 필요해서 가리지 않는다 (REQ-DETAIL-014).
 *
 * - 전화번호: 휴대폰(010 등), 지역번호(02, 031 ...), 070·050. 숫자 사이의 공백·점·하이픈도 잡는다.
 *   숫자만 `*`로 바꾸고 구분자는 남긴다 (010-1234-5678 → ***-****-****).
 * - 메신저: 카톡·카카오톡·오픈채팅·텔레그램·위챗 등과 바로 뒤에 붙은 아이디, 초대 링크.
 *   "텔레"(텔레비전), "라인"(라인업)처럼 정상 단어와 겹치는 말은 넣지 않는다.
 */

const SEP = '[\\s.\\-]*';
const digits = (n) => `(?:${SEP}\\d){${n}}`;

// 앞뒤가 숫자가 아닐 때만 — 긴 숫자(가격·주문번호)의 일부를 전화번호로 보지 않는다.
const PHONE = new RegExp(
  [
    `0${SEP}1${SEP}[016789]${digits('7,8')}`, // 휴대폰 010-1234-5678
    `0${SEP}2${digits('7,8')}`, // 서울 02-123-4567
    `0${SEP}[3-6]${SEP}[1-5]${digits('7,8')}`, // 지역번호 031-123-4567
    `0${SEP}[57]${SEP}0${digits('7,9')}`, // 070·050x
  ]
    .map((p) => `(?<!\\d)${p}(?!\\d)`)
    .join('|'),
  'g',
);

const MESSENGERS = ['카카오톡', '카톡', '오픈카톡', '오픈채팅', '오픈챗', '텔레그램', '위챗', 'kakaotalk', 'kakao', 'telegram', 'wechat'];
const ID_WORD = '(?:아이디|아뒤|아디|id)';
// 메신저 이름 + (아이디)? + (: @abc123)? — 아이디는 영문·숫자·_.- 2자 이상
const MESSENGER = new RegExp(
  `(?:${MESSENGERS.join('|')})(?:\\s*${ID_WORD})?(?:\\s*[:：]?\\s*@?[A-Za-z0-9_.\\-]{2,30})?`,
  'gi',
);
const INVITE_LINK = /(?:https?:\/\/)?(?:open\.kakao\.com|pf\.kakao\.com|qr\.kakao\.com|t\.me|telegram\.me|line\.me)\/\S*/gi;

/** 공백은 남기고 나머지 글자를 `*`로. */
const star = (text) => text.replace(/\S/g, '*');

/** 전화번호·외부 메신저 유도를 가린다. 결과와 가린 곳이 있었는지(filtered)를 돌려준다. */
function maskContact(text) {
  if (typeof text !== 'string') return { text, filtered: false };
  const masked = text
    .replace(INVITE_LINK, star)
    .replace(PHONE, (m) => m.replace(/\d/g, '*'))
    .replace(MESSENGER, star);
  return { text: masked, filtered: masked !== text };
}

module.exports = { maskContact };
