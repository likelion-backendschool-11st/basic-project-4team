/** 메일 본문 템플릿. 메일 클라이언트는 외부 CSS를 못 쓰므로 HTML은 인라인 스타일로 작성한다. */

const BRAND_COLOR = '#008254'; // 프론트 primary-container와 같은 색
const TEXT_COLOR = '#111827';
const MUTED_COLOR = '#6b7280';
const BOX_COLOR = '#f3f6f4';

/** 닉네임 같은 사용자 입력을 HTML에 넣기 전에 이스케이프한다. */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(title, bodyHtml) {
  return `<!doctype html>
<html lang="ko"><body style="margin:0;padding:24px;background:#ffffff;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:${TEXT_COLOR};">
  <div style="max-width:480px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:32px;">
    <div style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:${TEXT_COLOR};">RE:PICK</div>
    <h1 style="font-size:18px;margin:24px 0 12px;">${escapeHtml(title)}</h1>
    ${bodyHtml}
    <p style="font-size:12px;color:${MUTED_COLOR};margin-top:32px;line-height:1.6;">
      본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다. 계정 정보는 바뀌지 않습니다.<br>
      이 메일은 발신 전용입니다.
    </p>
  </div>
</body></html>`;
}

const PURPOSE_LABEL = {
  find_id: '아이디 찾기',
  reset_password: '비밀번호 재설정',
};

/** 아이디 찾기·비밀번호 찾기 인증코드 메일. */
function verificationCodeMail({ purpose, nickname, code, ttlMinutes }) {
  const label = PURPOSE_LABEL[purpose];
  const subject = `[RE:PICK] ${label} 인증코드 ${code}`;
  const text = [
    `${nickname}님, RE:PICK ${label} 인증코드입니다.`,
    '',
    `인증코드: ${code}`,
    '',
    `화면에 이 코드를 입력해 주세요. ${ttlMinutes}분 동안 유효하며, 5회 잘못 입력하면 다시 받아야 합니다.`,
    '본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다.',
  ].join('\n');
  const html = layout(
    `${label} 인증코드`,
    `<p style="font-size:14px;line-height:1.6;margin:0 0 20px;">${escapeHtml(nickname)}님, 아래 인증코드를 화면에 입력해 주세요.</p>
    <div style="background:${BOX_COLOR};border-radius:8px;padding:20px;text-align:center;">
      <div style="font-size:32px;font-weight:800;letter-spacing:8px;color:${BRAND_COLOR};font-family:Menlo,Consolas,monospace;">${code}</div>
    </div>
    <p style="font-size:13px;color:${MUTED_COLOR};line-height:1.6;margin:16px 0 0;">
      ${ttlMinutes}분 동안 유효하며, 5회 잘못 입력하면 인증코드를 다시 받아야 합니다.
    </p>`,
  );
  return { subject, text, html };
}

module.exports = { verificationCodeMail };
