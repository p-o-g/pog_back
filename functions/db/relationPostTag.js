const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getAllRelationPostTags = async (client) => {
  const { rows } = await client.query(
    `
      SELECT * FROM relation_post_tag
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getRelationPostTagByTagIds = async (client, tagIds) => {
  const { rows } = await client.query(
    `
        SELECT * FROM relation_post_tag
        WHERE tag_id IN (${tagIds.join()})
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getAllRelationPostTags, getRelationPostTagByTagIds };
