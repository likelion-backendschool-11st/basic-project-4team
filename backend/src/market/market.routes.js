const { Router } = require('express');
const marketController = require('./market.controller');

// app.js에서 /api/market 아래에 붙인다 — 시세 대시보드 (MARKET-01~05). 로그인 없이 조회 가능.
const router = Router();

router.get('/filters', marketController.filters);
router.get('/insights', marketController.insights);
router.get('/chart', marketController.chart);
router.get('/top-gainers', marketController.topGainers);
router.get('/prices', marketController.prices);

module.exports = router;
