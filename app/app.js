const express = require("express");
const { getTopics, getApi } = require("../controllers/topics.controllers");
const { getArticleById, getArticles, getCommentsByArticleId  } = require("../controllers/articles.controllers");
const { serverErrorsHandler, customErrorHandler, errorHandler } = require("./errors");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get('/api/articles', getArticles)

app.get("/api/articles/:article_id", getArticleById);

app.get('/api/articles/:article_id/comments', getCommentsByArticleId)

// errors
app.use(errorHandler)
app.use(customErrorHandler);
// 500 errors
app.use(serverErrorsHandler);

module.exports = app;
