const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');

module.exports = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    client = await db.connect(req);

    // 휴대폰 번호 중복 검사
    const phoneUser = await userDB.getUserByPhone(client, phone);
    if (phoneUser) {
      return res.status(statusCode.CONFLICT).send(util.fail(statusCode.CONFLICT, '이미 가입된 번호입니다.'));
    }

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.AVAILABLE_PHONE, phone));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
