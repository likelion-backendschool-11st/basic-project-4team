const { Router } = require('express');
const sellController = require('./sell.controller');
const { uploadSingleImage } = require('./sell.upload');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

// 로그인 확인을 먼저 해서 비로그인 요청은 파일을 받기 전에 끊는다.
router.post('/images', requireAuth, uploadSingleImage, sellController.uploadImage);

module.exports = router;
