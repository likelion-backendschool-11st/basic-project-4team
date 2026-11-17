const { Router } = require('express');
const itemRequestController = require('./itemrequest.controller');
const { requireAuth } = require('../middlewares/auth');

// app.js에서 /api/item-requests 아래에 붙인다.
const router = Router();
router.post('/', requireAuth, itemRequestController.create);

// app.js에서 /api/users/me 아래에 붙인다.
const meRouter = Router();
meRouter.get('/item-requests', requireAuth, itemRequestController.listMine);

module.exports = { router, meRouter };
