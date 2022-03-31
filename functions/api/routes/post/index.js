const express = require('express');
const { checkUser, checkUserInfo } = require('../../../middlewares/auth');
const router = express.Router();

const uploadImage = require('../../../middlewares/uploadWeight');
const uploadWeight = require('../../../middlewares/uploadWeight');

router.post('/', checkUser, uploadImage, require('./postPOST'));
router.post('/weight', checkUser, uploadWeight, require('./postWeightPOST'));
router.put('/weight', checkUser, uploadWeight, require('./postWeightPUT'));
router.get('/list', checkUserInfo, require('./postListGET'));
router.get('/:postId', checkUserInfo, require('./postGET'));
router.put('/:postId', checkUser, uploadImage, require('./postPUT'));
router.delete('/:postId', checkUser, require('./postDELETE'));
// router.post('/tagSearch', require('./postTagSearchPOST'));

module.exports = router;
