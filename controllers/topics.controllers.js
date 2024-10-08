const { selectTopics, fetchApis, postTopic } = require("../models/topics.models");

exports.getApi = (req, res, next) => {
  fetchApis()
    .then((apis) => {
      res.status(200).send({ apis });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postTopics = (req, res, next) => {
  const { slug, description } = req.body;
  postTopic(slug, description)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
};