const { getUsers } = require('../controllers/users.controllers')

const router = require('express').Router()

router.get('/', getUsers)

module.exports = router