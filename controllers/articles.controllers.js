const { selectArticleById, fetchAllArticles, fetchCommentsByArticleId, postComment, editArticle, } = require("../models/articles.models");

exports.getArticles = (req, res, next) => {
  fetchAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  fetchCommentsByArticleId(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      ;
      
      if (err.code === "22P02") {
        res.status(400).send({ status: 400, msg: "invalid request" });
      }
      next(err);
    });
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  postComment(article_id, username, body)
    .then((comment) => {
      return res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;  

  editArticle(article_id, inc_votes)
    .then((article) => {
      return res.status(200).send({ article });
    })
    .catch((err) => {      
      next(err);
    });
};