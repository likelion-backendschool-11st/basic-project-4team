const { Router } = require('express');
const postsController = require('../controllers/posts.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, postsController.list);
router.get('/:id', optionalAuth, postsController.detail);
router.post('/', requireAuth, postsController.create);
router.patch('/:id', requireAuth, postsController.update);
router.delete('/:id', requireAuth, postsController.remove);

module.exports = router;
