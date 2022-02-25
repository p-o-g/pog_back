const _ = require('lodash');
const convertSnakeToCamel = require('../lib/convertSnakeToCamel');

const getPostList = async (client) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post p
    WHERE is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostById = async (client, postId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post p
    WHERE id = $1
    AND is_deleted = false
    `,
    [postId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

// TODO : tag도 추가 가능하도록
const addPost = async (client, userId, title, description, ver, imageUrls) => {
  const { rows } = await client.query(
    `
    INSERT INTO post
    (user_id, title, description, ver, image_urls)
    VALUES
    ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [userId, title, description, ver, imageUrls],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const updatePost = async (client, title, description, ver, imageUrls, postId) => {
  const { rows: existingRows } = await client.query(
    `
    SELECT * FROM post p
    WHERE id = $1
    AND is_deleted = false
    `,
    [postId],
  );

  if (existingRows.length === 0) return false;

  const data = _.merge({}, convertSnakeToCamel.keysToCamel(existingRows[0]), { title, description, ver, imageUrls });

  const { rows } = await client.query(
    `
    UPDATE post p
    SET title = $1, description = $2, ver = $3, image_urls = $4, updated_at = now()
    WHERE id = $5
    RETURNING * 
    `,
    [data.title, data.description, data.ver, data.imageUrls, postId],
  );
  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const deletePost = async (client, postId) => {
  const { rows } = await client.query(
    `
    UPDATE post p
    SET is_deleted = true, updated_at = now()
    WHERE id = $1
    RETURNING *
    `,
    [postId],
  );

  return convertSnakeToCamel.keysToCamel(rows[0]);
};

const getPostListByUserId = async (client, userId) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post
    WHERE user_id = $1
    AND is_deleted = false
    `,
    [userId],
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListByUserIds = async (client, userIds) => {
  if (userIds.length < 1) return [];
  const { rows } = await client.query(
    `
    SELECT * FROM post
    WHERE user_id IN (${userIds.join()})
    AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListByIds = async (client, postIds) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post
    WHERE id IN (${postIds.join()})
    AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

const getPostListBySearch = async (client, search) => {
  const { rows } = await client.query(
    `
    SELECT * FROM post
    WHERE (title LIKE '%${search}%'
    OR description LIKE '%${search}%'
    OR summary LIKE '%${search}%'
    OR ver LIKE '%${search}%'
    OR id = ANY (SELECT r.post_id
      FROM relation_post_tag r
      INNER JOIN tag t
      ON t.id = r.tag_id
      AND t.name LIKE '%${search}%'
      AND r.is_deleted = false
      AND t.is_deleted = false))
    AND is_deleted = false
    `,
  );
  return convertSnakeToCamel.keysToCamel(rows);
};

module.exports = { getPostList, getPostById, addPost, updatePost, deletePost, getPostListByUserId, getPostListByUserIds, getPostListByIds, getPostListBySearch };
