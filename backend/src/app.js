const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const postsRoutes = require('./routes/posts.routes');
const sellRoutes = require('./sell/sell.routes');
const errorHandler = require('./middlewares/errorHandler');
const HttpError = require('./utils/HttpError');

const app = express();

// credentials: true — 프론트(다른 포트)에서 인증 쿠키를 주고받기 위해 필요
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/listings', sellRoutes);

app.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', '요청한 API를 찾을 수 없습니다.')));
app.use(errorHandler);

module.exports = app;
