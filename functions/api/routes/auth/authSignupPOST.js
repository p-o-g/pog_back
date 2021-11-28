const admin = require('firebase-admin');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { userDB } = require('../../../db');

const jwtHandlers = require('../../../lib/jwtHandlers');
const { logger } = require('firebase-functions/v1');

module.exports = async (req, res) => {
  const { email, loginId, organization, password } = req.body;

  // request body가 잘못됐을 때
  if (!email || !loginId || !organization || !password) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  let client;

  try {
    const client = await db.connect();

    const userFirebase = await admin
      .auth()
      .createUser({ email, password, loginId })
      .then((user) => user)
      .catch((e) => {
        console.log(e);
        return { err: true, error: e };
      });

    if (userFirebase.err) {
      if (userFirebase.error.code === 'auth/email-already-exists') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND, '해당 이메일을 가진 유저가 있습니다.'));
      } else if (userFirebase.error.code === 'auth/invalid-password') {
        return res.status(statusCode.NOT_FOUND).json(util.fail(statusCode.NOT_FOUND, '비밀번호 형식이 잘못되었습니다. 패스워드는 최소 6자리의 문자열이어야 합니다.'));
      } else {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
      }
    }

    const idFirebase = userFirebase.uid;

    const user = await userDB.addUser(client, email, loginId, organization, idFirebase);
    const { accesstoken } = jwtHandlers.sign(user);

    console.log(user);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.CREATED_USER, { user, accesstoken }));
  } catch (error) {
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
