/**
 * 욕설 필터 (REQ-COMMON-006, REQ-BWRITE-004, REQ-BEDIT-003, REQ-BDETAIL-010).
 * 토론글 제목·본문·투표 선택지와 댓글을 저장하기 전에 욕설을 같은 길이의 `*`로 가린다.
 * 요청을 거절하지 않고 가려서 저장한다 — 글자 수가 그대로라 길이 제한에도 영향이 없다.
 *
 * - 글자 사이에 숫자·기호를 끼운 경우도 잡는다 (씨1발, 씨.발, ㅅ-ㅂ). 띄어쓰기는 잡지 않는다
 *   ("역시 발매"처럼 정상 문장이 걸리기 때문).
 * - 영어는 대소문자를 구분하지 않는다.
 * - 정상 단어와 겹치는 말은 except(바로 뒤에 오는 글자)로 뺀다. 예: 시발점·시발역
 * - 단어를 추가할 때는 정상 단어에 들어가는지 먼저 확인한다 (예: "시바"는 시바견, "씹"은 씹다, "꺼져"는 불이 꺼져라서 넣지 않음. "등신"은 등신대를 뺀다).
 */

const WORDS = [
  // 한국어
  { word: '씨발' }, { word: '씨빨' }, { word: '씨팔' }, { word: '씨바' },
  { word: '시발', except: ['점', '역', '택', '차'] }, { word: '시팔' },
  { word: '병신' }, { word: '븅신' }, { word: '빙신' }, { word: '등신', except: ['대'] },
  { word: '개새끼' }, { word: '개새기' }, { word: '개색기' }, { word: '개색끼' }, { word: '개쉐이' },
  { word: '미친놈' }, { word: '미친년' }, { word: '미친새끼' }, { word: '또라이' },
  { word: '좆' }, { word: '존나' }, { word: '지랄' }, { word: '닥쳐' },
  { word: '썅' }, { word: '쌍년' }, { word: '엠창' }, { word: '느금마' }, { word: '니애미' }, { word: '니미럴' },
  // 초성
  { word: 'ㅅㅂ' }, { word: 'ㅆㅂ' }, { word: 'ㅂㅅ' }, { word: 'ㅄ' }, { word: 'ㅈㄴ' }, { word: 'ㅈㄹ' },
  // 영어
  { word: 'fuck' }, { word: 'shit' }, { word: 'bitch' }, { word: 'asshole' }, { word: 'cunt' },
];

// 글자 사이에 끼울 수 있는 것: 글자·공백이 아닌 문자(숫자·기호) 0~2개
const GAP = '[^\\p{L}\\s]{0,2}';

const escape = (ch) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function toPattern({ word, except }) {
  const body = [...word].map(escape).join(GAP);
  return except?.length ? `${body}(?!${except.map(escape).join('|')})` : body;
}

// 긴 단어부터 맞춰야 "미친새끼"가 "미친놈"보다 먼저 통째로 가려진다.
const PATTERN = new RegExp(
  [...WORDS].sort((a, b) => b.word.length - a.word.length).map(toPattern).join('|'),
  'giu',
);

/** 욕설을 같은 길이의 `*`로 바꾼 문자열. 문자열이 아니면(null 등) 그대로 돌려준다. */
function maskProfanity(text) {
  if (typeof text !== 'string') return text;
  return text.replace(PATTERN, (match) => '*'.repeat([...match].length));
}

/** 욕설이 들어 있는지. */
function hasProfanity(text) {
  return typeof text === 'string' && maskProfanity(text) !== text;
}

module.exports = { maskProfanity, hasProfanity };
