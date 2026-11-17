const app = require('./app');
const env = require('./config/env');
const { verifyMailer } = require('./utils/mailer');
const chatSocket = require('./chat/chat.socket');
const { ensureUploadDirs } = require('./file/file.storage');
const { scheduleOrphanCleanup } = require('./file/file.cleanup');

ensureUploadDirs();

const server = app.listen(env.port, () => {
  console.log(`RE:PICK API 서버 실행 중: http://localhost:${env.port} (채팅 WebSocket: ws://localhost:${env.port}${chatSocket.PATH})`);
  verifyMailer();
});
chatSocket.attach(server);
// 업로드만 하고 쓰지 않은 사진을 하루 1번 파일과 함께 지운다 (#16)
scheduleOrphanCleanup();
