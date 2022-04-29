const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { inferenceDB, weightDB } = require('../../../db');
const axios = require('axios');

module.exports = async (req, res) => {
  const { weightUuid, imageCount } = req.body;
  if (!weightUuid || !imageCount) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);

    // 요청 시 받은 uuid로 조회되는 weight가 있어야 함
    const weight = await weightDB.getWeightByUuid(client, weightUuid);
    if (!weight) {
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.WRONG_WEIGHT_UUID));
    }

    // inference에 추가
    const inference = await inferenceDB.addInference(client, weight.postId, imageCount, req.user.id);
    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_INFERENCE_SUCCESS, inference));

    // ML 서버에 image 요청
    // TODO: model url 이용한 inference, image count 1개 이상

    // let imageUrls = [];

    // const image = await axios.get('http://211.58.102.6:8000/api/inference/1', {
    //   withCredentials: true,
    // });

    // imageUrls.push(image.data);

    // await inferenceDB.updateInference(client, imageUrls, inference.id);
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);
    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
