const { Router } = require('express');
const wishController = require('./wish.controller');
const { requireAuth } = require('../middlewares/auth');

// app.js에서 /api/listings 아래에 붙인다 → /api/listings/:listingId/wishes
const router = Router();

router.post('/:listingId/wishes', requireAuth, wishController.add);
router.delete('/:listingId/wishes', requireAuth, wishController.remove);

module.exports = router;
