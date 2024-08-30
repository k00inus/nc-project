const db = require("../db/connection");
const {
  checkExists,
  formatQuery,
  formatTopics,
  checkTopics,
  formatLimit,
} = require("./utils.models");

exports.fetchAllArticles = async (sort_by, order, topic, limit, p) => {
  let query = {
    text: `
            SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) AS comment_count, COUNT(a.article_id) AS total_count, count(*) OVER () AS total_count
            FROM articles a
            FULL JOIN comments c on c.article_id = a.article_id 
            GROUP BY a.article_id
            ORDER BY a.created_at DESC
            LIMIT 10 OFFSET 0;
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

  if (limit) {
    order === undefined ? (order = "desc") : order;
    sort_by === undefined ? (sort_by = "created_at") : sort_by;
    p === undefined ? (p = 1) : p;

    query = formatLimit(topic, sort_by, order, limit, p);

    if (topic) {
      const topics = await checkTopics("topics", "slug", topic);
      if (topics) {
        order === undefined ? (order = "desc") : order;
        sort_by === undefined ? (sort_by = "created_at") : sort_by;
        p === undefined ? (p = 1) : p;

        query = formatLimit(topic, sort_by, order, limit, p);
      }
    }
  }

  if (p) {
    order === undefined ? (order = "desc") : order;
    sort_by === undefined ? (sort_by = "created_at") : sort_by;
    limit === undefined ? (limit = 10) : limit;

    query = formatLimit(topic, sort_by, order, limit, p);

    if (topic) {
      const topics = await checkTopics("topics", "slug", topic);
      if (topics) {
        order === undefined ? (order = "desc") : order;
        sort_by === undefined ? (sort_by = "created_at") : sort_by;
        limit === undefined ? (limit = 10) : limit;

        query = formatLimit(topic, sort_by, order, limit, p);
      }
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

exports.fetchCommentsByArticleId = async (id, limit, p) => {
  if (!id) {
    return Promise.reject({ status: 400, msg: "Id required" });
  } else {
    await checkExists("articles", "article_id", id);
  }
  if (limit ) {
    if (typeof Number(limit) !== 'number') {
      return Promise.reject({ status: 400, msg: "limit  input must be number" });
    } else  if (p === undefined ) {
      p = 1;
    }
  }

  if (p ) {
    if (typeof Number(p) !== 'number') {
      return Promise.reject({ status: 400, msg: "page input must be number" });
    } else  if (limit === undefined ) {
      limit = 10;
    }
  }
   
  const result = await db.query({
    text: `
        SELECT *, CAST(COUNT(*) OVER () as INT) AS total_count FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET ($2 * ($3 - 1));
        `,
    values: [id, limit, p],
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
exports.postArticle = async (author, title, body, topic) => {
  if (!title) {
    return Promise.reject({ status: 422, msg: "article title is required" });
  }
  if (!body) {
    return Promise.reject({ status: 422, msg: "article body is required" });
  }
  if (!author) {
    return Promise.reject({ status: 422, msg: "username is required" });
  } else {
    await checkExists("users", "username", author);
  }
  if (!topic) {
    return Promise.reject({ status: 422, msg: "article topic is required" });
  } else {
    await checkExists("topics", "slug", topic);
  }
  const result = await db.query({
    text: `
          INSERT INTO articles (author, title, body, topic) 
          VALUES ($1, $2, $3, $4)
          RETURNING *, 0 AS comment_count`,
    values: [author, title, body, topic],
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
