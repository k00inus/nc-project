const db = require("../db/connection");

exports.selectArticleById = (id) => {
  let query = {
    text: `
        SELECT * FROM articles
        WHERE article_id = $1;`,
    values: [id],
  };
  return db.query(query).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }

    return rows;
  });
};
