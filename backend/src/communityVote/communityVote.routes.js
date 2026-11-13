const { Router } = require('express');
const communityVoteController = require('./communityVote.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/:itemId', optionalAuth, communityVoteController.summary);
router.post('/:itemId', requireAuth, communityVoteController.vote);

module.exports = router;
