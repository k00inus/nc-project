const { fetchAllUsers, selectUser } = require("../models/users.models");

exports.getUsers = (req, res, next) => {
  fetchAllUsers()
    .then((users) => {
      return res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUserByUsername = (req, res, next) => {
  const { username } = req.params;  
  selectUser(username)
    .then((user) => {      
      return res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};