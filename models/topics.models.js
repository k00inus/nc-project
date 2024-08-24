const db = require("../db/connection");
const { readFile } = require("fs/promises");
const file = `${__dirname}/../endpoints.json`;

exports.fetchApis = () => {
  return readFile(file, "utf-8").then((apis) => {
    return JSON.parse(apis);
  });
};

exports.selectTopics = () => {
  let queryString = `
          SELECT * FROM topics;`;

  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};
