const { Router } = require('express');
const communityController = require('./community.controller');
const { requireAuth, optionalAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', optionalAuth, communityController.list);
router.get('/:id', optionalAuth, communityController.detail);
router.post('/', requireAuth, communityController.create);
router.patch('/:id', requireAuth, communityController.update);
router.delete('/:id', requireAuth, communityController.remove);

module.exports = router;
