const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);
router.post('/find-id/request', authController.requestFindId);
router.post('/find-id/verify', authController.verifyFindId);
router.post('/password-reset/request', authController.requestPasswordReset);
router.post('/password-reset/verify', authController.verifyPasswordReset);
router.post('/password-reset/confirm', authController.confirmPasswordReset);

module.exports = router;
