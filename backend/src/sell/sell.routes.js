const { Router } = require('express');
const sellController = require('./sell.controller');
const { optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/:listingId', optionalAuth, sellController.detail);

module.exports = router;
