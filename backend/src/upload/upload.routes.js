const { Router } = require('express');
const uploadController = require('./upload.controller');
const { requireAuth } = require('../middlewares/auth');
const { singlePostImage, singleChatImage } = require('./upload.middleware');

const router = Router();

// 로그인 확인을 먼저 해서 비로그인 요청은 파일을 저장하지 않는다.
router.post('/post-images', requireAuth, singlePostImage, uploadController.postImage);
router.post('/chat-images', requireAuth, singleChatImage, uploadController.chatImage);

module.exports = router;
