const { Router } = require('express');
const itemCommunityController = require('./itemcommunity.controller');

const router = Router();

// GET /api/items(품목 검색, ITEM-02)는 sell/item.routes.js가 맡는다 — app.js에서 이 라우터보다 먼저 연결.
// '/:itemId'보다 먼저 둔다 — 'trending'이 slug로 해석되지 않게.
router.get('/trending', itemCommunityController.trending);
router.get('/:itemId', itemCommunityController.detail);

module.exports = router;
