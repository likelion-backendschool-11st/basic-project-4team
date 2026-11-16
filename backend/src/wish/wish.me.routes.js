const { Router } = require('express');
const wishController = require('./wish.controller');
const { requireAuth } = require('../middlewares/auth');

// app.js에서 /api/users/me 아래에 붙인다 → /api/users/me/wishes
const router = Router();

router.get('/wishes', requireAuth, wishController.listMine);

module.exports = router;
