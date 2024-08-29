const format = require("pg-format");
const db = require("../db/connection");

const checkExists = async (table_name, column_name, id) => {
  const query = format(
    "SELECT EXISTS (SELECT * FROM %I WHERE %I  = %L)",
    table_name,
    column_name,
    id
  );

  const checkIfIdIsValid = await db.query(query);
  if (!checkIfIdIsValid.rows[0].exists) {
    return Promise.reject({
      status: 404,
      msg: `${column_name} ${id} not found`,
    });
  }
};

const formatQuery = (sort_by, order) => {
  let query = format(
    `
    SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) 
    AS comment_count 
    FROM articles a FULL JOIN comments c on c.article_id = a.article_id 
    GROUP BY a.article_id 
    ORDER BY %I %s;
    `,
    sort_by,
    order
  );

  return query;
};

const formatTopics = (topic, sort_by, order) => {

  let query = format(
    `
    SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) 
    AS comment_count 
    FROM articles a FULL JOIN comments c on c.article_id = a.article_id 
    WHERE topic = %L
    GROUP BY a.article_id
    ORDER BY %I %s;
    `,
    topic,
    sort_by,
    order
  );  
  return query;
};

const checkTopics = async (table_name, column_name, topic) => {
  const query = format(
    "SELECT EXISTS (SELECT * FROM %I WHERE %I  = %L)",
    table_name,
    column_name,
    topic
  );

  const checkIfTopicIsValid = await db.query(query);
  if (!checkIfTopicIsValid.rows[0].exists) {
    return Promise.reject({
      status: 404,
      msg: `Topic ${topic} not found`,
    });
  } else {
    return true;
  }
};

module.exports = { checkExists, formatQuery, formatTopics, checkTopics };
