const express = require("express");
const { getTopics, getApi } = require("../controllers/topics.controllers");
const { getArticleById } = require("../controllers/articles.controllers");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

// errors
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "invalid request" });
  }
});
// 500 errors
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "error found!" });
});

module.exports = app;
