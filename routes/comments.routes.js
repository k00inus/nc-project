const { deleteCommentById } = require('../controllers/comments.controllers');

const router = require('express').Router()

router.delete("/:comment_id", deleteCommentById);

module.exports = router