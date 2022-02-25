const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addRelationPostTag = async (client, postId, tagId) => {
  const { rows } = await client.query(
    `
    INSERT INTO relation_post_tag
    (post_id, tag_id)
    VALUES
    ($1, $2)
    RETURNING *
    `,
    [postId, tagId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getRelationPostTagList = async (client) => {
  const { rows } = await client.query(
    `
      SELECT * FROM relation_post_tag
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getRelationPostTagListByTagIds = async (client, tagIds) => {
  const { rows } = await client.query(
    `
        SELECT * FROM relation_post_tag
        WHERE tag_id IN (${tagIds.join()})
        WHERE is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getRelationPostTagList, getRelationPostTagListByTagIds, addRelationPostTag };
