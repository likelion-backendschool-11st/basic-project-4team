const { Router } = require('express');
const newSubscriberController = require('./newsubscriber.controller');

// app.js에서 /api/items 아래에 붙인다 → GET /api/items/:itemId/market-price (ITEM-04)
// GET /api/items/:itemId(상세)와 경로 깊이가 달라 서로 겹치지 않는다.
const router = Router();

router.get('/:itemId/market-price', newSubscriberController.marketPrice);

module.exports = router;
