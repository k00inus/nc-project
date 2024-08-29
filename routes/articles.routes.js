const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("../controllers/articles.controllers");

const router = require("express").Router();

router.get("/", getArticles);

router.get("/:article_id", getArticleById);

router.get("/:article_id/comments", getCommentsByArticleId);

router.post("/:article_id/comments", postCommentByArticleId);

router.patch("/:article_id", patchArticleById);

module.exports = router