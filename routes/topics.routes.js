const { getApi, getTopics, postTopics } = require('../controllers/topics.controllers')

const router = require('express').Router()

router.get('/', getApi)
router.get('/topics', getTopics)
router.post('/topics', postTopics)

module.exports = router