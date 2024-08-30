const db = require("../db/connection");
const {checkExists} = require("./utils.models");

exports.deleteComment = async (id) => {
  if (!id) {
    return Promise.reject({ status: 400, msg: "Id required" });
  } else {
    await checkExists("comments", "comment_id", id);
  }

  const result = await db.query({
    text: `
        DELETE FROM comments
        WHERE comment_id  = $1
        RETURNING *;`,
    values: [id],
  });
  return result.rows[0];
};

exports.editComment = async (id, votes) => {
  if (!votes) {
    return Promise.reject({ status: 400, msg: "Input required" });
  }
  if (!id) {
    return Promise.reject({ status: 400, msg: "Id required" });
  } else {
    await checkExists("comments", "comment_id", id);
  }

  const result = await db.query({
    text: `
        UPDATE comments 
        SET votes = votes + ($1)
        WHERE comment_id = $2
        RETURNING *`,
    values: [votes, id],
  });
  return result.rows[0];
};