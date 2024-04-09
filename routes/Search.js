const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { newSearch, deleteSearch, result, topResult, filterPost } = require('../controllers/Search');

router.get('/top', validateToken, topResult);

router.get('/', validateToken, result);

router.post('/', validateToken, newSearch);

router.get('/posts', validateToken, filterPost);

router.delete('/:id', validateToken, deleteSearch);

module.exports = router;