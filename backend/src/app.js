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
const communityVoteRoutes = require('./communityVote/communityVote.routes');
const wishRoutes = require('./wish/wish.routes');
const myWishRoutes = require('./wish/wish.me.routes');
const mypageRoutes = require('./mypage/mypage.routes');
const notificationRoutes = require('./notification/notification.routes');
const uploadRoutes = require('./sell/upload.routes');
const itemRoutes = require('./sell/item.routes');
const categoryRoutes = require('./sell/category.routes');
const userListingRoutes = require('./sell/user.routes');
const postUploadRoutes = require('./upload/upload.routes');
const newSubscriberItemRoutes = require('./newsubscriber/newsubscriber.item.routes');
const newSubscriberMeRoutes = require('./newsubscriber/newsubscriber.me.routes');
const chatRoutes = require('./chat/chat.routes');
const itemRequestRoutes = require('./itemrequest/itemrequest.routes');
const marketRoutes = require('./market/market.routes');
const { serveUploads } = require('./file/file.storage');
const errorHandler = require('./middlewares/errorHandler');
const HttpError = require('./utils/HttpError');

const app = express();

// credentials: true — 프론트(다른 포트)에서 인증 쿠키를 주고받기 위해 필요
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 파일(이미지) 서버 — 업로드한 판매글·토론글·채팅 사진과 시드 사진 서빙 (src/file/file.storage.js)
app.use('/uploads', serveUploads());

app.get('/api/health', (req, res) => res.json({ data: { status: 'ok' } }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', communityRoutes);
app.use('/api/listings', sellRoutes);
app.use('/api/listings', wishRoutes);
app.use('/api/categories', categoryRoutes); // GET / (ITEM-01)
app.use('/api/items', itemRoutes); // GET / 품목 검색 (ITEM-02) — itemCommunityRoutes보다 먼저
app.use('/api/items', newSubscriberItemRoutes); // GET /:itemId/market-price (ITEM-04)
app.use('/api/items', itemCommunityRoutes); // GET /trending, GET /:itemId (ITEM-03)
app.use('/api/users/me', myWishRoutes); // GET /wishes
app.use('/api/users/me', mypageRoutes); // 마이페이지: summary, listings, purchases, posts, comments, nickname, password
app.use('/api/users/me', newSubscriberMeRoutes); // GET /listing-limit
app.use('/api/users/me', itemRequestRoutes.meRouter); // GET /item-requests (ITEM-07)
app.use('/api/users', userListingRoutes); // GET /:userId/listings (LISTING-10) — /api/users/me 라우터보다 뒤
app.use('/api/item-requests', itemRequestRoutes.router); // POST / 품목 등록 요청 (ITEM-06)
app.use('/api/admin', itemRequestRoutes.adminRouter); // 관리자: GET·PATCH /item-requests (ITEM-08·09, #34)
app.use('/api/notifications', notificationRoutes);
app.use('/api/community', commentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/uploads', uploadRoutes); // POST /images (판매글)
app.use('/api/uploads', postUploadRoutes); // POST /post-images (토론글), /chat-images (채팅)
app.use('/api/chat', chatRoutes); // 채팅 REST (실시간 수신은 server.js의 /ws/chat)
app.use('/api/communityVote', communityVoteRoutes);
app.use('/api/market', marketRoutes); // 시세 대시보드 (MARKET-01~05)

app.use((req, res, next) => next(new HttpError(404, 'NOT_FOUND', '요청한 API를 찾을 수 없습니다.')));
app.use(errorHandler);

module.exports = app;
