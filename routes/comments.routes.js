const { deleteCommentById, patchCommentById } = require('../controllers/comments.controllers');

const router = require('express').Router()

router.delete("/:comment_id", deleteCommentById);
router.patch('/:comment_id', patchCommentById)

module.exports = router