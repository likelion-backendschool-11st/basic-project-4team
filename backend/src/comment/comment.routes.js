const { Router } = require('express');
const commentController = require('./comment.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/posts/:postId/comments', optionalAuth, commentController.list);
router.post('/posts/:postId/comments', requireAuth, commentController.create);
router.get('/comments/:commentId/replies', optionalAuth, commentController.replies);
router.patch('/comments/:commentId', requireAuth, commentController.update);
router.delete('/comments/:commentId', requireAuth, commentController.remove);
router.put('/comments/:commentId/like', requireAuth, commentController.like);
router.delete('/comments/:commentId/like', requireAuth, commentController.unlike);

module.exports = router;
