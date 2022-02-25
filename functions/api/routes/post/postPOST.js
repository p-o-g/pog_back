const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, tagDB, relationPostTagDB } = require('../../../db');

module.exports = async (req, res) => {
  const { userId, title, description, ver, tags } = req.body;

  const imageUrls = req.imageUrls;

  const tagsArray = tags.split('#');

  if (!userId) return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));

  let client;

  try {
    client = await db.connect(req);
    const post = await postDB.addPost(client, userId, title, description, ver, imageUrls);
    const addTags = [];
    const addRelationPostTags = [];
    let getTags = await tagDB.getTagList(client);
    let existingTag = [];
    existingTag.fill(0);

    // 쿼리로 들어온 태그가 이미 존재하는 태그인지 확인하고
    // 존재하는 태그가 아니면 새롭게 추가, 존재하는 태그이면 post와 tag의 relation만 생성
    for (let i = 0; i < tagsArray.length - 1; i++) {
      existingTag[i] = _.find(getTags, (tag) => tag.name === tagsArray[i + 1]);
    }

    for (let i = 0; i < tagsArray.length - 1; i++) {
      if (!existingTag[i]) {
        addTags[i] = await tagDB.addTag(client, tagsArray[i + 1]);
        addRelationPostTags[i] = await relationPostTagDB.addRelationPostTag(client, post.id, addTags[i].id);
      } else {
        addRelationPostTags[i] = await relationPostTagDB.addRelationPostTag(client, post.id, existingTag[i].id);
      }
    }

    // response 보내는 post에 tag 붙이기
    getTags = await tagDB.getTagList(client);

    for (let i = 0; i < addRelationPostTags.length; i++) {
      addRelationPostTags[i].tag = _.find(getTags, (tag) => tag.id === addRelationPostTags[i].tagId);
    }

    post.tags = addRelationPostTags.map((o) => o.tag);

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.ADD_ONE_POST_SUCCESS, post));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
