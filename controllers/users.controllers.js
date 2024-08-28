const { fetchAllUsers } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  fetchAllUsers()
    .then((users) => {
      return res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};
