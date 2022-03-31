const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addWeight = async (client, postId, url, uuid) => {
  const { rows } = await client.query(
    `
      INSERT INTO weight
      (post_id, url, uuid)
      VALUES
      ($1, $2, $3)
      RETURNING *
      `,
    [postId, url, uuid],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getWeight = async (client, postId) => {
  const { rows } = await client.query(
    `
        SELECT * 
        FROM weight
        WHERE post_id = $1
        AND is_deleted = false
    `,
    [postId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addWeight, getWeight };
