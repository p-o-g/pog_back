const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/:userId', require('./userGET'));
router.put('/', checkUser, require('./userPUT'));
router.delete('/', checkUser, require('./userDELETE'));

module.exports = router;
