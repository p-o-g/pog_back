const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');

module.exports = async (req, res) => {
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // 닉네임 중복 검사
    const nicknameUser = await userDB.getUserByNickname(client, nickname);
    if (nicknameUser) {
      return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 닉네임입니다.'));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.AVAILABLE_NICKNAME, nickname));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
