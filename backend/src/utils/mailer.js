const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = env.mail.smtp ? nodemailer.createTransport(env.mail.smtp) : null;

/** 메일 발송. SMTP 설정이 없으면(로컬 개발) 서버 콘솔에 내용을 출력한다. */
async function sendMail({ to, subject, text }) {
  if (!transporter) {
    console.log(`\n📧 [메일 미발송 — SMTP_HOST 없음]\n  받는 사람: ${to}\n  제목: ${subject}\n${text.replace(/^/gm, '  | ')}\n`);
    return;
  }
  await transporter.sendMail({ from: env.mail.from, to, subject, text });
}

/**
 * 응답을 기다리지 않고 메일을 보낸다. 메일 서버 응답 시간 차이로
 * "가입된 이메일인지"가 드러나지 않게 하기 위해서다. 실패는 로그로만 남긴다.
 */
function sendMailInBackground(mail) {
  sendMail(mail).catch((err) => console.error('메일 발송 실패:', err));
}

module.exports = { sendMail, sendMailInBackground };
