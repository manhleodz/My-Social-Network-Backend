const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { getByUser, seenNotifications, sendNotification, deleteNotification } = require('../controllers/Notifications');

router.get('/', validateToken, getByUser);

router.post('/', validateToken, sendNotification);

router.post('/seen', validateToken, seenNotifications);

router.delete('/:id', validateToken, deleteNotification);

module.exports = router;