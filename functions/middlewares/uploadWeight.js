const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const functions = require('firebase-functions');
const BusBoy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const dayjs = require('dayjs');
const util = require('../lib/util');
const statusCode = require('../constants/statusCode');
const responseMessage = require('../constants/responseMessage');
const dotenv = require('dotenv');

dotenv.config();

const uploadWeight = (req, res, next) => {
  // aws confing
  const s3 = new AWS.S3({ accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY, region: process.env.S3_REGION });

  const busboy = new BusBoy({ headers: req.headers });

  let chunks = [],
    fName,
    fType,
    fEncoding,
    weight;

  let fields = {};

  // uuid 생성
  const uuid = uuidv4();

  // req.body로 들어오는 key:value 페어들을 처리
  busboy.on('field', (fieldName, val) => {
    fields[fieldName] = val;
  });

  // req.body로 들어오는 파일 처리
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    if (mimetype !== 'application/octet-stream') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }

    // weight 확장자
    const weightExtension = filename.split('.')[filename.split('.').length - 1];

    // weight 파일 이름
    fName = `${dayjs().format('YYYYMMDD_HHmmss_')}${uuid}.${weightExtension}`;
    fType = mimetype;
    fEncoding = encoding;

    weight = { fName, fType, fEncoding };

    file.on('data', function (data) {
      chunks.push(data);
      console.log(chunks.length);
    });

    file.on('end', function () {
      console.log('File [' + filename + '] Finished');
    });
  });

  // AWS s3에 업로드
  busboy.on('finish', async () => {
    let promises = [];
    let s3WeightUrl;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: weight.fName,
      Body: Buffer.concat(chunks),
      ACL: 'public-read',
      ContentEncoding: weight.fEncoding,
      ContentType: weight.fType,
    };

    s3WeightUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${weight.fName}`;
    promises.push(s3.upload(params).promise());

    try {
      await Promise.all(promises);
      req.body = fields;
      req.weight = {
        url: s3WeightUrl,
        uuid: uuid,
      };
      req.pipe(busboy);
      next();
    } catch (err) {
      console.error(err);
      functions.logger.error(`[FILE UPLOAD ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`);
      return res.status(500).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
  });

  busboy.end(req.rawBody);
};

module.exports = uploadWeight;
