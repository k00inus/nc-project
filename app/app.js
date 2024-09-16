const express = require("express");
const cors = require("cors");

const {
  serverErrorsHandler,
  customErrorHandler,
  errorHandler,
} = require("./errors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", require("../routes/topics.routes"));

app.use("/api/articles", require("../routes/articles.routes"));

app.use("/api/users", require("../routes/users.routes"));

app.use("/api/comments", require("../routes/comments.routes"));

// errors
app.use(errorHandler);
app.use(customErrorHandler);
// 500 errors
app.use(serverErrorsHandler);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "That page does not exist, check your url" });
});

module.exports = app;
