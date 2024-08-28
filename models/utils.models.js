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
  
  

  console.log(order, 'in utis');
  
  let query = format(
    `
    SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, CAST(COUNT(c.article_id) AS INT) 
    AS comment_count 
    FROM articles a JOIN comments c on c.article_id = a.article_id 
    GROUP BY a.article_id 
    ORDER BY %I %s;
    `,
    sort_by,
    order
  );

  return query
};



module.exports = {checkExists, formatQuery}
