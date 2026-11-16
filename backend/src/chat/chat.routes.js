const { Router } = require('express');
const chatController = require('./chat.controller');
const { requireAuth } = require('../middlewares/auth');

// app.js에서 /api/chat 아래에 붙인다 (api-spec-all.md 10장). 모두 로그인 필요.
const router = Router();

router.use(requireAuth);
router.post('/rooms', chatController.openRoom);
router.get('/rooms', chatController.listRooms);
router.get('/rooms/:roomId', chatController.getRoom);
router.get('/rooms/:roomId/messages', chatController.listMessages);
router.post('/rooms/:roomId/messages', chatController.sendMessage);
router.put('/rooms/:roomId/read', chatController.markRead);
router.get('/unread-count', chatController.unreadCount);

module.exports = router;
