const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/AuthMiddleware');
const { getPost, getPostById, getPostByUser, makeNewPost, deletePost, updatePost, updateLikeNum, updateCommentNumber } = require('../controllers/Post');
const uploadMiddleware = require('../middlewares/multer');

// get all posts
router.get("/", validateToken, getPost);

// get post by id
router.get("/:id", validateToken, getPostById);

//update like num
router.put("/like/:postId", updateLikeNum);

//update like num
router.put("/comment/:postId", updateCommentNumber);

// make new post
router.post("/", validateToken, uploadMiddleware, makeNewPost);

// update post
router.put("/:id", validateToken, updatePost);

// delete post
router.delete("/:postId", validateToken, deletePost);

// get user 's posts
router.get("/profile/user", validateToken, getPostByUser);

module.exports = router;