const db = require("../db/connection");
const checkExists = require('./utils.models')

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

exports.fetchCommentsByArticleId = async (id) => {
  if (!id) {
    return Promise.reject({ status: 400, msg: "Id required" });
  } else {
    await checkExists('articles', 'article_id', id)
  }

  const result = await db.query({
    text: `
        SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC;
        `,
    values: [id],
  });
  if (result.rows.length === 0) {
    return [];
  }
  return result.rows;
};

exports.postComment = async (id, author, comment) => {
  if (!comment) {
    return Promise.reject({ status: 422, msg: "Comment is required" });
  }
  if (!author) {
    return Promise.reject({ status: 422, msg: "username is required" });
  } else {
    await checkExists('users', 'username', author)
  }
  if (!id) {
    return Promise.reject({ status: 400, msg: "Id required" });
  } else {
    await checkExists('articles', 'article_id', id)
  }
  const result = await db.query({
    text: `
          INSERT INTO comments (author, body, article_id) 
          VALUES ($1, $2, $3)
          RETURNING *;`,
    values: [author, comment, id],
  });
  return result.rows[0];
};

exports.editArticle = async (id, votes) => {
 
    if (!votes) {
      return Promise.reject({ status: 400, msg: "Input required" });
    }
    if (!id) {
      return Promise.reject({ status: 400, msg: "Id required" });
    } else {
      await checkExists('articles', 'article_id', id)
    }
  
    const result = await db.query({
      text: `
        UPDATE articles 
        SET votes = votes + ($1)
        WHERE article_id = $2
        RETURNING *`,
      values: [votes, id],
    });
    return result.rows[0];
  
};
