const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, tagDB, userDB } = require('../../../db');

module.exports = async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;
  try {
    client = await db.connect(req);

    const writer = await userDB.getUserById(client, userId);
    const relationPostTagList = await relationPostTagDB.getRelationPostTagList(client);
    let postList;
    postList = await postDB.getPostListByUserId(client, userId);

    postList = await Promise.all(
      postList.map(async (post) => {
        post.tagList = _.filter(relationPostTagList, (r) => r.postId === post.id).map((o) => {
          return { id: o.tagId, name: o.tagName };
        });
        return {
          id: post.id,
          thumbnail: post.thumbnail,
          title: post.title,
          writer: {
            id: writer.id,
            nickname: writer.nickname,
          },
          summary: post.summary,
          tagList: post.tagList,
        };
      }),
    );

    const data = {
      writer: {
        id: writer.id,
        nickname: writer.nickname,
      },
      postList,
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
