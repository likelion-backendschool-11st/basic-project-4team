const { Router } = require('express');
const itemCommunityController = require('./itemcommunity.controller');

const router = Router();

// '/:itemId'보다 먼저 둔다 — 'trending'이 slug로 해석되지 않게.
router.get('/', itemCommunityController.search);
router.get('/trending', itemCommunityController.trending);
router.get('/:itemId', itemCommunityController.detail);

module.exports = router;
