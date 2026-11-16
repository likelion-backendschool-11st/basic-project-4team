const { Router } = require('express');
const sellController = require('./sell.controller');
const { optionalAuth, requireAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, sellController.list);
router.post('/', requireAuth, sellController.create);
router.get('/:listingId', optionalAuth, sellController.detail);

module.exports = router;
