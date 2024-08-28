const express = require("express");
const { getTopics, getApi } = require("../controllers/topics.controllers");
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("../controllers/articles.controllers");
const {
  serverErrorsHandler,
  customErrorHandler,
  errorHandler,
} = require("./errors");
const { deleteCommentById } = require("../controllers/comments.controllers");

const app = express();
app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.patch("/api/articles/:article_id", patchArticleById);

app.delete('/api/comments/:comment_id', deleteCommentById)

// errors
app.use(errorHandler);
app.use(customErrorHandler);
// 500 errors
app.use(serverErrorsHandler);

module.exports = app;
