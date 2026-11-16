const { Router } = require('express');
const newSubscriberController = require('./newsubscriber.controller');
const { requireAuth } = require('../middlewares/auth');

// app.js에서 /api/users/me 아래에 붙인다 → GET /api/users/me/listing-limit
const router = Router();

router.get('/listing-limit', requireAuth, newSubscriberController.listingLimit);

module.exports = router;
