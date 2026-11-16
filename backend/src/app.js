const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const communityRoutes = require('./community/community.routes');
const sellRoutes = require('./sell/sell.routes');
const itemCommunityRoutes = require('./itemcommunity/itemcommunity.routes');
const commentRoutes = require('./comment/comment.routes');
const reportRoutes = require('./report/report.routes');
const uploadRoutes = require('./sell/upload.routes');
const errorHandler = require('./middlewares/errorHandler');
const HttpError = require('./utils/HttpError');

const app = express();

// credentials: true — 프론트(다른 포트)에서 인증 쿠키를 주고받기 위해 필요
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 업로드한 이미지 파일 서빙. 파일명이 랜덤 UUID라 내용이 바뀌지 않으므로 오래 캐시해도 된다.
app.use('/uploads', express.static(env.uploadDir, { maxAge: '7d', index: false }));

app.get('/api/health', (req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', communityRoutes);
app.use('/api/listings', sellRoutes);
app.use('/api/listings', wishRoutes);
app.use('/api/items', itemCommunityRoutes);
app.use('/api/community', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes);

app.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', '요청한 API를 찾을 수 없습니다.')));
app.use(errorHandler);

module.exports = app;
