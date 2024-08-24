const express = require("express");
const { getTopics, getApi } = require("../controllers/topics.controllers");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);




// errors
// 500 errors
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "error found!" });
});

module.exports = app;
