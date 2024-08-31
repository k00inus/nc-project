const db = require("../db/connection");
const { readFile } = require("fs/promises");
const { postCheckExists } = require("./utils.models");
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

exports.postTopic = async (slug, description) => {
  if (!description) {
    return Promise.reject({ status: 422, msg: "Topic description is required" });
  }
 if (!slug) {
    return Promise.reject({ status: 422, msg: "Topic slug is required" });
  } else {
    await postCheckExists("topics", "slug", slug);
  }
 

  const result = await db.query({
    text: `
          INSERT INTO topics (slug, description) 
          VALUES ($1, $2)
          RETURNING *;`,
    values: [slug, description],
  });
  return result.rows[0];
};