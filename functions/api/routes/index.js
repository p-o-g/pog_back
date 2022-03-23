const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/post', require('./post'));
router.use('/subscribe', require('./subscribe'));

module.exports = router;
