const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { weightDB, postDB } = require('../../../db');

module.exports = async (req, res) => {
  const { postId } = req.body;

  let weight = req.weight;

  if (!postId || !weight) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    const existingPost = await postDB.getPostById(client, postId);

    // 요청한 postId를 가지는 게시글이 없을 때
    if (!existingPost) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NO_POST));
    }

    // 요청한 postId의 작성자가 weight 업로드를 시도하는 유저가 아닐 때
    if (existingPost.userId !== req.user.id) {
      return res.status(statusCode.FORBIDDEN).send(util.fail(statusCode.FORBIDDEN, responseMessage.FORBIDDEN));
    }

    // 모델 웨이트 DB에 저장
    const uploadedWeight = await weightDB.addWeight(client, postId, weight);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_WEIGHT_SUCCESS, uploadedWeight));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
