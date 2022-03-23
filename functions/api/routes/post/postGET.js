const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, userDB } = require('../../../db');

module.exports = async (req, res) => {
  const { postId } = req.params;
  if (!postId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    const relationPostTagList = await relationPostTagDB.getRelationPostTagList(client);
    let post;
    post = await postDB.getPostById(client, postId);

    const writer = await userDB.getUserById(client, post.userId);
    post.tagList = _.filter(relationPostTagList, (r) => r.postId === post.id).map((o) => {
      return { id: o.tagId, name: o.tagName };
    });

    post = {
      id: post.id,
      thumbnail: post.thumbnail,
      title: post.title,
      updatedAt: post.updatedAt,
      writer: {
        id: writer.id,
        nickname: writer.nickname,
      },
      ver: post.ver,
      summary: post.summary,
      tagList: post.tagList,
      description: post.description,
      modelUuid: post.modelUuid,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ONE_POST_SUCCESS, post));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
