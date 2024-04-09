const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { getAll, getById, getByUser, post, deleteById } = require('../controllers/Reel');

router.get('/', getAll);

router.get('/user/:userId', getByUser);

router.get('/:id', getById);

router.post('/', validateToken, post);

router.delete('/:id', validateToken, deleteById);

module.exports = router;