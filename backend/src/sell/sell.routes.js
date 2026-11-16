const { Router } = require('express');
const sellController = require('./sell.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, sellController.list);
router.get('/:listingId', optionalAuth, sellController.detail);
router.patch('/:listingId', requireAuth, sellController.update);
router.delete('/:listingId', requireAuth, sellController.remove);

module.exports = router;
