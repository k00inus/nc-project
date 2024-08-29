const { getApi, getTopics } = require('../controllers/topics.controllers')

const router = require('express').Router()

router.get('/', getApi)
router.get('/topics', getTopics)

module.exports = router