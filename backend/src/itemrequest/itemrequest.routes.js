const { Router } = require('express');
const itemRequestController = require('./itemrequest.controller');
const { requireAuth, requireAdmin } = require('../middlewares/auth');

// app.js에서 /api/item-requests 아래에 붙인다.
const router = Router();
router.post('/', requireAuth, itemRequestController.create);

// app.js에서 /api/users/me 아래에 붙인다.
const meRouter = Router();
meRouter.get('/item-requests', requireAuth, itemRequestController.listMine);

// app.js에서 /api/admin 아래에 붙인다 — 관리자(토큰 role = admin)만, 아니면 403 (ITEM-08·09, #34).
const adminRouter = Router();
adminRouter.use('/item-requests', requireAuth, requireAdmin);
adminRouter.get('/item-requests', itemRequestController.adminList);
adminRouter.patch('/item-requests/:id', itemRequestController.adminProcess);

module.exports = { router, meRouter, adminRouter };
