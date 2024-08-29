exports.errorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "invalid request" });
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  
  if (err.status && err.msg) {    
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};
exports.serverErrorsHandler = (err, req, res, next) => {
  res.status(500).send({ msg: "error found!" });
};
