const functions = require('firebase-functions');
const db = require('../db/db');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const { paymentDB } = require('../db');

const pay = async (req, res, next) => {
  // request body로 들어온 payment 정보를 받아옴
  const { price, content } = req.body;

  // price가 없을 시의 에러 처리입니다.
  if (!price) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;
  try {
    client = await db.connect(req);

    const payment = await paymentDB.getPaymentByUserId(client, req.user.id);

    if (price < 0 && payment.balance < Math.abs(price)) {
      const message = `결제 실패: ${Math.abs(price) - payment.balance}토큰 필요!`;
      return res.status(statusCode.PRECONDITION_FAILED).send(util.fail(statusCode.PRECONDITION_FAILED, message));
    } else {
      const balance = payment.balance + price;
      await paymentDB.addPayment(client, req.user.id, content, price, balance);
    }

    next();
  } catch (error) {
    console.log(error);
    functions.logger.error(`[AUTH ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, price);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};

module.exports = { pay };
