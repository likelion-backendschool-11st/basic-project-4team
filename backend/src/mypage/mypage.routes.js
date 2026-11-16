const { Router } = require('express');
const mypageController = require('./mypage.controller');
const { requireAuth } = require('../middlewares/auth');

// app.js에서 /api/users/me 아래에 붙인다. 모두 로그인 필요.
const router = Router();

router.use(requireAuth);
router.get('/summary', mypageController.summary);
router.get('/listings', mypageController.listings);
router.get('/purchases', mypageController.purchases);
router.get('/posts', mypageController.posts);
router.get('/comments', mypageController.comments);
router.patch('/nickname', mypageController.changeNickname);
router.patch('/password', mypageController.changePassword);

module.exports = router;
