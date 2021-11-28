const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

router.get('/:userId', require('./userGET'));
router.put('/:userId', checkUser, require('./userPUT'));
router.delete('/:userId', checkUser, require('./userDELETE'));

module.exports = router;
