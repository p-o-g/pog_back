const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const addWeight = async (client, postId, url) => {
  const { rows } = await client.query(
    `
      INSERT INTO weight
      (post_id, url)
      VALUES
      ($1, $2)
      RETURNING *
      `,
    [postId, url],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

module.exports = { addWeight };
