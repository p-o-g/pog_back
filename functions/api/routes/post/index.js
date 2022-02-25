const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

const uploadImage = require('../../../middlewares/uploadImage');

router.post('/', uploadImage, require('./postPOST'));
router.get('/list', require('./postListGET'));
router.get('/:postId', require('./postGET'));
router.put('/:postId', checkUser, uploadImage, require('./postPUT'));
router.delete('/:postId', checkUser, require('./postDELETE'));
// router.post('/tagSearch', require('./postTagSearchPOST'));

module.exports = router;
