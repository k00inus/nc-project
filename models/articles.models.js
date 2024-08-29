const db = require("../db/connection");
const {
  checkExists,
  formatQuery,
  formatTopics,
  checkTopics,
} = require("./utils.models");

exports.fetchAllArticles = async (sort_by, order, topic) => {
  let query = {
    text: `
            SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) AS comment_count 
            FROM articles a
            FULL JOIN comments c on c.article_id = a.article_id 
            GROUP BY a.article_id
            ORDER BY a.created_at DESC;
            `,
  };

  if (sort_by) {
    const columnNames = [
      "author",
      "title",
      "article_id",
      "topic",
      "created_at",
      "votes",
      "comment_count",
    ];

    if (columnNames.includes(sort_by)) {
      if (order === undefined) {
        order = "desc";
      }

      query = formatQuery(sort_by, order);
    } else {
      return Promise.reject({ status: 400, msg: "invalid request" });
    }
  } else if (order) {
    if (sort_by === undefined) {
      sort_by = "created_at";
      query = formatQuery(sort_by, order);
    } else {
      return Promise.reject({ status: 400, msg: "invalid request" });
    }
  }
  if (topic) {

    
    const topics = await checkTopics("topics", "slug", topic);
    if (topics) {
      if (sort_by === undefined || order === undefined) {
        order = "desc";
        sort_by = "created_at";

        query = formatTopics(topic, sort_by, order);
      }
    } else {
      return Promise.reject({ status: 400, msg: "invalid request" });
    }
  }

  const result = await db.query(query);

  return result.rows;
};

exports.selectArticleById = (id) => {
  let query = {
    text: `
        SELECT a.author, a.title, a.body, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) AS comment_count 
        FROM articles a
        JOIN comments c on c.article_id = a.article_id 
        WHERE a.article_id = $1
        GROUP BY a.article_id
        ORDER BY a.created_at DESC;`,
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
    await checkExists("articles", "article_id", id);
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
    await checkExists("users", "username", author);
  }
  if (!id) {
    return Promise.reject({ status: 400, msg: "Id required" });
  } else {
    await checkExists("articles", "article_id", id);
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
    await checkExists("articles", "article_id", id);
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
