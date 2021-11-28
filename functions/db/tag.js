const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addTag = async (client, name) => {
  const { rows } = await client.query(
    `
    INSERT INTO tag
    (name)
    VALUES
    ($1)
    RETURNING *
    `,
    [name],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getAllTags = async (client) => {
  const { rows } = await client.query(
    `
      SELECT * FROM tag
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getTagByTagIds = async (client, tagIds) => {
  const { rows } = await client.query(
    `
        SELECT * FROM tag
        WHERE id IN (${tagIds.join()})
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getAllTags, getTagByTagIds, addTag };
