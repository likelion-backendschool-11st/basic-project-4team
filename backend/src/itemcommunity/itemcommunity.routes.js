const { Router } = require('express');
const itemCommunityController = require('./itemcommunity.controller');

const router = Router();

router.get('/:itemId', itemCommunityController.detail);

module.exports = router;
