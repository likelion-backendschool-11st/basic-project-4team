const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`RE:PICK API 서버 실행 중: http://localhost:${env.port}`);
});
