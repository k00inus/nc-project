const { deleteComment } = require("../models/comments.models");

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteComment(comment_id).then((comment) => {
    console.log(comment, 'in conts ');
    
    return res.sendStatus(204)
  }).catch(err => {    
    next(err)
  })
};
