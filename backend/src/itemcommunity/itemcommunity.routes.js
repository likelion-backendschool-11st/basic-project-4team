const { Router } = require('express');
const itemCommunityController = require('./itemcommunity.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/:itemId', itemCommunityController.detail);
router.get('/:itemId/sentiments', optionalAuth, itemCommunityController.sentiment);
router.post('/:itemId/sentiments', requireAuth, itemCommunityController.voteSentiment);

module.exports = router;
