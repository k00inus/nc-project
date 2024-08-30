const { getUsers, getUserByUsername } = require('../controllers/users.controllers')

const router = require('express').Router()

router.get('/', getUsers)
router.get('/:username', getUserByUsername)

module.exports = router