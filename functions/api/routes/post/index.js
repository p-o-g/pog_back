const express = require('express');
const router = express.Router();

router.get('/list', require('./postListGET'));
router.post('/', require('./postPOST'));
router.post('/tagSearch', require('./postTagSearchPOST'));
router.get('/:postId', require('./postGET'));
router.put('/:postId', require('./postPUT'));
router.delete('/:postId', require('./postDELETE'));

module.exports = router;
