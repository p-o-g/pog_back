const express = require('express');
const router = express.Router();
const { checkUser } = require('../../../middlewares/auth');

router.post('/signup', require('./authSignupPOST'));
router.post('/login/email', require('./authLoginEmailPOST'));
router.post('/logout', checkUser, require('./authLogoutPOST'));

module.exports = router;
