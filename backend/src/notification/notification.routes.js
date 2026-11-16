const { Router } = require('express');
const notificationController = require('./notification.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.use(requireAuth);
router.get('/', notificationController.list);
router.get('/unread-count', notificationController.unreadCount);
router.post('/read-all', notificationController.markAllRead);
router.patch('/:notificationId/read', notificationController.markRead);

module.exports = router;
