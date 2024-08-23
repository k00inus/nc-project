const express = require("express");
const { getTopics } = require("../controllers/topics.controllers");

const app = express();

app.get("/api/topics", getTopics);






// errors

app.all("*", (req, res) => {
  res.status(404).send({ msg: "That page doesnt exist" });
});
// 500 errors
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "error found!" });
});

module.exports = app;
