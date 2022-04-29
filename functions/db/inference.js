const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addInference = async (client, postId, imageCount, userId) => {
  const { rows } = await client.query(
    `
      INSERT INTO inference
      (post_id, image_count, user_id)
      VALUES
      ($1, $2, $3)
      RETURNING *
      `,
    [postId, imageCount, userId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updateInference = async (client, imageUrls, id) => {
  const { rows } = await client.query(
    `
      UPDATE inference
      SET image_urls = $2
      WHERE id = $1
      RETURNING *
      `,
    [id, imageUrls],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addInference, updateInference };
