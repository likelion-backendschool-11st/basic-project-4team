const app = require('./app');
const env = require('./config/env');
const { verifyMailer } = require('./utils/mailer');
const chatSocket = require('./chat/chat.socket');

const server = app.listen(env.port, () => {
  console.log(`RE:PICK API 서버 실행 중: http://localhost:${env.port} (채팅 WebSocket: ws://localhost:${env.port}${chatSocket.PATH})`);
  verifyMailer();
});
chatSocket.attach(server);
