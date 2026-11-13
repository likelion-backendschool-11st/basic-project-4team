const { Router } = require('express');
const reportController = require('./report.controller');
const { requireAuth } = require('../middlewares/auth');

const router = Router();

router.post('/', requireAuth, reportController.create);

module.exports = router;
