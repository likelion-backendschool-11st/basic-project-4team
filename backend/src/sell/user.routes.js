const { Router } = require('express');
const sellController = require('./sell.controller');
const { optionalAuth } = require('../middlewares/auth');

// app.js에서 /api/users 아래에 붙인다. /api/users/me/* 라우터보다 뒤에 연결해 'me'가 userId로 해석되지 않게 한다.
const router = Router();

// GET /api/users/:userId/listings — 판매자의 다른 판매글 (LISTING-10). 로그인 시 isWished 포함.
router.get('/:userId/listings', optionalAuth, sellController.sellerListings);

module.exports = router;
