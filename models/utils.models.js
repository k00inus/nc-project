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
//console.log(checkIdExists("articles", "article_id", id));

module.exports = checkExists;
