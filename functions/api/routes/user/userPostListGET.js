const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, relationPostTagDB, userDB } = require('../../../db');

module.exports = async (req, res) => {
  const { userId } = req.params;
  let { filter, search } = req.query;

  if (!userId || !filter) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;
  try {
    client = await db.connect(req);

    const relationPostTagList = await relationPostTagDB.getRelationPostTagList(client);
    const user = await userDB.getUserById(client, userId);

    let postList;

    // search 값이 없을 때, 빈 스트링으로 조회하면 전체 결과 나옴
    if (!search) {
      search = '';
    }

    // filter에 따라 다른 쿼리로 postList 조회
    if (filter === 'upload') {
      postList = await postDB.getPostListByUserIdSearch(client, userId, search);
    } else if (filter === 'subscribe') {
      postList = await postDB.getPostListBySubscribeSearch(client, userId, search);
    } else {
      // TODO: 추후 filter 값에 이용 모델 보기도 추가
      return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.WRONG_FILTER));
    }

    // postList data
    postList = postList.map((post) => {
      post.tagList = _.filter(relationPostTagList, (r) => r.postId === post.id).map((o) => {
        return { id: o.tagId, name: o.tagName };
      });
      return {
        id: post.id,
        thumbnail: post.thumbnail,
        title: post.title,
        writer: {
          id: post.userId,
          nickname: post.userNickname,
        },
        summary: post.summary,
        tagList: post.tagList,
      };
    });

    // response로 보낼 data, 해당 user의 정보와 postList를 보냄
    const data = {
      user: {
        id: user.id,
        nickname: user.nickname,
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
