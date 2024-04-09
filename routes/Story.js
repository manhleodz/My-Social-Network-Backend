const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { getAll, getById, getByUser, post, deleteById, getHomeStory } = require('../controllers/Story');
const uploadMiddleware = require('../middlewares/multer');

router.get('/', getAll);

router.get('/home', getHomeStory);

router.get('/user/:userId', getByUser);

router.get('/:id', getById);

router.post('/', validateToken, uploadMiddleware, post);

router.delete('/:id', validateToken, deleteById);

module.exports = router;