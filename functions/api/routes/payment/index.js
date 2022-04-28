const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.get('/list', checkUser, require('./paymentListGET'));

module.exports = router;
