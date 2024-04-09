const express = require("express");
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { like } = require('../controllers/LikeComment');
const { getCommentsByPost, newComment, deleteComment } = require('../controllers/Comment');

router.get("/post/:postId", getCommentsByPost);

router.post("/", validateToken, newComment);

router.delete("/:commentId", validateToken, deleteComment);

router.post("/like/:commentId", validateToken, like);

router.post("/reply/", validateToken);

router.delete("/reply/:id", validateToken);

router.put("/reply/:id", validateToken);

module.exports = router;