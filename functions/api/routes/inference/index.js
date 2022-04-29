const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const { pay } = require('../../../middlewares/pay');
const router = express.Router();

router.post('/', checkUser, pay, require('./inferencePOST'));

module.exports = router;
