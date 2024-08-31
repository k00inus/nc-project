const {
  getArticles,
  getArticleById,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  postArticle,
  deleteArticleById,
} = require("../controllers/articles.controllers");

const router = require("express").Router();

router.get("/", getArticles);

router.get("/:article_id", getArticleById);

router.get("/:article_id/comments", getCommentsByArticleId);

router.post("/", postArticle);

router.post("/:article_id/comments", postCommentByArticleId);

router.patch("/:article_id", patchArticleById);

router.delete("/:article_id", deleteArticleById);

module.exports = router;
