const { Router } = require('express');
const sellController = require('./sell.controller');
const { optionalAuth } = require('../middlewares/auth');

const router = Router();

// GET /api/items — 품목 검색 (ITEM-02).
// /api/items/trending, /api/items/:itemId(상세)는 itemcommunity 라우터가 맡는다.
// app.js에서 itemcommunity 라우터보다 먼저 연결하고, 여기서는 아래 경로만 처리해 나머지는 그대로 넘긴다.
router.get('/', sellController.searchItems);
// GET /api/items/:itemId/listings — 같은 품목의 판매글 목록 (ITEM-05). 로그인 시 isWished 포함.
router.get('/:itemId/listings', optionalAuth, sellController.itemListings);

module.exports = router;
