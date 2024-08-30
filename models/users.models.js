const db = require("../db/connection");
const {checkExists} = require('./utils.models')

exports.fetchAllUsers = () => {
  return db.query(`SELECT * FROM users; `).then(({ rows }) => {
    return rows;
  });
};

exports.selectUser = async (username) => {
    
  if (username) {
    await checkExists("users", "username", username);
  } 
  const result = await db.query({
    text: `
            SELECT * FROM users
            WHERE username = $1;
            `,
    values: [username],
  });  
  return result.rows;
};
