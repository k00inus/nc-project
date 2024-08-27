const db = require("../db/connection");

exports.fetchAllArticles = () => {
  let query = {
    text: `
            SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) AS comment_count 
            FROM articles a
            JOIN comments c on c.article_id = a.article_id 
            GROUP BY a.article_id
            ORDER BY a.created_at DESC;`,
  };

  return db.query(query).then(({ rows }) => {
    return rows;
  });
};

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
