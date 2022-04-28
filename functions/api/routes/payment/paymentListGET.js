const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { paymentDB } = require('../../../db');

module.exports = async (req, res) => {
  let client;

  try {
    client = await db.connect(req);

    const paymentList = await paymentDB.getPaymentListByUserId(client, req.user.id);

    // 가장 최근 토큰 조회
    let currentToken;
    if (paymentList.length !== 0) {
      currentToken = paymentList[paymentList.length - 1].balance;
    } else {
      currentToken = 0;
    }

    const data = {
      currentToken: {
        userNickname: req.user.nickname,
        currentToken: currentToken,
      },
      paymentList,
    };

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.READ_ALL_PAYMENTS_SUCCESS, data));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
