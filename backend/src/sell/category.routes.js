const { Router } = require('express');
const sellController = require('./sell.controller');

const router = Router();

// GET /api/categories — 카테고리 트리 (ITEM-01)
router.get('/', sellController.categories);

module.exports = router;
