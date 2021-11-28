const express = require('express');
const { checkUser } = require('../../../middlewares/auth');
const router = express.Router();

const uploadImage = require('../../../middlewares/uploadImage');

router.get('/list', require('./postListGET'));
router.post('/', uploadImage, require('./postPOST'));
router.post('/tagSearch', require('./postTagSearchPOST'));
router.get('/search', require('./postSearchGET'));
router.get('/:postId', require('./postGET'));
router.put('/:postId', checkUser, uploadImage, require('./postPUT'));
router.delete('/:postId', checkUser, require('./postDELETE'));

module.exports = router;
