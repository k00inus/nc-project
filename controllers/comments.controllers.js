const { deleteComment, editComment } = require("../models/comments.models");

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteComment(comment_id).then((comment) => {    
    res.sendStatus(204)
  }).catch(err => {    
    next(err)
  })
};

exports.patchCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;  

  editComment(comment_id, inc_votes)
    .then((comment) => {
      return res.status(200).send({ comment });
    })
    .catch((err) => {  
         
      next(err);
    });
};