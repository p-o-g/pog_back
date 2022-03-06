const _ = require('lodash');
const functions = require('firebase-functions');
const util = require('../../../lib/util');
const statusCode = require('../../../constants/statusCode');
const responseMessage = require('../../../constants/responseMessage');
const db = require('../../../db/db');
const { postDB, tagDB, relationPostTagDB } = require('../../../db');
const postImage = require('../../../constants/postImage');

module.exports = async (req, res) => {
  const { postId } = req.params;
  const { title, summary, description, ver, tagList } = req.body;

  let thumbnail = req.thumbnail;

  if (!postId || !title || !summary) {
    return res.status(statusCode.BAD_REQUEST).send(util.fail(statusCode.BAD_REQUEST, responseMessage.NULL_VALUE));
  }

  // tagList는 "tag1,tag2,tag3" 형식
  let addTagList = [];
  addTagList = tagList.split(',');

  if (addTagList.length > 10) {
    return res.status(statusCode.PRECONDITION_FAILED).send(util.fail(statusCode.PRECONDITION_FAILED, responseMessage.TAG_COUNT_FAIL));
  }

  let client;

  try {
    client = await db.connect(req);

    // thumbnail이 없을 경우 default image
    if (thumbnail.length === 0 || !thumbnail) {
      thumbnail[0] = postImage.DEFAULT_IMAGE_URL;
    }

    const updatedPost = await postDB.updatePost(client, title, description, ver, thumbnail[0], postId, summary);

    const deletedRelationPostTagList = await relationPostTagDB.deleteRelationPostTagList(client, postId);
    if (!deletedRelationPostTagList) return res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.NOT_FOUND, responseMessage.DELETE_RELATION_POST_TAG_FAIL));

    const addRelationPostTagList = [];
    const getTagList = await tagDB.getTagList(client);

    // 쿼리로 들어온 태그가 이미 존재하는 태그인지 확인 후
    // 존재하는 태그가 아니면 태그 생성, 존재하는 태그이면 post와 tag의 relation만 생성
    for (let i = 0; i < addTagList.length; i++) {
      let existingTag = _.find(getTagList, (tag) => tag.name === addTagList[i]);
      if (!existingTag) {
        let addTag = await tagDB.addTag(client, addTagList[i]);
        if (!addTag) {
          res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.ADD_ONE_TAG_FAIL));
        }
        addRelationPostTagList[i] = await relationPostTagDB.addRelationPostTag(client, updatedPost.id, addTag.id);
      } else {
        addRelationPostTagList[i] = await relationPostTagDB.addRelationPostTag(client, updatedPost.id, existingTag.id);
      }
    }

    // response 보내는 post에 tag 붙이기
    for (let i = 0; i < addRelationPostTagList.length; i++) {
      addRelationPostTagList[i].tag = _.find(getTagList, (tag) => tag.id === addRelationPostTagList[i].tagId);
    }

    updatedPost.tagList = _.filter(addRelationPostTagList, (r) => r.postId === updatedPost.id).map((o) => {
      return { id: o.tag.id, name: o.tag.name };
    });

    res.status(statusCode.OK).send(util.success(statusCode.OK, responseMessage.UPDATE_ONE_POST_SUCCESS, updatedPost));
  } catch (error) {
    functions.logger.error(`[ERROR] [${req.method.toUpperCase()}] ${req.originalUrl}`, `[CONTENT] ${error}`);
    console.log(error);

    res.status(statusCode.INTERNAL_SERVER_ERROR).send(util.fail(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
  } finally {
    client.release();
  }
};
