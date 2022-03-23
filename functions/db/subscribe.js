const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const updateSubscribe = async (client, userId, postId) => {
  const { rows: existingRows } = await client.query(
    `
        SELECT * FROM subscribe
        WHERE user_id = $1
        AND post_id = $2
        `,
    [userId, postId],
  );

  if (existingRows.length === 0) {
    const { rows: addRows } = await client.query(
      `
          INSERT INTO subscribe
          (user_id, post_id)
          VALUES
          ($1, $2)
          RETURNING *
          `,
      [userId, postId],
    );
    return convertSnakeToCamel.keysToCamel(addRows[0]);
  } else {
    const { rows } = await client.query(
      `
            UPDATE subscribe 
            SET updated_at = now(), is_deleted = CASE WHEN is_deleted = true THEN false ELSE true END
            WHERE user_id = $1
            AND post_id = $2
            RETURNING *
            `,
      [userId, postId],
    );
    return convertSnakeToCamel.keysToCamel(rows[0]);
  }
};

module.exports = { updateSubscribe };
