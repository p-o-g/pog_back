const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, tagDB } = require('../../../db');

module.exports = async (req, res) => {
  const { searchWord } = req.query;
  if (!searchWord) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const tags = await tagDB.getAllTags(client);
    const relationPostTags = await relationPostTagDB.getAllRelationPostTags(client);
    const posts = await postDB.getPostsBySearchWord(client, searchWord);

    for (let i = 0; i < relationPostTags.length; i++) {
      relationPostTags[i].tag = _.find(tags, (tag) => tag.id === relationPostTags[i].tagId);
    }

    posts.tags = _.filter(relationPostTags, (pt) => pt.postId === posts.id).map((o) => o.tag);

    // 검색 결과 전체 포스트 개수 반환

    const data = {
      postsCount: posts.length,
      posts,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_POSTS_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
