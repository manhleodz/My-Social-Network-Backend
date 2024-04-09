const express = require("express");
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { postImages } = require('../controllers/Images');
const { auth } = require('../config/firebase.config');
const multer = require('multer');
const uploadMiddleware = require("../middlewares/multer");

router.post('/', validateToken, uploadMiddleware, postImages);

module.exports = router;