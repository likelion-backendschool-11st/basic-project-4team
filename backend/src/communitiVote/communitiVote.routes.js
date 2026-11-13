const { Router } = require('express');
const communitiVoteController = require('./communitiVote.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/:itemId', optionalAuth, communitiVoteController.summary);
router.post('/:itemId', requireAuth, communitiVoteController.vote);

module.exports = router;
